import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# We need the connection string, which is standard PostgreSQL URL
database_url = os.environ.get("DATABASE_URL")

sql_commands = """
-- 1. Añadir el tenant_id a la tabla envios_rda si no existe
ALTER TABLE public.envios_rda ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES auth.users(id);

-- 2. Habilitar RLS en la tabla envios_rda
ALTER TABLE public.envios_rda ENABLE ROW LEVEL SECURITY;

-- 3. Crear política para que el RLS permita ver/insertar/actualizar SOLO si el tenant_id coincide con el auth.uid()
-- (Nota: Para administradores (rol service_role) RLS es bypass por defecto)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Permitir a cada IPS ver/manejar solo sus RDA' AND tablename = 'envios_rda'
    ) THEN
        CREATE POLICY "Permitir a cada IPS ver/manejar solo sus RDA" ON public.envios_rda
            FOR ALL 
            USING (auth.uid() = tenant_id)
            WITH CHECK (auth.uid() = tenant_id);
    END IF;
END
$$;
"""

try:
    conn = psycopg2.connect(database_url)
    conn.autocommit = True
    cur = conn.cursor()
    
    print("Ejecutando DDL para multí-tenant y RLS en Supabase...")
    cur.execute(sql_commands)
    print("✅ Modificaciones de BD exitosas. Tabla 'envios_rda' ahora tiene 'tenant_id' y RLS estricto.")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"❌ Error al ejecutar DDL: {e}")
