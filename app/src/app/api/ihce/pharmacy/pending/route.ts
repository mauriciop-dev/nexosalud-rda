
import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/insforge';

export async function GET(request: Request) {
  const apiKey = request.headers.get('X-Nexo-API-Key');
  if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
  
  const keyData = await validateApiKey(apiKey);
  if (!keyData || keyData.status !== 'active') {
    return NextResponse.json({ error: "Invalid or inactive API Key" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const patient_id = searchParams.get('patient_id');
  
  if (!patient_id) return NextResponse.json({ error: "patient_id query param required" }, { status: 400 });

  // Mock response: Prescriptions that have NOT been fully dispensed
  return NextResponse.json({
    patient_id: patient_id,
    pending_prescriptions: [
      { 
        prescription_id: "pres_987", 
        drug: "Insulina Glargina", 
        ordered_qty: 3, 
        dispensed_qty: 1, 
        pending_qty: 2, 
        provider: "IPS Norte", 
        expiry_date: "2026-12-01" 
      },
      { 
        prescription_id: "pres_654", 
        drug: "Atorvastatina", 
        ordered_qty: 1, 
        dispensed_qty: 0, 
        pending_qty: 1, 
        provider: "Clínica Sur", 
        expiry_date: "2026-11-15" 
      }
    ]
  }, { status: 200 });
}
