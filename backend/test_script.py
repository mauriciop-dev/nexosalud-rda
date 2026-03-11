import os, json
from supabase import create_client

supabase = create_client(os.environ.get('SUPABASE_URL'), os.environ.get('SUPABASE_SERVICE_ROLE_KEY'))
res = supabase.table('envios_rda').select('*').order('created_at', desc=True).limit(1).execute()
payload = res.data[0]['fhir_payload']

with open('/app/test_output.json', 'w', encoding='utf-8') as f:
    json.dump(payload, f, indent=2)
print("Saved to /app/test_output.json")
