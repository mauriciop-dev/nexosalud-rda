/**
 * Arnés de pruebas sandbox para el Nexo Salud MCP.
 * Levanta el servidor MCP (index.js) por stdio, hace el handshake y ejecuta:
 *
 *   T1  tools/list                      — lista de herramientas expuestas
 *   T2  generate_fhir_template          — plantilla Bundle type=document
 *   T3  validate_rda_schema (positivo)  — plantilla generada en T2 → Success + VIDA-XXXX
 *   T4  validate_rda_schema (negativo)  — Bundle sin Composition en entry[0] → 400 OperationOutcome
 *   T5  llave inválida                  — NEXO_API_KEY errada → 401 OperationOutcome
 *
 * Uso: node sandbox_test.mjs
 */

import { spawn } from "node:child_process";
import { once } from "node:events";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SERVER = path.join(path.dirname(fileURLToPath(import.meta.url)), "index.js");
const PROTOCOL_VERSION = "2024-11-05";

class McpClient {
  constructor(env = {}) {
    this.child = spawn(process.execPath, [SERVER], {
      env: { ...process.env, ...env },
      stdio: ["pipe", "pipe", "pipe"],
    });
    this.child.stderr.on("data", (d) => process.stderr.write(`[srv] ${d}`));
    this.buffer = "";
    this.pending = new Map();
    this.nextId = 1;
    this.child.stdout.on("data", (chunk) => this.#onData(chunk));
    this.child.on("exit", (code) => {
      for (const { reject } of this.pending.values())
        reject(new Error(`Servidor terminó con código ${code}`));
      this.pending.clear();
    });
  }

  #onData(chunk) {
    this.buffer += chunk.toString();
    let idx;
    while ((idx = this.buffer.indexOf("\n")) >= 0) {
      const line = this.buffer.slice(0, idx).trim();
      this.buffer = this.buffer.slice(idx + 1);
      if (!line) continue;
      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        continue; // línea no-JSON (basura de consola), ignorar
      }
      if (msg.id !== undefined && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      }
    }
  }

  request(method, params, timeoutMs = 30000) {
    const id = this.nextId++;
    const frame = JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n";
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => {
          this.pending.delete(id);
          reject(new Error(`Timeout (${timeoutMs}s) esperando respuesta a ${method}`));
        },
        timeoutMs
      );
      this.pending.set(id, {
        resolve: (r) => { clearTimeout(timer); resolve(r); },
        reject: (e) => { clearTimeout(timer); reject(e); },
      });
      this.child.stdin.write(frame);
    });
  }

  notify(method, params) {
    this.child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n");
  }

  async callTool(name, args) {
    const result = await this.request("tools/call", { name, arguments: args ?? {} });
    const text = result?.content?.[0]?.text ?? "";
    return { isError: Boolean(result?.isError), text, raw: result };
  }

  async close() {
    this.child.stdin.end();
    await once(this.child, "exit").catch(() => this.child.kill());
  }
}

// ---------------------------------------------------------------- helpers

const results = [];
function record(id, name, pass, detail) {
  results.push({ id, name, pass, detail });
  console.log(`\n${pass ? "✅" : "❌"} ${id} — ${name}`);
  console.log(detail);
}

async function expectHttpError(client, { id, name, expectedStatus, toolArgs }) {
  const { isError, text } = await client.callTool("validate_rda_schema", toolArgs);
  let parsed = null;
  try { parsed = JSON.parse(text); } catch { /* respuesta no-JSON */ }
  const issues = parsed?.issue?.map((i) => i.diagnostics).join(" | ") ?? text;
  const ok = isError && parsed?.resourceType === "OperationOutcome";
  record(id, name, ok, `isError=${isError}, OperationOutcome=${parsed?.resourceType === "OperationOutcome"}\nIssues: ${issues}`);
}

// ---------------------------------------------------------------- suites

async function handshake() {
  const client = new McpClient();
  const init = await client.request("initialize", {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: "sandbox-test-harness", version: "1.0.0" },
  });
  client.notify("notifications/initialized", {});
  return { client, serverInfo: init.serverInfo };
}

