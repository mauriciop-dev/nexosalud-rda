import uuid
import json
from datetime import datetime
from typing import Optional


class FHIRFormatter:
    """
    Traduce datos extraídos por la IA al estándar HL7 FHIR R4 
    siguiendo la Guía de Implementación Vulcano (MinSalud Colombia).
    """

    def format_rda(self, data: dict, reps_code: str = "110011234501", patient_id_type: str = "CC") -> str:
        """
        Genera un Bundle de tipo 'transaction' que agrupa todos los recursos del RDA.
        """
        print(f"[FHIRFormatter] Formatting for Vulcano. Data: {list(data.keys())}")

        now_iso = datetime.now().strftime("%Y-%m-%dT%H:%M:%S+00:00")
        bundle_id = str(uuid.uuid4())
        
        # IDs temporales para las referencias internas del Bundle (fullUrl)
        patient_ref = f"urn:uuid:{uuid.uuid4()}"
        encounter_ref = f"urn:uuid:{uuid.uuid4()}"
        composition_ref = f"urn:uuid:{uuid.uuid4()}"
        organization_ref = f"urn:uuid:{uuid.uuid4()}"
        practitioner_ref = f"urn:uuid:{uuid.uuid4()}"

        # ── 1. Extraer datos básicos ──
        patient_name = data.get("patient_name") or data.get("Nombre") or "Paciente No Identificado"
        patient_doc = data.get("patient_id") or data.get("Número documento")
        attention_date = data.get("attention_date") or data.get("Fecha de atención") or now_iso[:10]
        summary = data.get("summary") or "Resumen de atención generado por IA."

        # ── 2. Recurso Organization (IPS) ──
        organization_resource = {
            "resourceType": "Organization",
            "id": organization_ref.replace("urn:uuid:", ""),
            "identifier": [{
                "system": "http://minsalud.gov.co/reps",
                "value": reps_code
            }],
            "name": data.get("ips_name") or "Servicio de Salud Nexo"
        }

        # ── 3. Recurso Patient (Con extenciones Core CO) ──
        patient_resource = {
            "resourceType": "Patient",
            "id": patient_ref.replace("urn:uuid:", ""),
            "active": True,
            "name": [{"text": str(patient_name)}],
            "identifier": [{
                "extension": [{
                    "url": "http://co.fhir.guide/StructureDefinition/TipoDocumento",
                    "valueCode": patient_id_type
                }],
                "system": "http://minsalud.gov.co/interoperabilidad/identificacion",
                "value": str(patient_doc) if patient_doc else "00000000"
            }]
        }

        # ── 4. Recurso Encounter (Contexto de la atención) ──
        encounter_resource = {
            "resourceType": "Encounter",
            "id": encounter_ref.replace("urn:uuid:", ""),
            "status": "finished",
            "class": {
                "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                "code": "AMB",
                "display": "ambulatory"
            },
            "subject": {"reference": patient_ref},
            "serviceProvider": {"reference": organization_ref},
            "period": {
                "start": attention_date + "T08:00:00+00:00",
                "end": attention_date + "T08:30:00+00:00"
            }
        }

        # ── 5. Recursos Condition (Diagnósticos CIE-10) ──
        diagnoses = data.get("diagnoses") or data.get("Diagnósticos") or []
        condition_entries = []
        condition_refs = []

        for diag in diagnoses:
            cid = f"urn:uuid:{uuid.uuid4()}"
            if isinstance(diag, dict):
                description = diag.get("description") or diag.get("descripción") or "Sin descripción"
                code = diag.get("code") or diag.get("Código CIE-10") or "Z00"
            else:
                description = str(diag)
                code = "Z00"

            condition_resource = {
                "resourceType": "Condition",
                "id": cid.replace("urn:uuid:", ""),
                "subject": {"reference": patient_ref},
                "encounter": {"reference": encounter_ref},
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
            condition_entries.append({
                "fullUrl": cid,
                "resource": condition_resource,
                "request": {"method": "POST", "url": "Condition"}
            })
            condition_refs.append({"reference": cid})

        # ── 6. Recursos MedicationRequest (Medicamentos CUM) ──
        medications = data.get("medications") or data.get("Medicamentos") or []
        medication_entries = []
        medication_refs = []

        for med in medications:
            mid = f"urn:uuid:{uuid.uuid4()}"
            if isinstance(med, dict):
                med_name = med.get("name") or med.get("nombre") or "Medicamento"
                dose = med.get("dose") or med.get("dosis") or ""
                freq = med.get("frequency") or med.get("frecuencia") or ""
                instructions = f"Dosis: {dose}, Frecuencia: {freq}".strip(", ")
            else:
                med_name = str(med)
                instructions = ""

            medication_resource = {
                "resourceType": "MedicationRequest",
                "id": mid.replace("urn:uuid:", ""),
                "status": "active",
                "intent": "order",
                "subject": {"reference": patient_ref},
                "encounter": {"reference": encounter_ref},
                "medicationCodeableConcept": {
                    "text": med_name
                }
            }
            if instructions:
                medication_resource["dosageInstruction"] = [{"text": instructions}]
                
            medication_entries.append({
                "fullUrl": mid,
                "resource": medication_resource,
                "request": {"method": "POST", "url": "MedicationRequest"}
            })
            medication_refs.append({"reference": mid})

        # ── 7. Recurso Composition (Carátula del documento) ──
        sections = [
            {
                "title": "Resumen de la Atención",
                "code": {"text": "Resumen"},
                "text": {"status": "generated", "div": f"<div xmlns=\"http://www.w3.org/1999/xhtml\">{summary}</div>"}
            },
            {
                "title": "Diagnósticos",
                "entry": condition_refs
            }
        ]
        if medication_refs:
            sections.append({
                "title": "Medicamentos Recetados",
                "entry": medication_refs
            })

        composition_resource = {
            "resourceType": "Composition",
            "id": composition_ref.replace("urn:uuid:", ""),
            "status": "final",
            "type": {
                "coding": [{"system": "http://loinc.org", "code": "11506-3"}],
                "text": "Resumen Digital de Atención"
            },
            "subject": {"reference": patient_ref},
            "encounter": {"reference": encounter_ref},
            "date": now_iso,
            "author": [{"reference": organization_ref}],
            "title": f"RDA - {patient_name}",
            "section": sections
        }

        # ── 8. Bundle Final (Tipo Transaction) ──
        bundle = {
            "resourceType": "Bundle",
            "id": bundle_id,
            "type": "transaction",
            "timestamp": now_iso,
            "entry": [
                {
                    "fullUrl": composition_ref,
                    "resource": composition_resource,
                    "request": {"method": "POST", "url": "Composition"}
                },
                {
                    "fullUrl": patient_ref,
                    "resource": patient_resource,
                    "request": {"method": "POST", "url": "Patient"}
                },
                {
                    "fullUrl": organization_ref,
                    "resource": organization_resource,
                    "request": {"method": "POST", "url": "Organization"}
                },
                {
                    "fullUrl": encounter_ref,
                    "resource": encounter_resource,
                    "request": {"method": "POST", "url": "Encounter"}
                }
            ] + condition_entries + medication_entries
        }

        return json.dumps(bundle, ensure_ascii=False, indent=2)
