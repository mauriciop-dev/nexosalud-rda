# Nexo Salud MCP — Sandbox

MCP Server que conecta tu asistente de IA (Cursor, Claude Desktop, VS Code/Cline) con el
sandbox de Nexo Salud para validar documentos HL7 FHIR R4 (Res. 1799 de 2026).

## 1. Instalar

Requiere Node.js 18 o superior.

```bash
npm install
```

## 2. Configurar tu cliente

El servidor ya viene apuntando al sandbox público (`sandbox_key_123`), no necesitas llaves propias.

**Cursor** — crea `.cursor/mcp.json` en tu proyecto:

```json
{
  "mcpServers": {
    "nexo-salud": {
      "command": "node",
      "args": ["/ruta/absoluta/a/nexo-mcp/index.js"]
    }
  }
}
```

**Claude Desktop** — en `claude_desktop_config.json` (Settings → Developer):

```json
{
  "mcpServers": {
    "nexo-salud": {
      "command": "node",
      "args": ["/ruta/absoluta/a/nexo-mcp/index.js"]
    }
  }
}
```

**VS Code / Cline** — agrega a `cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "nexo-salud": {
      "command": "node",
      "args": ["/ruta/absoluta/a/nexo-mcp/index.js"],
      "env": {},
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## 3. Probar

Abre tu asistente y pide:

> Usa la herramienta `get_sandbox_data` de nexo-salud y luego genera un bundle con `generate_bundle_from_test_data` para el paciente 9876543210 en urgencias, y valídalo con `validate_rda_schema`.

Deberías recibir una respuesta `Success` con un código `VIDA-XXXX` simulado del sandbox.

También puedes ejecutar la batería automatizada de pruebas (10 casos: herramientas, flujo end-to-end y errores):

```bash
node sandbox_test.mjs
```

## Herramientas disponibles

| Herramienta | Qué hace |
|---|---|
| `validate_rda_schema` | Valida un Bundle FHIR R4 contra la Res. 1799 antes de enviarlo a la IHCE. |
| `generate_fhir_template` | Genera una plantilla mínima de Bundle type=document para empezar. |
| `get_sandbox_data` | Lista los datos de prueba del sandbox: pacientes, profesionales y organizaciones (IPS). |
| `generate_bundle_from_test_data` | Compone un Bundle document completo (Composition, Patient, Practitioner, Organization, Encounter, Condition) a partir de los datos de prueba, con contextos `consulta`, `urgencias` o `hospitalizacion`. |

## Variables de entorno (opcionales)

| Variable | Default |
|---|---|
| `NEXO_API_URL` | `https://nexosalud-rda.vercel.app/api` |
| `NEXO_API_KEY` | `sandbox_key_123` |
| `NEXO_SANDBOX_DATA_DIR` | `./sandbox` junto a `index.js` |
