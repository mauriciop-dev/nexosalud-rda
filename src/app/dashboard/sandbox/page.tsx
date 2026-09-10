
"use client";
import React, { useState } from 'react';

export default function SandboxPage() {
  const [jsonInput, setJsonInput] = useState('{\n  "patient_id": "12345",\n  "clinical_records": []\n}');
  const [result, setResult] = useState<any>(null);

  const handleValidate = async () => {
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Nexo-API-Key': 'sandbox_key_123'
        },
        body: jsonInput
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: "Error de conexión con la API" });
    }
  };

  return (
    <div className="p-8 bg-[#0d0f12] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-4 text-[#3E3CFF]">Nexo Sandbox</h1>
      <p className="mb-8 text-gray-400">Prueba tus JSON contra la normativa IHCE sin afectar producción.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <textarea 
            className="w-full h-[400px] p-4 bg-[#1A1D24] text-green-400 font-mono rounded-xl border border-white/10 focus:border-[#3E3CFF] outline-none"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          <button 
            onClick={handleValidate}
            className="py-3 px-6 bg-[#3E3CFF] hover:bg-[#271F8F] rounded-full font-bold transition-all"
          >
            Validar Normativa
          </button>
        </div>
        
        <div className="p-6 bg-[#1A1D24] rounded-2xl border border-white/10 min-h-[400px]">
          <h2 className="text-xl font-bold mb-4">Resultado de Validación</h2>
          {result ? (
            <pre className={`p-4 rounded-lg ${result.status === 'Valid' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500 italic">Esperando validación...</p>
          )}
        </div>
      </div>
    </div>
  );
}
