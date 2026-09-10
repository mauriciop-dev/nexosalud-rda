
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

    // Regulatory Validation for Electronic Prescriptions
    if (!body.patient_id || !body.medications || !Array.isArray(body.medications)) {
      return NextResponse.json({ 
        error: "Regulatory Violation", 
        details: "patient_id and medications array are mandatory for electronic prescriptions." 
      }, { status: 422 });
    }

    for (const med of body.medications) {
      if (!med.drug_name || !med.dosage || !med.frequency) {
        return NextResponse.json({ 
          error: "Invalid Medication Data", 
          details: "Each medication must have drug_name, dosage, and frequency." 
        }, { status: 400 });
      }
    }

    await logApiEvent({ 
      event_id: crypto.randomUUID(), 
      api_key: apiKey, 
      endpoint: '/ihce/pharmacy/prescription', 
      timestamp: new Date().toISOString(), 
      status_code: 201, 
      duration_ms: Date.now() - startTime 
    });

    return NextResponse.json({ 
      status: "Created", 
      message: "Electronic prescription interoperated successfully.",
      prescription_id: crypto.randomUUID()
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}