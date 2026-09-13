"use client";
import React from 'react';
import Link from 'next/link';

const indexCode = `import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

const API_BASE_URL = process.env.NEXO_API_URL || "https://nexosalud-rda.vercel.app/api";
const API_KEY = process.env.NEXO_API_KEY || "sandbox_key_123";

const server = new Server({
  name: "nexo-salud-mcp",
  version: "2.0.0",
}, { capabilities: { tools: {} } });

const TOOLS = {
  validate_rda_schema: {
    description: "Revisa la validez sintáctica y semántica del JSON (FHIR R4 Bundle) antes de enviarlo.",
    inputSchema: {
      type: "object",
      properties: {
        json_content: { type: "string", description: "JSON Payload" },
        context: { type: "string", description: "'consulta', 'urgencias', etc." }
      },
      required: ["json_content"]
    }
  }
};

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: Object.entries(TOOLS).map(([name, tool]) => ({ name, ...tool }))
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    if (name === "validate_rda_schema") {
      const response = await axios.post(\`\${API_BASE_URL}/validate\`, JSON.parse((args as any).json_content), {
        headers: { "X-Nexo-API-Key": API_KEY, "Content-Type": "application/json" }
      });
      return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }
    throw new Error("Herramienta no encontrada");
  } catch (error: any) {
    return { isError: true, content: [{ type: "text", text: error?.response?.data ? JSON.stringify(error.response.data) : error.message }] };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Nexo Salud MCP running");
}
run().catch(console.error);`;

const packageCode = `{
  "name": "@nexo-salud/mcp-sandbox",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest",
    "axios": "latest"
  }
}`;

export default function MCPSetupPage() {
  return (
    <div className="min-h-screen bg-[#0d0f12] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#3E3CFF]">Configuración MCP Server</h1>
          <Link href="/" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">Volver al inicio</Link>
        </div>
        
        <p className="text-gray-400 mb-8">
          Configura tu MCP Server localmente para integrar Nexo Salud en Cursor, VS Code o Claude Desktop.
        </p>

        <div className="space-y-8">
          <div className="bg-[#1A1D24] border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">1. package.json</h2>
            <p className="text-sm text-gray-500 mb-4">Crea este archivo e instala las dependencias con `npm install`.</p>
            <div className="relative">
              <pre className="bg-black/50 p-4 rounded-xl text-sm font-mono overflow-x-auto text-green-400">
                {packageCode}
              </pre>
            </div>
          </div>

          <div className="bg-[#1A1D24] border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">2. index.js</h2>
            <p className="text-sm text-gray-500 mb-4">El código del servidor. Contiene la conexión segura al Sandbox de Nexo Salud.</p>
            <div className="relative">
              <pre className="bg-black/50 p-4 rounded-xl text-sm font-mono overflow-x-auto text-blue-300">
                {indexCode}
              </pre>
            </div>
          </div>

          <div className="bg-[#1A1D24] border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">3. Ejecución</h2>
            <p className="text-sm text-gray-500 mb-4">Configura tu IDE para iniciar el servidor apuntando al archivo index.js.</p>
            <pre className="bg-black/50 p-4 rounded-xl text-sm font-mono text-white">
              node index.js
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
