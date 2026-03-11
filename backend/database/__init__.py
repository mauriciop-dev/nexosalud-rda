import os
from .supabase_impl import SupabaseDatabase
from .local_impl import LocalPostgresDatabase

def get_db():
    app_mode = os.environ.get("APP_MODE", "saas").lower()
    if app_mode == "enterprise":
        print("[Database] Initializing Local PostgreSQL (Enterprise Mode)")
        return LocalPostgresDatabase()
    else:
        print("[Database] Initializing Supabase (SaaS Mode)")
        return SupabaseDatabase()
