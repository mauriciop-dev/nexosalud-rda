
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// Configuración predeterminada para el entorno Sandbox
const API_BASE_URL = process.env.NEXO_API_URL || "https://nexosalud-rda.vercel.app/api";
const API_KEY = process.env.NEXO_API_KEY || "sandbox_key_123";
// Datos de prueba: por defecto la carpeta ./sandbox junto a este archivo;
// se puede apuntar a otra carpeta con NEXO_SANDBOX_DATA_DIR.
const SANDBOX_DATA_DIR = process.env.NEXO_SANDBOX_DATA_DIR
  || path.join(path.dirname(fileURLToPath(import.meta.url)), "sandbox");

const server = new Server({
  name: "nexo-salud-mcp",
  version: "2.1.0",
}, { capabilities: { tools: {} } });

// ---------------------------------------------------------------- datos de prueba

function loadFixture(name) {
  const file = path.join(SANDBOX_DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`No se encontró el archivo de datos de prueba: ${file}. ` +
      `Use NEXO_SANDBOX_DATA_DIR para apuntar a la carpeta correcta.`);
  }
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

const CONTEXTS = {
  consulta: { class: "AMB", loinc: "34108-9", display: "Nota de Consulta", title: "Nota de Consulta Externa" },
  urgencias: { class: "EMER", loinc: "34111-5", display: "Nota de Urgencias", title: "Nota de Atención de Urgencias" },
  hospitalizacion: { class: "IMP", loinc: "34117-2", display: "Nota de Hospitalización", title: "Nota de Hospitalización" },
};

const ID_SYSTEM = (tipo) => `urn:nexo-salud:sandbox:tipo-id:${tipo}`;

function buildBundle({ patient, practitioner, org, context }) {
  const ctx = CONTEXTS[context] ?? CONTEXTS.consulta;
  const now = new Date().toISOString();
  const patientId = `${patient.tipo_id}-${patient.numero_id}`;
  const practitionerId = `${practitioner.tipo_id}-${practitioner.numero_id}`;
  const orgId = `org-${org.numero_habilitacion}`;
  const encounterId = `enc-${crypto.randomUUID().split("-")[0]}`;
  const conditionId = `cond-${crypto.randomUUID().split("-")[0]}`;

  const gender = { M: "male", F: "female" }[patient.sexo] ?? "unknown";

  return {
    resourceType: "Bundle",
    id: `rda-doc-${crypto.randomUUID()}`,
    meta: { lastUpdated: now },
    type: "document",
    timestamp: now,
    entry: [
      {
        fullUrl: `urn:uuid:${crypto.randomUUID()}`,
        resource: {
          resourceType: "Composition",
          id: `comp-${crypto.randomUUID().split("-")[0]}`,
          status: "final",
          type: { coding: [{ system: "http://loinc.org", code: ctx.loinc, display: ctx.display }], text: ctx.display },
          title: ctx.title,
          date: now,
          subject: { reference: patientId },
          encounter: { reference: encounterId },
          author: [{ reference: practitionerId, display: `${practitioner.nombre} ${practitioner.apellido}` }],
          custodian: { reference: orgId, display: org.nombre },
          section: [{
            title: "Motivo de consulta / Diagnóstico",
            code: { coding: [{ system: "http://loinc.org", code: "34089-2", display: "Reason for visit" }] },
            entry: [{ reference: conditionId }],
          }],
        },
      },
      {
        resource: {
          resourceType: "Patient",
          id: patientId,
          identifier: [{ system: ID_SYSTEM(patient.tipo_id), value: patient.numero_id, type: { text: patient.tipo_id } }],
          active: patient.estado === "vivo",
          name: [{ family: patient.apellido, given: [patient.nombre] }],
          gender,
          birthDate: patient.fecha_nacimiento,
        },
      },
      {
        resource: {
          resourceType: "Practitioner",
          id: practitionerId,
          identifier: [{ system: ID_SYSTEM(practitioner.tipo_id), value: practitioner.numero_id, type: { text: practitioner.tipo_id } }],
          active: practitioner.estado === "activo",
          name: [{ family: practitioner.apellido, given: [practitioner.nombre] }],
          qualification: [{
            code: { text: `Especialidad ${practitioner.especialidad}` },
            coding: [{ system: "urn:nexo-salud:sandbox:especialidades", code: practitioner.especialidad }],
          }],
        },
      },
      {
        resource: {
          resourceType: "Organization",
          id: orgId,
          identifier: [{ system: "urn:nexo-salud:sandbox:habilitacion", value: org.numero_habilitacion }],
          active: org.estado === "habilitada",
          name: org.nombre,
          type: [{ text: `Prestación ${org.tipo}` }],
        },
      },
      {
        resource: {
          resourceType: "Encounter",
          id: encounterId,
          status: "finished",
          class: { system: "http://terminology.hl7.org/CodeSystem/v3-ActCode", code: ctx.class },
          subject: { reference: patientId },
          participant: [{ individual: { reference: practitionerId } }],
          serviceProvider: { reference: orgId },
          period: { start: now },
        },
      },
      {
        resource: {
          resourceType: "Condition",
          id: conditionId,
          clinicalStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }] },
          code: {
            coding: [{ system: "http://terminology.hl7.org/CodeSystem/icd-10", code: "I10", display: "Hipertensión esencial (primaria)" }],
            text: "Motivo de consulta de prueba (datos simulados del sandbox)",
          },
          subject: { reference: patientId },
          encounter: { reference: encounterId },
        },
      },
    ],
  };
}

