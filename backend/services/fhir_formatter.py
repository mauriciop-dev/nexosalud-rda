import uuid
import json
from datetime import datetime


class FHIRFormatter:
    """
    Traduce datos extraídos por la IA al estándar HL7 FHIR R4.
    Usa diccionarios puros para evitar validaciones estrictas del SDK
    mientras el extractor sigue madurando.
    """

    def format_rda(self, data: dict) -> str:
        print(f"[FHIRFormatter] Formatting data keys: {list(data.keys())}")

        now_iso = datetime.now().strftime("%Y-%m-%dT%H:%M:%S+00:00")
        bundle_id = str(uuid.uuid4())
        patient_id = str(uuid.uuid4())
        composition_id = str(uuid.uuid4())

        # ── 1. Extraer datos del paciente (admite claves en español e inglés) ──
        patient_name = (
            data.get("patient_name")
            or data.get("Nombre")
            or data.get("Paciente", {}).get("Nombre")
            or "Paciente No Identificado"
        )
        patient_doc = (
            data.get("patient_id")
            or data.get("Número documento")
            or data.get("Paciente", {}).get("Número documento")
        )
        attention_date = (
            data.get("attention_date")
            or data.get("Fecha de atención")
            or now_iso[:10]
        )

        # ── 2. Recurso Patient ──
        patient_resource = {
            "resourceType": "Patient",
            "id": patient_id,
            "active": True,
            "name": [{"text": str(patient_name)}],
        }
        if patient_doc:
            patient_resource["identifier"] = [{
                "system": "http://minsalud.gov.co/interoperabilidad/identificacion",
                "value": str(patient_doc)
            }]

        # ── 3. Recursos Condition (Diagnósticos) ──
        diagnoses = (
            data.get("diagnoses")
            or data.get("Diagnósticos")
            or []
        )
        condition_entries = []
        condition_refs = []

        for diag in diagnoses:
            cid = str(uuid.uuid4())
            if isinstance(diag, dict):
                description = (
                    diag.get("description")
                    or diag.get("descripción")
                    or diag.get("descripcion")
                    or "Sin descripción"
                )
                code = diag.get("code") or diag.get("Código CIE-10") or "Z00"
            else:
                description = str(diag)
                code = "Z00"

            condition_resource = {
                "resourceType": "Condition",
                "id": cid,
                "subject": {"reference": f"Patient/{patient_id}"},
                "code": {
                    "coding": [{
                        "system": "http://hl7.org/fhir/sid/icd-10",
                        "code": code,
                        "display": description
                    }],
                    "text": description
                },
                "clinicalStatus": {
                    "coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}]
                }
            }
            condition_entries.append({"resource": condition_resource})
            condition_refs.append({"reference": f"Condition/{cid}"})

        # ── 4. Recursos MedicationRequest (Medicamentos) ──
        medications = (
            data.get("medications")
            or data.get("Medicamentos")
            or []
        )
        medication_entries = []
        medication_refs = []

        for med in medications:
            mid = str(uuid.uuid4())
            if isinstance(med, dict):
                med_name = med.get("name") or med.get("nombre") or "Medicamento no especificado"
                dose = med.get("dose") or med.get("dosis") or ""
                freq = med.get("frequency") or med.get("frecuencia") or ""
                instructions = f"Dosis: {dose}, Frecuencia: {freq}".strip(", ")
            else:
                med_name = str(med)
                instructions = ""

            medication_resource = {
                "resourceType": "MedicationRequest",
                "id": mid,
                "status": "active",
                "intent": "order",
                "subject": {"reference": f"Patient/{patient_id}"},
                "medicationCodeableConcept": {
                    "text": med_name
                }
            }
            if instructions:
                medication_resource["dosageInstruction"] = [{"text": instructions}]
                
            medication_entries.append({"resource": medication_resource})
            medication_refs.append({"reference": f"MedicationRequest/{mid}"})

        # ── 5. Recursos Procedure (Procedimientos) ──
        procedures = (
            data.get("procedures")
            or data.get("Procedimientos")
            or []
        )
        procedure_entries = []
        procedure_refs = []

        for proc in procedures:
            pid = str(uuid.uuid4())
            if isinstance(proc, dict):
                proc_name = proc.get("name") or proc.get("nombre") or "Procedimiento no especificado"
            else:
                proc_name = str(proc)

            procedure_resource = {
                "resourceType": "Procedure",
                "id": pid,
                "status": "completed",
                "subject": {"reference": f"Patient/{patient_id}"},
                "code": {
                    "text": proc_name
                }
            }
            procedure_entries.append({"resource": procedure_resource})
            procedure_refs.append({"reference": f"Procedure/{pid}"})

        # ── 6. Recurso Composition ──
        sections = [{
            "title": "Diagnósticos y Hallazgos Clínicos",
            "code": {"text": "Diagnósticos"},
            "entry": condition_refs if condition_refs else []
        }]

        if medication_refs:
            sections.append({
                "title": "Medicamentos Recetados",
                "code": {"text": "Medicamentos"},
                "entry": medication_refs
            })

        if procedure_refs:
            sections.append({
                "title": "Procedimientos Médicos",
                "code": {"text": "Procedimientos"},
                "entry": procedure_refs
            })

        composition_resource = {
            "resourceType": "Composition",
            "id": composition_id,
            "status": "final",
            "type": {
                "coding": [{
                    "system": "http://loinc.org",
                    "code": "11506-3",
                    "display": "Progress note"
                }],
                "text": "Resumen Digital de Atención (RDA) - Resolución 1888"
            },
            "subject": {"reference": f"Patient/{patient_id}"},
            "date": now_iso,
            "author": [{"display": "Sistema NexoSalud RDA v1.0"}],
            "title": f"RDA - {str(patient_name)} - {attention_date}",
            "section": sections
        }

        # ── 7. Bundle final ──
        bundle = {
            "resourceType": "Bundle",
            "id": bundle_id,
            "type": "document",
            "timestamp": now_iso,
            "entry": [
                {"resource": composition_resource},
                {"resource": patient_resource},
            ] + condition_entries + medication_entries + procedure_entries
        }

        print(f"[FHIRFormatter] Bundle created with {len(bundle['entry'])} entries")
        return json.dumps(bundle, ensure_ascii=False, indent=2)
