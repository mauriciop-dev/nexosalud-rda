
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { signDocument } from '@/lib/signature';
import { enqueueJob } from '@/lib/queue';
import { logApiEvent } from '@/lib/insforge';
import { clinicalCache } from '@/lib/sandbox-store';
import { FhirBundleSchema, createOperationOutcome } from '@/lib/fhir';

export async function POST(request: Request) {
  try {
    // 1. Auth Básica (Permitimos sandbox_key para facilidad de prueba o JWT)
    const apiKey = request.headers.get('X-Nexo-API-Key');
    const authHeader = request.headers.get('Authorization');
    
    if (apiKey !== 'sandbox_key_123' && (!authHeader || !authHeader.startsWith('Bearer '))) {
      return NextResponse.json(createOperationOutcome(["Autenticación fallida."]), { status: 401 });
    }

    const body = await request.json();
    const startTime = Date.now();

    // 2. VALIDACIÓN NORMATIVA REAL (FHIR R4)
    const validationResult = FhirBundleSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = (validationResult.error as any).errors.map(err => err.message);
      return NextResponse.json(createOperationOutcome(errors), { status: 400 });
    }

    // 3. Extracción (Simulada) del paciente y guardado en Sandbox
    // En FHIR real esto viene de body.entry[...].resource.subject.reference
    const patient_id = body.subject?.reference || "pat_001_sandbox";
    
    if (!clinicalCache.has(patient_id)) {
      clinicalCache.set(patient_id, []);
    }
    const vida_code = `VIDA-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
    
    clinicalCache.get(patient_id).push({
      vida_code,
      timestamp: new Date().toISOString(),
      document: body
    });

    // 4. Firma y Encolado
    const digitalSignature = await signDocument(body);
    const signedPayload = { data: body, signature: digitalSignature };
    const jobId = await enqueueJob('RDA_SEND', signedPayload);

    // @ts-ignore
    await logApiEvent({ event_id: jobId, api_key: apiKey || 'jwt_client', endpoint: '/Composition/$enviar-rda-consulta-externa', timestamp: new Date().toISOString(), status_code: 202, duration_ms: Date.now() - startTime });

    return NextResponse.json({ 
      status: "Accepted", 
      message: "RDA Consulta Externa validado y guardado en historial.",
      vida_code,
      trackingId: jobId 
    }, { status: 202 });

  } catch (e) { return NextResponse.json(createOperationOutcome(["Payload inválido."]), { status: 400 }); }
}
