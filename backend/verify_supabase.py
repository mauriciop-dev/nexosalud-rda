import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

def verify():
    try:
        # Intentar listar pacientes
        response = supabase.table("pacientes").select("*").limit(1).execute()
        print("✅ Conexión exitosa. La tabla 'pacientes' existe.")
    except Exception as e:
        print(f"❌ Error o tabla no encontrada: {e}")
        print("Sugerencia: Ejecuta el script SQL de migración en el Dashboard de Supabase.")

if __name__ == "__main__":
    verify()