async function main() {
  console.log(`Nexo Salud MCP — pruebas sandbox (${new Date().toLocaleString()})\n${"=".repeat(60)}`);

  // ---- T1: herramientas
  const { client, serverInfo } = await handshake();
  console.log(`Servidor: ${serverInfo?.name} v${serverInfo?.version}`);

  const tools = await client.request("tools/list", {});
  const toolNames = tools.tools.map((t) => t.name).sort().join(", ");
  const expectedTools = "generate_bundle_from_test_data, generate_fhir_template, get_sandbox_data, validate_rda_schema";
  const t1ok = tools.tools.length === 4 && toolNames === expectedTools;
  record("T1", "tools/list expone las 4 herramientas", t1ok, `Herramientas: ${toolNames}`);

  // ---- T2: plantilla
  const tpl = await client.callTool("generate_fhir_template");
  let template = null;
  try { template = JSON.parse(tpl.text); } catch { /* no-JSON */ }
  const t2ok =
    !tpl.isError &&
    template?.resourceType === "Bundle" &&
    template?.type === "document" &&
    template?.entry?.[0]?.resource?.resourceType === "Composition";
  record("T2", "generate_fhir_template → Bundle document con Composition", t2ok,
    t2ok ? JSON.stringify(template, null, 2) : tpl.text);

  // ---- T3: validación positiva (plantilla → API sandbox)
  const valid = await client.callTool("validate_rda_schema", {
    json_content: JSON.stringify(template),
    context: "consulta",
  });
  let vres = null;
  try { vres = JSON.parse(valid.text); } catch { /* no-JSON */ }
  const t3ok = !valid.isError && vres?.status === "Success" && /^VIDA-/.test(vres?.simulated_response?.vida_code ?? "");
  record("T3", "validate_rda_schema (plantilla válida) → Success + código VIDA", t3ok, valid.text);

  // ---- T4: bundle inválido (sin Composition en entry[0])
  await expectHttpError(client, {
    id: "T4",
    name: "Bundle con Patient primero → 400 OperationOutcome",
    toolArgs: {
      json_content: JSON.stringify({
        resourceType: "Bundle", type: "document",
        entry: [{ resource: { resourceType: "Patient", id: "p1" } }],
      }),
    },
  });

  // ---- T5: bundle vacío
  await expectHttpError(client, {
    id: "T5",
    name: "Bundle sin entries → 400 OperationOutcome",
    toolArgs: {
      json_content: JSON.stringify({ resourceType: "Bundle", type: "document", entry: [] }),
    },
  });

  // ---- T7: datos de prueba
  const data = await client.callTool("get_sandbox_data", { entity: "all" });
  let sandbox = null;
  try { sandbox = JSON.parse(data.text); } catch { /* no-JSON */ }
  const t7ok =
    !data.isError &&
    sandbox?.patients?.length === 5 &&
    sandbox?.practitioners?.length === 2 &&
    sandbox?.organizations?.length === 3;
  record("T7", "get_sandbox_data → 5 pacientes, 2 profesionales, 3 organizaciones", t7ok,
    t7ok ? `Pacientes: ${sandbox.patients.map((p) => `${p.tipo_id} ${p.numero_id} (${p.nombre})`).join("; ")}`
         : data.text);

  // ---- T8: flujo end-to-end datos de prueba → bundle completo → validación
  const gen = await client.callTool("generate_bundle_from_test_data", { context: "consulta" });
  let bundle = null;
  try { bundle = JSON.parse(gen.text); } catch { /* no-JSON */ }
  const resTypes = bundle?.entry?.map((e) => e.resource.resourceType).join(", ");
  const t8BundleOk =
    !gen.isError &&
    bundle?.type === "document" &&
    bundle?.entry?.[0]?.resource?.resourceType === "Composition" &&
    ["Patient", "Practitioner", "Organization", "Encounter", "Condition"].every((t) => resTypes.includes(t));
  if (t8BundleOk) {
    const validated = await client.callTool("validate_rda_schema", { json_content: gen.text, context: "consulta" });
    let vjson = null;
    try { vjson = JSON.parse(validated.text); } catch { /* no-JSON */ }
    const t8ok = !validated.isError && vjson?.status === "Success" && /^VIDA-/.test(vjson?.simulated_response?.vida_code ?? "");
    record("T8", "generate_bundle_from_test_data (consulta) → validate → Success + VIDA", t8ok,
      `Recursos del bundle: ${resTypes}\n${validated.text}`);
  } else {
    record("T8", "generate_bundle_from_test_data (consulta) → bundle completo", false, gen.text);
  }

  // ---- T9: paciente específico + contexto urgencias
  const gen2 = await client.callTool("generate_bundle_from_test_data", {
    patient_id: "9876543210", context: "urgencias",
  });
  let bundle2 = null;
  try { bundle2 = JSON.parse(gen2.text); } catch { /* no-JSON */ }
  const patient2 = bundle2?.entry?.map((e) => e.resource).find((r) => r.resourceType === "Patient");
  const encounter2 = bundle2?.entry?.map((e) => e.resource).find((r) => r.resourceType === "Encounter");
  const composition2 = bundle2?.entry?.[0]?.resource;
  const t9ok =
    !gen2.isError &&
    patient2?.gender === "female" &&
    patient2?.birthDate === "1990-05-20" &&
    encounter2?.class?.code === "EMER" &&
    composition2?.type?.coding?.[0]?.code === "34111-5";
  record("T9", "patient_id=9876543210 + urgencias → María, Encounter EMER, LOINC 34111-5", t9ok,
    `Patient: ${patient2?.name?.[0]?.given?.[0]} ${patient2?.name?.[0]?.family}, gender=${patient2?.gender}, birthDate=${patient2?.birthDate}; ` +
    `Encounter.class=${encounter2?.class?.code}; Composition.type=${composition2?.type?.coding?.[0]?.code}`);

  // ---- T10: paciente inexistente → error del herramienta
  const miss = await client.callTool("generate_bundle_from_test_data", { patient_id: "9999999999" });
  const t10ok = miss.isError && /No existe paciente/.test(miss.text);
  record("T10", "patient_id inexistente → isError con mensaje claro", t10ok, miss.text);

  await client.close();

  // ---- T6: llave inválida (segunda instancia con NEXO_API_KEY errada)
  const bad = new McpClient({ NEXO_API_KEY: "llave_errada" });
  await bad.request("initialize", {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: "sandbox-test-harness", version: "1.0.0" },
  });
  bad.notify("notifications/initialized", {});
  await expectHttpError(bad, {
    id: "T6",
    name: "NEXO_API_KEY inválida → 401 OperationOutcome (autenticación)",
    toolArgs: { json_content: JSON.stringify(template) },
  });
  await bad.close();

  // ---- resumen
  const passed = results.filter((r) => r.pass).length;
  console.log(`\n${"=".repeat(60)}\nResultado: ${passed}/${results.length} pruebas OK ` +
    `(${results.filter((r) => !r.pass).map((r) => r.id).join(", ") || "sin fallas"})`);
  process.exit(passed === results.length ? 0 : 1);
}

main().catch(async (err) => {
  console.error(`\n💥 Falla del arnés: ${err.message}`);
  process.exit(2);
});
