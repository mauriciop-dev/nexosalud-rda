from .base import BaseDatabase
from supabase import create_client, Client
import os
import json

class SupabaseDatabase(BaseDatabase):
    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        self.client: Client = create_client(url, key)

    async def save_rda(self, data: dict):
        # Data format expected by current main.py logic
        return self.client.table("envios_rda").insert(data).execute()

    async def get_recent_rda(self, tenant_id: str = None, limit: int = 5):
        query = self.client.table("envios_rda").select("*")
        if tenant_id:
            query = query.eq("tenant_id", tenant_id)
        return query.order("created_at", desc=True).limit(limit).execute()
