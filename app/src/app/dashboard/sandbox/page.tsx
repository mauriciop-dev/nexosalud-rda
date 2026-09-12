
"use client";
import React, { useState } from 'react';

const TEMPLATES = {
  fhir_valid: {
    name: "✅ RDA Válido (FHIR R4)",
    url: "/api/composition/enviar-rda-consulta-externa",
    payload: {
      "resourceType": "Bundle",
      "type": "document",
      "subject": { "reference": "pat_001_sandbox" },
      "entry": [
        {
          "resource": {
            "resourceType": "Composition",
            "status": "final",
            "title": "Consulta Externa General",
            "author": [{ "reference": "Practitioner/123", "display": "Dr. Sandbox" }]
          }
        }
      ]
    }
  },
  fhir_invalid: {
    name: "❌ RDA Error Normativo (Sin Composition)",
    url: "/api/composition/enviar-rda-consulta-externa",
    payload: {
      "resourceType": "Bundle",
      "type": "document",
      "entry": [
        {
          "resource": {
            "resourceType": "Patient",
            "id": "123"
          }
        }
      ]
    }
  },
  pharmacy_presc: {
    name: "💊 Prescribir Medicamento",
    url: "/api/ihce/pharmacy/prescription",
    payload: {
      "patient_id": "pat_001_sandbox",
      "medications": [
        { "drug_name": "Acetaminofen 500mg", "quantity": 10, "frequency": "Cada 8 horas" }
      ]
    }
  },
  history_get: {
    name: "📂 Consultar Historia Clínica",
    url: "/api/ihce/record?patient_id=pat_001_sandbox",
    method: "GET",
    payload: null
  }
};

export default function SandboxPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof TEMPLATES>("fhir_valid");
  const [jsonInput, setJsonInput] = useState(JSON.stringify(TEMPLATES["fhir_valid"].payload, null, 2));
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value as keyof typeof TEMPLATES;
    setSelectedTemplate(key);
    if (TEMPLATES[key].payload) {
      setJsonInput(JSON.stringify(TEMPLATES[key].payload, null, 2));
    } else {
      setJsonInput("");
    }
  };

  const handleExecute = async () => {
    setLoading(true);
    setResult(null);
    const config = TEMPLATES[selectedTemplate];
    
    try {
      const options: RequestInit = {
        method: (config as any).method || 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Nexo-API-Key': 'sandbox_key_123'
        }
      };
      
      if (config.payload) {
        options.body = jsonInput;
      }

      const res = await fetch(config.url, options);
      const data = await res.json();
      setResult({ status: res.status, data });
    } catch (e) {
      setResult({ error: "Error de red" });
    }
    setLoading(false);
  };

  return (
    <div className="p-8 bg-[#0d0f12] min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-[#3E3CFF]">Consola Interactiva Sandbox</h1>
        <p className="mb-8 text-gray-400">Prueba el motor normativo de Nexo Salud en tiempo real. Los datos se guardan temporalmente en caché.</p>
        
        <div className="mb-6 flex items-center gap-4">
          <select 
            value={selectedTemplate}
            onChange={handleTemplateChange}
            className="p-3 bg-[#1A1D24] border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 min-w-[300px]"
          >
            {Object.entries(TEMPLATES).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
          
          <button 
            onClick={handleExecute}
            disabled={loading}
            className="py-3 px-8 bg-[#3E3CFF] hover:bg-[#271F8F] disabled:opacity-50 rounded-xl font-bold transition-all"
          >
            {loading ? "Ejecutando..." : "Ejecutar Petición"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-500 font-mono">
              {TEMPLATES[selectedTemplate].method || "POST"} {TEMPLATES[selectedTemplate].url}
            </div>
            <textarea 
              className="w-full h-[500px] p-4 bg-[#1A1D24] text-green-400 font-mono text-sm rounded-xl border border-white/10 focus:border-[#3E3CFF] outline-none"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              disabled={!TEMPLATES[selectedTemplate].payload}
              placeholder="No payload required for GET requests"
            />
          </div>
          
          <div className="flex flex-col gap-2">
             <div className="text-sm text-gray-500 font-mono">Response Payload</div>
             <div className="p-4 bg-[#1A1D24] rounded-xl border border-white/10 h-[500px] overflow-auto">
              {result ? (
                <div>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-bold mb-4 ${result.status >= 200 && result.status < 300 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                    HTTP {result.status}
                  </div>
                  <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-gray-600 italic">Haz clic en Ejecutar para ver la respuesta del Sandbox.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
