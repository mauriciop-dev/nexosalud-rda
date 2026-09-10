
import { NextResponse } from 'next/server';
import { validateApiKey, logApiEvent } from '@/lib/insforge';

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('X-Nexo-API-Key');
    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
    const keyData = await validateApiKey(apiKey);
    if (!keyData || keyData.status !== 'active') return NextResponse.json({ error: "Invalid Key" }, { status: 403 });

    const body = await request.json();
    console.log("[Pharm] Processing Medication Direction (Direccionamiento)...");
    
    // @ts-ignore
    await logApiEvent({ event_id: crypto.randomUUID(), api_key: apiKey, endpoint: '/ihce/pharmacy/direccionamiento', timestamp: new Date().toISOString(), status_code: 200, duration_ms: 10 });

    return NextResponse.json({ status: "Success", direction_id: crypto.randomUUID() }, { status: 200 });
  } catch (e) { return NextResponse.json({ error: "Bad Request" }, { status: 400 }); }
}