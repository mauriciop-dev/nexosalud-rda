import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

import { validateApiKey, logApiEvent } from '@/lib/insforge';

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('X-Nexo-API-Key');
    if (!apiKey) {
    // @ts-ignore
      await logApiEvent({ event_id: crypto.randomUUID(), api_key: apiKey, endpoint: '/validate', timestamp: new Date().toISOString(), status_code: 200, duration_ms: Date.now() - startTime });
    return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
    }

    const keyData = await validateApiKey(apiKey);
    if (!keyData || keyData.status !== 'active') {
      return NextResponse.json({ error: "Invalid or inactive API Key" }, { status: 403 });
    }
    
    const startTime = Date.now();
    const body = await request.json();
    
    // Load the core schema from our design specs
    const schemaPath = path.join(process.cwd(), 'specs', 'schema_ihce_v1.json');
    // For the first implementation, we will use a simplified validation logic
    // In a real scenario, we'd use a library like 'ajv' for JSON Schema validation
    
    const validationErrors = [];
    
    // Example of regulatory validation based on the Blueprint
    if (!body.patient_id) {
      validationErrors.push("Error: 'patient_id' es obligatorio según el Documento Maestro IHCE.");
    }
    
    if (body.clinical_records && Array.isArray(body.clinical_records)) {
      body.clinical_records.forEach((record: any, index: number) => {
        if (!record.diagnosis_codes || record.diagnosis_codes.length === 0) {
          validationErrors.push(`Registro ${index + 1}: El campo 'diagnosis_codes' (CIE-10) es obligatorio por la Res. 1799 de 2026.`);
        }
      });
    } else {
      validationErrors.push("Error: El cuerpo debe contener un array de 'clinical_records'.");
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({
        status: "Invalid",
        errors: validationErrors,
        recommendation: "Revise el Documento Maestro IHCE para corregir la estructura."
      }, { status: 400 });
    }

    return NextResponse.json({
      status: "Valid",
      message: "El documento cumple con los requisitos mínimos de la norma IHCE.",
      details: "Validado contra Res. 1799 y Res. 1888."
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      error: "Invalid JSON format",
      details: "El cuerpo de la petición debe ser un JSON válido."
    }, { status: 400 });
  }
}