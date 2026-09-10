
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

    // Basic validation against schema_ihce_v1
    if (!body.patient_id || !body.full_name || !body.birth_date) {
      return NextResponse.json({ error: "Missing required patient fields: patient_id, full_name, or birth_date" }, { status: 400 });
    }

    // Logic: In real scenario, save to InsForge 'patients' table
    console.log(`[InsForge] Saving patient ${body.patient_id}`);

    await logApiEvent({ 
      event_id: crypto.randomUUID(), 
      api_key: apiKey, 
      endpoint: '/ihce/patient', 
      timestamp: new Date().toISOString(), 
      status_code: 201, 
      duration_ms: Date.now() - startTime 
    });

    return NextResponse.json({ 
      status: "Created", 
      message: "Patient registered/validated successfully in IHCE index.",
      patient_id: body.patient_id 
    }, { status: 201 });

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

  // Mock response from 'patients' table
  return NextResponse.json({
    patient_id: patient_id,
    full_name: "Paciente de Prueba",
    birth_date: "1985-05-12",
    gender: "M",
    status: "active"
  }, { status: 200 });
}
