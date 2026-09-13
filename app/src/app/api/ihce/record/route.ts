
import { NextResponse } from 'next/server';
import { clinicalCache } from '@/lib/sandbox-store';
import { createOperationOutcome } from '@/lib/fhir';

export async function GET(request: Request) {
  const apiKey = request.headers.get('X-Nexo-API-Key');
  if (apiKey !== 'sandbox_key_123') return NextResponse.json(createOperationOutcome(["Auth failed."]), { status: 401 });
  
  const { searchParams } = new URL(request.url);
  const patient_id = searchParams.get('patient_id') || "pat_001_sandbox";
  
  const records = clinicalCache.get(patient_id) || [];

  return NextResponse.json({
    patient_id,
    total_records: records.length,
    history: records
  }, { status: 200 });
}
