
import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/insforge';

export async function POST(request: Request) {
  const apiKey = request.headers.get('X-Nexo-API-Key');
  if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
  
  const body = await request.json();
  const professional_id = body.professional_id;
  
  // Mock validation against RETHUS
  return NextResponse.json({
    professional_id,
    status: "Active",
    specialty: "Medicina General",
    verified: true,
    source: "RETHUS"
  }, { status: 200 });
}
