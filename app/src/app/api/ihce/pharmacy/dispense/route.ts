
import { NextResponse } from 'next/server';
import { pharmacyCache } from '@/lib/sandbox-store';
import { createOperationOutcome } from '@/lib/fhir';

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('X-Nexo-API-Key');
    if (apiKey !== 'sandbox_key_123') return NextResponse.json(createOperationOutcome(["Auth failed. Use 'sandbox_key_123'."]), { status: 401 });

    const body = await request.json();
    
    if (!body.prescription_id || !body.dispensed_items || !Array.isArray(body.dispensed_items)) {
      return NextResponse.json(createOperationOutcome(["Faltan campos: 'prescription_id' o 'dispensed_items'."]), { status: 400 });
    }

    const pres_data = pharmacyCache.get(body.prescription_id);
    if (!pres_data) {
      return NextResponse.json(createOperationOutcome(["Prescripción no encontrada en el Sandbox. Registre una primero."]), { status: 404 });
    }

    // Actualizar cantidades dispensadas
    for (const item of body.dispensed_items) {
      const med = pres_data.medications.find((m: any) => m.drug_name === item.drug_name);
      if (med) {
        med.dispensed_qty += (item.quantity_delivered || 1);
      }
    }

    return NextResponse.json({
      status: "Success",
      message: "Dispensación registrada correctamente en el Sandbox.",
      dispensation_id: `disp_${crypto.randomUUID().slice(0,8)}`
    }, { status: 200 });

  } catch(e) { 
    return NextResponse.json(createOperationOutcome(["JSON Inválido."]), { status: 400 }); 
  }
}
