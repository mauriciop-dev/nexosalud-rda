import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

db_url = os.environ.get("DATABASE_URL")

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    sql = """
    CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        user_email TEXT,
        action TEXT NOT NULL,
        resource TEXT,
        details JSONB,
        tenant_id UUID
    );

    -- Enable RLS
    ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

    -- Simple policy for authenticated users
    DO $$ 
    BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable insert for all users' AND tablename = 'audit_logs') THEN
            CREATE POLICY "Enable insert for all users" ON audit_logs FOR INSERT WITH CHECK (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable select for all users' AND tablename = 'audit_logs') THEN
            CREATE POLICY "Enable select for all users" ON audit_logs FOR SELECT USING (true);
        END IF;
    END $$;
    """
    
    print("Ejecutando migración...")
    cur.execute(sql)
    conn.commit()
    print("✅ Tabla audit_logs creada exitosamente.")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"❌ Error: {str(e)}")
