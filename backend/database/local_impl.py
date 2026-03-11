from .base import BaseDatabase
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import json
from datetime import datetime

class LocalPostgresDatabase(BaseDatabase):
    def __init__(self):
        self.conn_url = os.environ.get("DATABASE_URL")
        # Ensure the table exists locally
        self._initialize_db()

    def _initialize_db(self):
        conn = psycopg2.connect(self.conn_url)
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS envios_rda (
                    id SERIAL PRIMARY KEY,
                    tenant_id TEXT,
                    fhir_payload JSONB,
                    codigo_vida TEXT,
                    estado_envio TEXT,
                    archivo_original_url TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)
        conn.commit()
        conn.close()

    async def save_rda(self, data: dict):
        conn = psycopg2.connect(self.conn_url)
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO envios_rda (tenant_id, fhir_payload, codigo_vida, estado_envio, archivo_original_url)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING *;
            """, (
                data.get("tenant_id"),
                json.dumps(data.get("fhir_payload")),
                data.get("codigo_vida"),
                data.get("estado_envio"),
                data.get("archivo_original_url")
            ))
        conn.commit()
        conn.close()
        return {"status": "success"}

    async def get_recent_rda(self, tenant_id: str = None, limit: int = 5):
        conn = psycopg2.connect(self.conn_url)
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if tenant_id:
                cur.execute("SELECT * FROM envios_rda WHERE tenant_id = %s ORDER BY created_at DESC LIMIT %s", (tenant_id, limit))
            else:
                cur.execute("SELECT * FROM envios_rda ORDER BY created_at DESC LIMIT %s", (limit,))
            res = cur.fetchall()
        conn.close()
        
        # Convert datetime objects to string for JSON compatibility
        for row in res:
            if row.get("created_at"):
                row["created_at"] = row["created_at"].isoformat()
        
        class MockResponse:
            def __init__(self, data):
                self.data = data
        
        return MockResponse(res)
