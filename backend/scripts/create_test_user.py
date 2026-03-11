from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

email = "admin@nexosalud.com"
password = "NexoSalud2025!"

try:
    auth_res = supabase.auth.admin.create_user(
        attributes={
            "email": email,
            "password": password,
            "email_confirm": True
        }
    )
    print(f"Usuario de prueba creado: {email}")
    print(f"Password: {password}")
except Exception as e:
    print(f"Error o usuario ya existe: {e}")
