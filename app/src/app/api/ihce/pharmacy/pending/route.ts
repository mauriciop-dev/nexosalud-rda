
import { NextResponse } from 'next/server';
import { pharmacyCache } from '@/lib/sandbox-store';
import { createOperationOutcome } from '@/lib/fhir';

export async function GET(request: Request) {
  const apiKey = request.headers.get('X-Nexo-API-Key');
  if (apiKey !== 'sandbox_key_123') return NextResponse.json(createOperationOutcome(["Auth failed. Use 'sandbox_key_123'."]), { status: 401 });

  const { searchParams } = new URL(request.url);
  const patient_id = searchParams.get('patient_id');
  
  if (!patient_id) return NextResponse.json(createOperationOutcome(["Falta el parámetro 'patient_id'."]), { status: 400 });

  const pending = [];
  
  // Buscar en el caché las prescripciones del paciente
  for (const [pres_id, pres_data] of pharmacyCache.entries()) {
    if (pres_data.patient_id === patient_id) {
      for (const med of pres_data.medications) {
        if (med.ordered_qty > med.dispensed_qty) {
          pending.push({
            prescription_id: pres_id,
            drug: med.drug_name,
            ordered_qty: med.ordered_qty,
            dispensed_qty: med.dispensed_qty,
            pending_qty: med.ordered_qty - med.dispensed_qty
          });
        }
      }
    }
  }

  return NextResponse.json({ 
    patient_id, 
    pending_prescriptions: pending 
  }, { status: 200 });
}
