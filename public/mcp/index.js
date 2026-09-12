
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// Configuración predeterminada para el entorno Sandbox
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
  },
  generate_fhir_template: {
    description: "Genera una plantilla válida de HL7 FHIR R4 Bundle type=document para Nexo Salud.",
    inputSchema: { type: "object", properties: {} }
  }
};

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: Object.entries(TOOLS).map(([name, tool]) => ({ name, ...tool }))
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    if (name === "validate_rda_schema") {
      const response = await axios.post(`${API_BASE_URL}/validate`, JSON.parse(args.json_content as string), {
        headers: { "X-Nexo-API-Key": API_KEY, "Content-Type": "application/json" }
      });
      return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }
    if (name === "generate_fhir_template") {
      const template = {
        resourceType: "Bundle",
        type: "document",
        entry: [
          { resource: { resourceType: "Composition", status: "final", type: { coding: [{ code: "34108-9", display: "Nota de Consulta" }] } } }
        ]
      };
      return { content: [{ type: "text", text: JSON.stringify(template, null, 2) }] };
    }
    throw new Error("Herramienta no encontrada");
  } catch (error: any) {
    return { isError: true, content: [{ type: "text", text: error.response?.data ? JSON.stringify(error.response.data) : error.message }] };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Nexo Salud MCP (Sandbox Mode) running on stdio");
}
run().catch(console.error);
