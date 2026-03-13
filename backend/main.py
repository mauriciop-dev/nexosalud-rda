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

# Identificador por defecto para Dr. Ricardo Rivas (Simulado/Tenant)
DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001"

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
    license_key: Optional[str] = None  # Required for enterprise mode
    ips_name: Optional[str] = None  # Required for enterprise mode
    reps_code: Optional[str] = "110011234501"  # Mock REPS (12 digits)
    patient_id_type: Optional[str] = "CC"  # Default to CC


class AuditLogRequest(BaseModel):
    user_email: Optional[str] = None
    action: str
    resource: Optional[str] = None
    details: Optional[dict] = None
    tenant_id: Optional[str] = None


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
                raise HTTPException(
                    status_code=403, detail="Licencia inválida o expirada"
                )

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
            patient_id_type=payload.patient_id_type,
        )

        # 2.1 Validación FHIR (Guía Vulcano)
        validation_results = validator.validate_bundle(fhir_json)
        if not validation_results["valid"]:
            print(f"⚠️ Alerta de Validación FHIR: {validation_results['errors']}")
        else:
            print("✅ Bundle validado exitosamente contra perfil Vulcano.")

        # 3. Envío al Bus de Interoperabilidad (MinSalud / VIDA)
        print("Paso 3: Enviando a MinSalud...")
        tipo_atencion = extracted_data.get("tipo_atencion", "paciente")
        result_minsalud = await minsalud.send_rda(fhir_json, type_rda=tipo_atencion)

        # 4. Persistencia en Base de Datos (Supabase)
        print("Paso 4: Persistencia en Tablas Patients & RDA_Records...")
        # Aseguramos un tenant_id base para cumplir con la segregación
        tid = (
            payload.tenant_id
            if payload.tenant_id and payload.tenant_id != "default"
            else DEFAULT_TENANT_ID
        )

        # 4.1 Upsert Patient
        patient_data = {
            "tipo_documento": payload.patient_id_type,
            "documento": str(extracted_data.get("patient_id", "00000000")),
            "nombre_completo": extracted_data.get("patient_name", "Desconocido"),
            "tenant_id": tid,
        }
        # Para evitar problemas de tipos, nos aseguramos que patient_id_type y patient_id existan
        patient_id = await db.upsert_patient(patient_data)

        # 4.2 Save RDA Record vinculado al id del paciente
        estado_envio = (
            "Exitoso" if result_minsalud.get("status") == "success" else "Error"
        )

        rda_record = {
            "patient_id": patient_id,
            "tipo_rda": tipo_atencion,
            "json_fhir": json.loads(fhir_json),
            "codigo_vida": result_minsalud.get("codigo_vida"),
            "request_id": result_minsalud.get("request_id"),
            "operation_outcome": result_minsalud.get("operation_outcome"),
            "estado_envio": estado_envio,
            "tenant_id": tid,
        }
        await db.save_rda_record(rda_record)

        # Mantenemos compatibilidad con el registro antiguo si es necesario (opcional)
        # await db.save_rda(db_record)

        return {
            "status": result_minsalud.get("status"),
            "codigo_vida": result_minsalud.get("codigo_vida"),
            "request_id": result_minsalud.get("request_id"),
            "operation_outcome": result_minsalud.get("operation_outcome"),
            "fhir_bundle": json.loads(fhir_json),
        }

    except Exception as e:
        print(f"❌ Error en Pipeline: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error en Pipeline: {str(e)}")


@app.get("/recent-rda")
async def get_recent_rda(tenant_id: Optional[str] = None):
    try:
        response = await db.get_recent_rda(tenant_id=tenant_id)

        # Extraemos la lista de datos del objeto de respuesta de Supabase
        records = response.data if hasattr(response, "data") else response

        return {"status": "success", "data": records}
    except Exception as e:
        print(f"❌ Error obteniendo registros: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/dashboard/recent-records")
async def dashboard_recent_records(tenant_id: Optional[str] = None):
    """
    Endpoint optimizado para el Dashboard: devuelve RDA joined con Patients.
    """
    try:
        tid = tenant_id if tenant_id and tenant_id != "default" else DEFAULT_TENANT_ID
        response = await db.get_recent_records_with_patients(tenant_id=tid)

        # Manejo robusto de la respuesta de Supabase
        records = []
        if hasattr(response, "data"):
            records = response.data
        elif isinstance(response, list):
            records = response
        elif isinstance(response, dict) and "data" in response:
            records = response["data"]

        return {"status": "success", "data": records}
    except Exception as e:
        print(f"❌ Error en dashboard API: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/audit-log")
async def save_audit_log(payload: AuditLogRequest):
    try:
        tid = (
            payload.tenant_id
            if payload.tenant_id and payload.tenant_id != "default"
            else None
        )
        log_data = {
            "user_email": payload.user_email,
            "action": payload.action,
            "resource": payload.resource,
            "details": payload.details,
            "tenant_id": tid,
        }
        await db.save_audit_log(log_data)
        return {"status": "success"}
    except Exception as e:
        print(f"❌ Error guardando auditoría: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/status/minsalud")
async def check_minsalud_status():
    """
    Endpoint para verificar la conexión con el Ministerio de Salud.
    Retorna el estado del token de acceso.
    """
    try:
        # Verificar si las credenciales están configuradas
        if (
            not minsalud.tenant_id
            or not minsalud.client_id
            or not minsalud.client_secret
        ):
            return {
                "status": "not_configured",
                "message": "Ministerio: Credenciales no configuradas",
                "token_obtained": False,
            }

        token = await minsalud._get_access_token()
        return {
            "status": "connected",
            "message": "Ministerio: Conectado",
            "token_obtained": True,
        }
    except Exception as e:
        return {
            "status": "disconnected",
            "message": "Ministerio: Desconectado",
            "error": str(e),
        }
