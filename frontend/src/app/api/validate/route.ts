
import { NextResponse } from 'next/server';
import { FhirBundleSchema, createOperationOutcome } from '@/lib/fhir';

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('X-Nexo-API-Key');
    // Para el Sandbox, requerimos la llave pública de pruebas
    if (apiKey !== 'sandbox_key_123') {
      return NextResponse.json(createOperationOutcome(["Autenticación fallida. Use 'sandbox_key_123' para el ambiente de pruebas."]), { status: 401 });
    }

    const body = await request.json();
    
    // Validación real usando Zod contra el estándar FHIR R4
    const validationResult = FhirBundleSchema.safeParse(body);

    if (!validationResult.success) {
      // Mapear los errores de Zod al estándar FHIR OperationOutcome
      // (zod v4 expone los errores en .issues; .errors ya no existe)
      const zodErrors = (validationResult.error as any).issues ?? (validationResult.error as any).errors ?? [];
      const errors = zodErrors.map((err: any) => err.message);
      return NextResponse.json(createOperationOutcome(errors), { status: 400 });
    }

    // Si es válido, retornamos una simulación exitosa de la API real
    return NextResponse.json({
      status: "Success",
      message: "Validación HL7 FHIR R4 exitosa. El payload cumple con la Res. 1799.",
      simulated_response: {
        vida_code: `VIDA-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
        status: 202
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(createOperationOutcome(["Payload no es un JSON válido."]), { status: 400 });
  }
}
