
import { NextResponse } from 'next/server';
import { validateApiKey, logApiEvent } from '@/lib/insforge';

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('X-Nexo-API-Key');
    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 401 });

    const keyData = await validateApiKey(apiKey);
    if (!keyData || keyData.status !== 'active') {
      return NextResponse.json({ error: "Invalid or inactive API Key" }, { status: 403 });
    }

    const body = await request.json();
    const startTime = Date.now();

    // Validation: Required fields per Res. 1799
    if (!body.patient_id || !body.provider_id || !body.diagnosis_codes) {
      return NextResponse.json({ 
        error: "Regulatory Violation", 
        details: "patient_id, provider_id and diagnosis_codes are mandatory per Res. 1799." 
      }, { status: 422 });
    }

    // Logic: Save to InsForge 'clinical_records' table
    console.log(`[InsForge] Interoperating record for patient ${body.patient_id}`);

    await logApiEvent({ 
      event_id: crypto.randomUUID(), 
      api_key: apiKey, 
      endpoint: '/ihce/record', 
      timestamp: new Date().toISOString(), 
      status_code: 202, 
      duration_ms: Date.now() - startTime 
    });

    return NextResponse.json({ 
      status: "Accepted", 
      message: "Clinical record received and queued for interoperability.",
      tracking_id: crypto.randomUUID()
    }, { status: 202 });

  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const apiKey = request.headers.get('X-Nexo-API-Key');
  if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
  
  const { searchParams } = new URL(request.url);
  const patient_id = searchParams.get('patient_id');
  
  if (!patient_id) return NextResponse.json({ error: "patient_id query param required" }, { status: 400 });

  // Mock response: Consolidated history from multiple providers
  return NextResponse.json({
    patient_id: patient_id,
    records: [
      { record_id: "rec_1", provider: "IPS Norte", date: "2026-01-10", diagnosis: ["E11"] },
      { record_id: "rec_2", provider: "Clínica Sur", date: "2026-05-15", diagnosis: ["I10"] }
    ]
  }, { status: 200 });
}