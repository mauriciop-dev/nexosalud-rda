
"use client";
import React from 'react';
import Link from 'next/link';
// from 'react';

import JSZip from 'jszip';

export default function MCPSection() {
  const handleDownload = async () => {
    try {
      const zip = new JSZip();
      
      zip.file("mcp/index.js", `
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
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
run().catch(console.error);
      `);

      zip.file("mcp/package.json", JSON.stringify({
        name: "@nexo-salud/mcp-sandbox",
        version: "1.0.0",
        type: "module",
        main: "index.js",
        dependencies: {
          "@modelcontextprotocol/sdk": "latest",
          "axios": "latest"
        }
      }, null, 2));

      zip.file("mcp/README.md", "# Nexo Salud MCP\nEjecuta `npm install` y luego `node index.js`.");

      const blob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nexo-mcp.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error generando ZIP:", err);
      alert("Error al generar la descarga. Intente nuevamente.");
    }
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-[#0d0f12] to-[#16191f] text-white">
      <div className="max-w-5xl mx-auto bg-[#1A1D24] rounded-3xl border border-blue-500/30 p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl font-bold">MCP</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Súper-poderes para tu <span className="text-blue-400">Equipo de Devs</span></h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              No más lectura infinita de manuales técnicos. Nuestro <strong>MCP Server</strong> permite que Cursor, VS Code o Claude integren Nexo Salud automáticamente. 
              La IA entiende la norma y escribe el código por ti.
            </p>
            <ul className="space-y-4 mb-8">
              {["Validación de esquemas en tiempo real", "Mapeo automático CUM/IUM", "Generación de Bundles FHIR"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="text-blue-500">✓</span> {item}
                </li>
              ))}
            </ul>
            <Link 
              href="/mcp-setup" 
              className="inline-block px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all cursor-pointer"
            >
              Ver Configuración MCP
            </Link>
          </div>
          <div className="bg-black/50 p-6 rounded-2xl border border-white/10 font-mono text-xs text-blue-300">
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <p className="mb-2 text-gray-500">// IA Assistant integration</p>
            <p className="mb-1 text-white"> {`> use_tool(validate_rda_schema, {`}</p>
            <p className="ml-4 text-gray-400"> {`"json_content": "{...}",`}</p>
            <p className="ml-4 text-gray-400"> {`"context": "consulta"`}</p>
            <p className="text-white"> {`})`}</p>
            <p className="mt-4 text-green-400">✓ Payload validado según Res. 1799</p>
          </div>
        </div>
      </div>
    </section>
  );
}
