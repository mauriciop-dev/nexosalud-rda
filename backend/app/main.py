from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import json
import os

from app.schemas import RDAInput
from app.services.transformer import transform_to_fhir
from app.services.validator import FHIRValidator
from app.services.mock_data import (
    validate_token,
    check_patient_in_evol,
    check_org_exists,
    store_rda,
    get_rda,
    load_sandbox_data
)

app = FastAPI(title="NexoSalud API", version="0.1.0")
security = HTTPBearer()

# CORS para frontend Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción: ["https://nexosalud-rda.vercel.app"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar datos de sandbox al iniciar
load_sandbox_data()

# Mock IHCE Gateway
MOCK_RDA_ID_COUNTER = 1000


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}


@app.post("/api/v1/rda/send")
async def send_rda(rda_data: dict, credentials: HTTPAuthCredentials = Depends(security)):
    """
    Endpoint principal: IPS envía RDA en JSON simple
    
    Retorna:
    {
        "status": "accepted|rejected|pending",
        "rda_id": "RDA-001234",
        "message": "RDA enviado exitosamente",
        "details": {...}
    }
    """
    global MOCK_RDA_ID_COUNTER
    
    try:
        # 1. Validar credenciales
        token = credentials.credentials
        if not validate_token(token):
            raise HTTPException(status_code=401, detail="Token inválido")
        
        # 2. Validar input JSON vs schema
        rda_input = RDAInput(**rda_data)  # Pydantic validation automática
        
        # 3. Transformar a FHIR Bundle
        fhir_bundle = transform_to_fhir(rda_input)
        
        # 4. Validar Bundle (5 reglas IHCE)
        validator = FHIRValidator()
        validation_result = validator.validate(fhir_bundle)
        if not validation_result["is_valid"]:
            return {
                "status": "rejected",
                "message": "Validación fallida",
                "errors": validation_result["errors"]
            }
        
        # 5. Verificar organización habilitada
        org_habilitacion = rda_input.encuentro.get("organizacion", {}).get("numero_habilitacion")
        if org_habilitacion and not check_org_exists(org_habilitacion):
            return {
                "status": "rejected",
                "message": f"Organización {org_habilitacion} no habilitada",
                "errors": ["Organización no encontrada en REPS"]
            }
        
        # 6. Verificar paciente en EVOL
        tipo_id = rda_input.paciente.tipo_id
        numero_id = rda_input.paciente.numero_id
        if not check_patient_in_evol(tipo_id, numero_id):
            return {
                "status": "rejected",
                "message": f"Paciente {tipo_id}-{numero_id} no encontrado en EVOL",
                "errors": ["Paciente no existe en registro nacional"]
            }
        
        # 7. Generar ID y guardar
        rda_id = f"RDA-{MOCK_RDA_ID_COUNTER:06d}"
        MOCK_RDA_ID_COUNTER += 1
        
        store_rda(rda_id, fhir_bundle, rda_input.dict())
        
        return {
            "status": "accepted",
            "rda_id": rda_id,
            "message": "RDA enviado exitosamente",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except ValueError as e:
        return {"status": "rejected", "message": str(e), "errors": [str(e)]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/rda/{rda_id}")
async def get_rda_status(rda_id: str, credentials: HTTPAuthCredentials = Depends(security)):
    """Consultar estado de un RDA enviado"""
    if not validate_token(credentials.credentials):
        raise HTTPException(status_code=401)
    
    rda = get_rda(rda_id)
    if not rda:
        raise HTTPException(status_code=404, detail="RDA no encontrado")
    
    return {
        "rda_id": rda_id,
        "status": rda["status"],  # accepted|pending|rejected
        "created_at": rda["created_at"],
        "last_update": rda["last_update"],
        "ihce_response": rda.get("ihce_response", None)
    }


@app.post("/api/v1/patient/validate")
async def validate_patient(patient_data: dict, credentials: HTTPAuthCredentials = Depends(security)):
    """
    IPS valida paciente ANTES de enviar RDA
    Mock: retorna True si paciente está en sandbox
    """
    if not validate_token(credentials.credentials):
        raise HTTPException(status_code=401)
    
    tipo_id = patient_data.get("tipo_id")
    numero_id = patient_data.get("numero_id")
    
    if not tipo_id or not numero_id:
        raise HTTPException(status_code=400, detail="tipo_id y numero_id requeridos")
    
    is_valid = check_patient_in_evol(tipo_id, numero_id)
    
    return {
        "valid": is_valid,
        "message": "Paciente encontrado en EVOL" if is_valid else "Paciente no encontrado",
        "patient_id": f"{tipo_id}-{numero_id}" if is_valid else None
    }


@app.get("/api/v1/sandbox/patients")
async def list_sandbox_patients(credentials: HTTPAuthCredentials = Depends(security)):
    """Listar pacientes de prueba disponibles en sandbox"""
    if not validate_token(credentials.credentials):
        raise HTTPException(status_code=401)
    
    import json
    with open("sandbox/patients.json") as f:
        patients = json.load(f)
    return {"patients": patients}


@app.get("/api/v1/sandbox/organizations")
async def list_sandbox_organizations(credentials: HTTPAuthCredentials = Depends(security)):
    """Listar organizaciones de prueba disponibles en sandbox"""
    if not validate_token(credentials.credentials):
        raise HTTPException(status_code=401)
    
    import json
    with open("sandbox/organizations.json") as f:
        orgs = json.load(f)
    return {"organizations": orgs}