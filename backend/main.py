from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.extractor_ai import ExtractorAI
from services.fhir_formatter import FHIRFormatter
from services.minsalud_client import MinSaludClient
from database import get_db
from core.license_validator import LicenseValidator
import os
import json

from typing import Optional

app = FastAPI(title="NexoSalud RDA API")

# Configuración de CORS para permitir peticiones desde el Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, usa ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicialización de Servicios
extractor = ExtractorAI()
formatter = FHIRFormatter()
minsalud = MinSaludClient()
db = get_db()
license_val = LicenseValidator()

class ExtractRequest(BaseModel):
    text: str
    tenant_id: Optional[str] = None
    motor: Optional[str] = "llama3.1"
    license_key: Optional[str] = None # Required for enterprise mode
    ips_name: Optional[str] = None    # Required for enterprise mode

@app.get("/")
async def root():
    return {"message": "NexoSalud RDA API is running"}

@app.post("/extract-rda")
async def extract_rda(payload: ExtractRequest):
    if not payload.text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    try:
        # 1. Extracción con IA (Llama 3.1 o Groq)
        print(f"Paso 1: Extrayendo datos con IA ({payload.motor})...")
        extracted_data = await extractor.extract_data(payload.text, motor=payload.motor)
        if "error" in extracted_data:
            raise Exception(f"IA Error: {extracted_data['error']}")

        # 2. Formateo a Estándar HL7 FHIR R4 (Resolución 1888)
        print("Paso 2: Generando Bundle FHIR...")
        fhir_json = formatter.format_rda(extracted_data)

        # 3. Envío al Bus de Interoperabilidad (MinSalud / VIDA)
        print("Paso 3: Enviando a MinSalud...")
        result_minsalud = await minsalud.send_rda(fhir_json)
        
        # 4. Validar Licencia (solo si es modo enterprise)
        if os.environ.get("APP_MODE") == "enterprise":
            print(f"Paso 4: Validando Licencia para {payload.ips_name}...")
            if not license_val.validate_license(payload.ips_name, payload.license_key):
                raise HTTPException(status_code=403, detail="Licencia Empresarial Inválida o Expirada")

        # 5. Persistencia para Auditoría y Dashboard
        print(f"Paso 5: Guardando en Base de Datos para tenant: {payload.tenant_id}...")
        
        insert_data = {
            "fhir_payload": json.loads(fhir_json),
            "codigo_vida": result_minsalud["codigo_vida"],
            "estado_envio": "validado",
            "archivo_original_url": "upload_manual_text"
        }
        
        if payload.tenant_id:
            insert_data["tenant_id"] = payload.tenant_id

        await db.save_rda(insert_data)

        return {
            "status": "success",
            "codigo_vida": result_minsalud["codigo_vida"],
            "fhir_bundle": json.loads(fhir_json),
            "raw_extraction": extracted_data
        }

    except Exception as e:
        print(f"Error en Pipeline RDA: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recent-rda")
async def get_recent_rda(tenant_id: Optional[str] = None):
    try:
        res = await db.get_recent_rda(tenant_id=tenant_id)
        return {"status": "success", "data": res.data}
    except Exception as e:
        print(f"Error al obtener envíos: {e}")
        raise HTTPException(status_code=500, detail=str(e))
