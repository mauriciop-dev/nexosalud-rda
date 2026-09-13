
import { NextResponse } from 'next/server';
import { pharmacyCache } from '@/lib/sandbox-store';
import { createOperationOutcome } from '@/lib/fhir';

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('X-Nexo-API-Key');
    if (apiKey !== 'sandbox_key_123') return NextResponse.json(createOperationOutcome(["Auth failed. Use 'sandbox_key_123'."]), { status: 401 });

    const body = await request.json();
    
    if (!body.patient_id || !body.medications || !Array.isArray(body.medications)) {
      return NextResponse.json(createOperationOutcome(["Faltan campos obligatorios: 'patient_id' o el arreglo de 'medications'."]), { status: 400 });
    }

    const prescription_id = `pres_${crypto.randomUUID().slice(0,8)}`;
    
    // Mapear medicamentos al store
    const meds = body.medications.map((m: any) => ({
      drug_name: m.drug_name || "Desconocido",
      ordered_qty: m.quantity || 1,
      dispensed_qty: 0
    }));

    // Guardar en el Sandbox
    pharmacyCache.set(prescription_id, {
      patient_id: body.patient_id,
      medications: meds,
      date: new Date().toISOString()
    });

    return NextResponse.json({
      status: "Created",
      message: "Prescripción guardada exitosamente en el Sandbox.",
      prescription_id
    }, { status: 201 });

  } catch(e) { 
    return NextResponse.json(createOperationOutcome(["JSON Inválido."]), { status: 400 }); 
  }
}
