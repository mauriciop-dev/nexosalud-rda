
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { signDocument } from '@/lib/signature';
import { enqueueJob } from '@/lib/queue';
import { logApiEvent } from '@/lib/insforge';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Missing or invalid token" }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyAccessToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const startTime = Date.now();

    const digitalSignature = await signDocument(body);
    const signedPayload = { data: body, signature: digitalSignature };
    const jobId = await enqueueJob('RDA_SEND', signedPayload);

    await logApiEvent({ 
      event_id: jobId, 
      api_key: payload.client_id as string, 
      endpoint: '/Composition/$enviar-rda-consulta-externa', 
      timestamp: new Date().toISOString(), 
      status_code: 202, 
      duration_ms: Date.now() - startTime 
    });

    return NextResponse.json({ 
      status: "Accepted", 
      message: "RDA Consulta Externa queued for transmission.",
      trackingId: jobId 
    }, { status: 202 });

  } catch (e) { return NextResponse.json({ error: "Bad Request" }, { status: 400 }); }
}
