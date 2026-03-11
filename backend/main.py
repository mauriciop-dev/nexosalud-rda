from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.extractor_ai import ExtractorAI
from services.fhir_formatter import FHIRFormatter
from services.minsalud_client import MinSaludClient
from services.signature_manager import SignatureManager
from database import get_db
from core.license_validator import LicenseValidator
from utils.fhir_validator import FHIRValidator
import os
import json
from typing import Optional

app = FastAPI(title="NexoSalud RDA API")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicialización de Servicios
extractor = ExtractorAI()
formatter = FHIRFormatter()
validator = FHIRValidator()
minsalud = MinSaludClient()
signature_manager = SignatureManager()
db = get_db()
license_val = LicenseValidator()

class ExtractRequest(BaseModel):
    text: str
    tenant_id: Optional[str] = None
    motor: Optional[str] = "llama3.1"
    license_key: Optional[str] = None # Required for enterprise mode
    ips_name: Optional[str] = None    # Required for enterprise mode
    reps_code: Optional[str] = "110011234501" # Mock REPS (12 digits)
    patient_id_type: Optional[str] = "CC"     # Default to CC

@app.get("/")
async def root():
    return {"status": "ok", "message": "NexoSalud RDA Backend is running"}

@app.get("/patient-summary/{patient_id}")
async def get_patient_summary(patient_id: str):
    """
    Endpoint para consulta bidireccional de historia clínica nacional.
    """
    try:
        print(f"Paso 1: Solicitando resumen nacional para {patient_id}...")
        summary = await minsalud.get_patient_summary(patient_id)
        return summary
    except Exception as e:
        print(f"❌ Error consultando resumen: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-rda")
async def extract_rda(payload: ExtractRequest):
    try:
        # 0. Validar Licencia (solo en modo Enterprise)
        app_mode = os.environ.get("APP_MODE", "saas")
        if app_mode == "enterprise":
            if not payload.license_key or not license_val.validate(payload.license_key):
                raise HTTPException(status_code=403, detail="Licencia inválida o expirada")

        # 1. Extracción con IA
        print(f"Paso 1: Extrayendo datos con IA ({payload.motor})...")
        extracted_data = await extractor.extract_data(payload.text, motor=payload.motor)
        
        if "error" in extracted_data:
            raise Exception(f"IA Error: {extracted_data['error']}")

        # 2. Formateo a Estándar HL7 FHIR R4 (Resolución 1888 / Vulcano)
        print("Paso 2: Generando Bundle FHIR Transaccional...")
        fhir_json = formatter.format_rda(
            extracted_data, 
            reps_code=payload.reps_code,
            patient_id_type=payload.patient_id_type
        )

        # 2.1 Validación FHIR (Guía Vulcano)
        validation_results = validator.validate_bundle(fhir_json)
        if not validation_results["valid"]:
            print(f"⚠️ Alerta de Validación FHIR: {validation_results['errors']}")
        else:
            print("✅ Bundle validado exitosamente contra perfil Vulcano.")

        # 3. Envío al Bus de Interoperabilidad (MinSalud / VIDA)
        print("Paso 3: Enviando a MinSalud...")
        result_minsalud = await minsalud.send_rda(fhir_json)

        # 4. Persistencia en Base de Datos (Supabase o Local)
        print("Paso 4: Guardando en Base de Datos...")
        # Aseguramos que tenant_id sea un UUID válido o None para evitar errores en BD
        tid = payload.tenant_id if payload.tenant_id and payload.tenant_id != "default" else None
        
        db_record = {
            "tenant_id": tid,
            "patient_name": extracted_data.get("patient_name", "Desconocido"),
            "patient_doc_number": str(extracted_data.get("patient_id", "00000000")),
            "codigo_vida": result_minsalud.get("codigo_vida"),
            "fhir_bundle": json.loads(fhir_json),
            "fhir_payload": json.loads(fhir_json), # Dual-populate for backward compatibility
            "raw_text": payload.text
        }
        await db.save_rda(db_record)

        return {
            "status": "success",
            "codigo_vida": result_minsalud.get("codigo_vida"),
            "fhir_bundle": json.loads(fhir_json)
        }

    except Exception as e:
        print(f"❌ Error en Pipeline: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error en Pipeline: {str(e)}")

@app.get("/recent-rda")
async def get_recent_rda(tenant_id: Optional[str] = None):
    try:
        response = await db.get_recent_rda(tenant_id=tenant_id)
        
        # Extraemos la lista de datos del objeto de respuesta de Supabase
        records = response.data if hasattr(response, 'data') else response
        
        return {
            "status": "success",
            "data": records
        }
    except Exception as e:
        print(f"❌ Error obteniendo registros: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
