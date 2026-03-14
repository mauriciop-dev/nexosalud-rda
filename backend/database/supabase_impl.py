from .base import BaseDatabase
from supabase import create_client, Client
import os
import json
from typing import Optional


class SupabaseDatabase(BaseDatabase):
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        self.client: Client = create_client(url, key)

    async def save_rda(self, data: dict):
        # Data format expected by current main.py logic
        return self.client.table("envios_rda").insert(data).execute()

    async def get_recent_rda(self, tenant_id: Optional[str] = None, limit: int = 5):
        query = self.client.table("envios_rda").select("*")
        if tenant_id:
            query = query.eq("tenant_id", tenant_id)
        return query.order("created_at", desc=True).limit(limit).execute()

    async def save_audit_log(self, data: dict):
        return self.client.table("audit_logs").insert(data).execute()

    async def upsert_patient(self, patient_data: dict) -> str:
        """Crea o actualiza un paciente y devuelve su ID."""
        result = (
            self.client.table("pacientes")
            .upsert(patient_data, on_conflict="documento,tipo_documento")
            .execute()
        )
        if result.data:
            return result.data[0]["id"]
        return ""

    async def save_rda_record(self, rda_data: dict):
        """Guarda un registro RDA vinculado a un paciente, incluyendo logs de MinSalud."""
        return self.client.table("envios_rda").insert(rda_data).execute()

    async def get_recent_records_with_patients(
        self, tenant_id: Optional[str] = None, limit: int = 10
    ):
        """Obtiene registros con JOIN a pacientes."""
        query = self.client.table("envios_rda").select("*, pacientes(*)")
        if tenant_id:
            query = query.eq("tenant_id", tenant_id)
        return query.order("created_at", desc=True).limit(limit).execute()
