// Fixed TS Type Error

export interface ApiMetric {
  event_id: string;
  api_key: string;
  endpoint: string;
  timestamp: string;
  status_code: number;
  duration_ms: number;
}

export async function logApiEvent(metric: ApiMetric) {
  // In a real implementation, this would call the InsForge API
  // Using the configured API key from the environment
  console.log(`[InsForge Metric] Logging event ${metric.event_id} for key ${metric.api_key}`);
  
  // Simulation of the API call to InsForge
  return { success: true };
}

export async function validateApiKey(key: string) {
  // Simulation of looking up the key in InsForge 'api_keys' table
  const mockKeys: Record<string, {env: string, status: string}> = {
    'sandbox_key_123': { env: 'sandbox', status: 'active' },
    'prod_key_456': { env: 'production', status: 'active' },
  };
  
  return mockKeys[key] || null;
}
