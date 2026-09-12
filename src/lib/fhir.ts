
import { z } from 'zod';

// Esquema Básico HL7 FHIR R4 para Documentos (Resolución Minsalud)
export const FhirBundleSchema = z.object({
  resourceType: z.literal("Bundle"),
  type: z.literal("document"),
  entry: z.array(z.object({
    resource: z.object({
      resourceType: z.string()
    }).passthrough()
  })).min(1, "El Bundle debe contener al menos un recurso en la entrada (entry).")
}).refine(data => {
  // Regla de Negocio: El primer recurso SIEMPRE debe ser Composition
  return data.entry[0].resource.resourceType === "Composition";
}, {
  message: "El primer recurso del Bundle (entry[0]) debe ser un recurso 'Composition'.",
  path: ["entry", 0]
});

// Helper para generar el OperationOutcome (Estándar de Error FHIR)
export function createOperationOutcome(issues: string[]) {
  return {
    resourceType: "OperationOutcome",
    issue: issues.map(issue => ({
      severity: "error",
      code: "invalid",
      diagnostics: issue
    }))
  };
}
