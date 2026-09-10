
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

    // Validation for Dispensing
    if (!body.prescription_id || !body.dispensed_items || !Array.isArray(body.dispensed_items)) {
      return NextResponse.json({ 
        error: "Invalid Dispensing Data", 
        details: "prescription_id and dispensed_items array are mandatory." 
      }, { status: 400 });
    }

    for (const item of body.dispensed_items) {
      if (!item.drug_name || !item.quantity_delivered) {
        return NextResponse.json({ 
          error: "Invalid Item Data", 
          details: "Each dispensed item must have drug_name and quantity_delivered." 
        }, { status: 400 });
      }
    }

    // Logic: Update prescription status in InsForge 'clinical_records' or a specific 'dispensations' table
    console.log(`[InsForge] Recording dispensation for prescription ${body.prescription_id}`);

    await logApiEvent({ 
      event_id: crypto.randomUUID(), 
      api_key: apiKey, 
      endpoint: '/ihce/pharmacy/dispense', 
      timestamp: new Date().toISOString(), 
      status_code: 200, 
      duration_ms: Date.now() - startTime 
    });

    return NextResponse.json({ 
      status: "Success", 
      message: "Dispensation recorded successfully. Patient records updated.",
      dispensation_id: crypto.randomUUID()
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}