// ---------------------------------------------------------------- herramientas

const TOOLS = {
  validate_rda_schema: {
    description: "Revisa la validez sintáctica y semántica del JSON (FHIR R4 Bundle) contra la Res. 1799 antes de enviarlo a la IHCE.",
    inputSchema: {
      type: "object",
      properties: {
        json_content: { type: "string", description: "JSON Payload (FHIR R4 Bundle)" },
        context: { type: "string", description: "'consulta', 'urgencias', etc." }
      },
      required: ["json_content"]
    }
  },
  generate_fhir_template: {
    description: "Genera una plantilla mínima de HL7 FHIR R4 Bundle type=document para Nexo Salud.",
    inputSchema: { type: "object", properties: {} }
  },
  get_sandbox_data: {
    description: "Lista los datos de prueba del sandbox de Nexo Salud: pacientes, profesionales y organizaciones (IPS).",
    inputSchema: {
      type: "object",
      properties: {
        entity: {
          type: "string",
          enum: ["all", "patients", "practitioners", "organizations"],
          description: "Qué datos listar. Default: 'all'."
        }
      }
    }
  },
  generate_bundle_from_test_data: {
    description: "Compone un Bundle FHIR R4 type=document completo (Composition, Patient, Practitioner, Organization, Encounter, Condition) a partir de los datos de prueba del sandbox, listo para validar con validate_rda_schema.",
    inputSchema: {
      type: "object",
      properties: {
        patient_id: { type: "string", description: "numero_id del paciente (ver get_sandbox_data). Default: primer paciente." },
        practitioner_id: { type: "string", description: "numero_id del profesional. Default: primer profesional." },
        organizacion_habilitacion: { type: "string", description: "Número de habilitación de la IPS. Default: primera organización." },
        context: {
          type: "string",
          enum: ["consulta", "urgencias", "hospitalizacion"],
          description: "Tipo de atención. Default: 'consulta'."
        }
      }
    }
  }
};

function selectFixture(list, key, value, label) {
  if (!value) return list[0];
  const found = list.find((r) => r[key] === value);
  if (!found) {
    throw new Error(`No existe ${label} con ${key}='${value}'. ` +
      `Use get_sandbox_data para ver los registros disponibles.`);
  }
  return found;
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: Object.entries(TOOLS).map(([name, tool]) => ({ name, ...tool }))
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    if (name === "validate_rda_schema") {
      const response = await axios.post(`${API_BASE_URL}/validate`, JSON.parse(args.json_content), {
        headers: { "X-Nexo-API-Key": API_KEY, "Content-Type": "application/json" }
      });
      return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
    }
    if (name === "generate_fhir_template") {
      const template = buildBundle({
        patient: loadFixture("patients")[0],
        practitioner: loadFixture("practitioners")[0],
        org: loadFixture("organizations")[0],
        context: "consulta",
      });
      // La plantilla sigue siendo mínima: solo Composition, igual que la versión 2.0
      const minimal = {
        resourceType: "Bundle",
        type: "document",
        entry: [template.entry[0]]
      };
      return { content: [{ type: "text", text: JSON.stringify(minimal, null, 2) }] };
    }
    if (name === "get_sandbox_data") {
      const entity = args?.entity || "all";
      const data = entity === "all"
        ? {
            patients: loadFixture("patients"),
            practitioners: loadFixture("practitioners"),
            organizations: loadFixture("organizations"),
          }
        : { [entity]: loadFixture(entity) };
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
    if (name === "generate_bundle_from_test_data") {
      const context = args?.context || "consulta";
      if (!CONTEXTS[context]) throw new Error(`Contexto '${context}' no soportado. Use: ${Object.keys(CONTEXTS).join(", ")}.`);
      const bundle = buildBundle({
        patient: selectFixture(loadFixture("patients"), "numero_id", args?.patient_id, "paciente"),
        practitioner: selectFixture(loadFixture("practitioners"), "numero_id", args?.practitioner_id, "profesional"),
        org: selectFixture(loadFixture("organizations"), "numero_habilitacion", args?.organizacion_habilitacion, "organización"),
        context,
      });
      return { content: [{ type: "text", text: JSON.stringify(bundle, null, 2) }] };
    }
    throw new Error("Herramienta no encontrada");
  } catch (error) {
    return { isError: true, content: [{ type: "text", text: error.response?.data ? JSON.stringify(error.response.data) : error.message }] };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Nexo Salud MCP (Sandbox Mode) running on stdio");
}
run().catch(console.error);
