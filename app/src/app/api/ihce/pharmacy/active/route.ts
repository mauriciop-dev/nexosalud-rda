
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

  // Mock response: Consolidated active medications from all providers
  return NextResponse.json({
    patient_id: patient_id,
    active_medications: [
      { drug: "Metformina", dosage: "850mg", frequency: "1 vez al día", provider: "IPS Norte", startDate: "2026-01-01" },
      { drug: "Enalapril", dosage: "10mg", frequency: "Cada 12 horas", provider: "Clínica Sur", startDate: "2026-03-10" }
    ]
  }, { status: 200 });
}
