import os
import json
import random
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

# Cargar variables de entorno
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Configuración del Inquilino (Dr. Ricardo Rivas)
TENANT_ID = "00000000-0000-0000-0000-000000000001"
USER_ID = TENANT_ID  # Simulado para auditoría


def generate_mock_data():
    print(f"🚀 Iniciando generación de datos para Inquilino: {TENANT_ID}...")

    # 1. Definir Pacientes Repetidos (3 pacientes clave)
    core_patients = [
        {
            "tipo_documento": "CC",
            "documento": "1018456789",
            "nombre_completo": "Evaristo Thomas",
            "fecha_nacimiento": "1975-05-12",
            "sexo": "M",
            "tenant_id": TENANT_ID,
        },
        {
            "tipo_documento": "CC",
            "documento": "52345678",
            "nombre_completo": "Elena García",
            "fecha_nacimiento": "1988-11-20",
            "sexo": "F",
            "tenant_id": TENANT_ID,
        },
        {
            "tipo_documento": "CC",
            "documento": "80123456",
            "nombre_completo": "Juan Pérez",
            "fecha_nacimiento": "1960-01-15",
            "sexo": "M",
            "tenant_id": TENANT_ID,
        },
    ]

    # Inserción de pacientes core
    patient_ids = []
    for p in core_patients:
        res = (
            supabase.table("pacientes")
            .upsert(p, on_conflict="documento,tipo_documento")
            .execute()
        )
        patient_ids.append(res.data[0]["id"])
        print(f"✅ Paciente upsert: {p['nombre_completo']}")

    # Generar pacientes adicionales hasta llegar a 10 pacientes totales si es necesario,
    # pero para el ejercicio de 20 registros, usaremos estos 3 con mucha frecuencia.

    # 2. Generar 20 Registros RDA
    tipos = ["Urgencias", "Consulta Externa", "Hospitalización"]
    estados = ["Exitoso", "Error", "Pendiente"]

    for i in range(20):
        # Seleccionar paciente (priorizar los 3 core para probar historial)
        pid = random.choice(patient_ids)
        tipo = random.choices(tipos, weights=[40, 40, 20])[0]
        estado = random.choices(estados, weights=[75, 15, 10])[0]

        # Fecha aleatoria en los últimos 30 días
        days_ago = random.randint(0, 30)
        fecha = (datetime.now() - timedelta(days=days_ago)).isoformat()

        # Mock FHIR Bundle
        mock_fhir = {
            "resourceType": "Bundle",
            "type": "transaction",
            "entry": [
                {
                    "resource": {
                        "resourceType": "Patient",
                        "name": [{"text": "Mock Name"}],
                    }
                }
            ],
        }

        codigo_vida = (
            f"VIDA-{uuid.uuid4().hex[:8].upper()}" if estado == "Exitoso" else None
        )

        rda_record = {
            "paciente_id": pid,
            "tipo_rda": tipo,
            "fhir_payload": mock_fhir,
            "codigo_vida": codigo_vida,
            "estado_envio": estado,
            "tenant_id": TENANT_ID,
        }

        res_rda = supabase.table("envios_rda").insert(rda_record).execute()
        rda_id = res_rda.data[0]["id"]

        # 3. Generar Audit Log para cada inserción
        audit_log = {
            "usuario_id": USER_ID,
            "accion": "Carga",
            "patient_id": pid,
            "ip_address": f"192.168.1.{random.randint(1, 254)}",
            "details": {"rda_id": rda_id, "motor": "MockGenerator"},
            "tenant_id": TENANT_ID,
            "timestamp": datetime.now().isoformat(),
        }
        supabase.table("audit_logs").insert(audit_log).execute()

        print(
            f"  [{i + 1}/20] RDA {tipo} - Estado: {estado} (Paciente ID: {pid[:8]}...)"
        )

    print("\n✨ Carga de datos completada exitosamente.")


if __name__ == "__main__":
    generate_mock_data()
