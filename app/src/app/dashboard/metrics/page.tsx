
"use client";
import React, { useState, useEffect } from 'react';

export default function MetricsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchMetrics() {
      const res = await fetch('/api/account/usage', {
        headers: { 'X-Nexo-API-Key': 'sandbox_key_123' }
      });
      const json = await res.json();
      setData(json);
    }
    fetchMetrics();
  }, []);

  if (!data) return <div className="p-8 text-white">Cargando métricas...</div>;

  return (
    <div className="p-8 bg-[#0d0f12] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 text-[#3E3CFF]">Consumo de API Nexo</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#1A1D24] rounded-2xl border border-white/10">
          <p className="text-gray-400 text-sm">Total Peticiones</p>
          <p className="text-4xl font-bold">{data.metrics.total_requests}</p>
        </div>
        <div className="p-6 bg-[#1A1D24] rounded-2xl border border-white/10">
          <p className="text-gray-400 text-sm">Tasa de Éxito</p>
          <p className="text-4xl font-bold text-green-400">{data.metrics.success_rate}</p>
        </div>
        <div className="p-6 bg-[#1A1D24] rounded-2xl border border-white/10">
          <p className="text-gray-400 text-sm">Costo Acumulado</p>
          <p className="text-4xl font-bold text-orange-400">${data.metrics.cost_usd}</p>
        </div>
      </div>
    </div>
  );
}
