
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

    // ASYNCHRONOUS PROCESSING (Queue)
    
    // --- LEGAL VALIDATION: Digital Signature (Law 527/1999) ---
    const digitalSignature = await signDocument(body);
    const signedPayload = {
      data: body,
      signature: digitalSignature
    };

    // Enqueue the SIGNED payload instead of raw body
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
      message: "The RDA has been queued for transmission. Use the tracking ID to check status.",
      trackingId: jobId 
    }, { status: 202 });

  } catch (e) { return NextResponse.json({ error: "Bad Request" }, { status: 400 }); }
}
, { status: 401 });
    const keyData = await validateApiKey(apiKey);
    if (!keyData || keyData.status !== 'active') return NextResponse.json({ error: "Invalid Key" }, { status: 403 });

    const body = await request.json();
    console.log("[FHIR] Processing RDA Consulta Externa...");
    
    await logApiEvent({ event_id: crypto.randomUUID(), api_key: apiKey, endpoint: '/Composition/$enviar-rda-consulta-externa', timestamp: new Date().toISOString(), status_code: 200, duration_ms: 15 });

    return NextResponse.json({ status: "Success", vida_code: `VIDA-${crypto.randomUUID().slice(0,8).toUpperCase()}` }, { status: 200 });
  } catch (e) { return NextResponse.json({ error: "Bad Request" }, { status: 400 }); }
}
