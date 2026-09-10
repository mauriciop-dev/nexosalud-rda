
import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/insforge';

export async function GET(request: Request) {
  const apiKey = request.headers.get('X-Nexo-API-Key');
  if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
  
  const keyData = await validateApiKey(apiKey);
  if (!keyData || keyData.status !== 'active') {
    return NextResponse.json({ error: "Invalid or inactive API Key" }, { status: 403 });
  }

  // Mock usage data from InsForge metrics
  return NextResponse.json({
    apiKey: apiKey,
    // @ts-ignore
    client: keyData.client_name || "Client User",
    environment: keyData.env,
    metrics: {
      total_requests: 1250,
      success_rate: "98.5%",
      cost_usd: 45.20,
      billing_cycle: "September 2026"
    }
  }, { status: 200 });
}
