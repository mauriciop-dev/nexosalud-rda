import uuid
import json
from datetime import datetime
from typing import Optional, List, Dict


class FHIRFormatter:
    """
    Traduce datos extraídos por la IA al estándar HL7 FHIR R4 
    siguiendo las especificaciones del Manual de Operaciones v1.3 de MinSalud Colombia.
    """

    def _split_name(self, full_name: str) -> Dict[str, str]:
        """
        Divide un nombre completo en nombres y apellidos de forma básica.
        """
        parts = full_name.strip().split()
        if len(parts) >= 4:
            return {
                "given": f"{parts[0]} {parts[1]}",
                "family": f"{parts[2]} {parts[3]}"
            }
        elif len(parts) == 3:
            return {
                "given": parts[0],
                "family": f"{parts[1]} {parts[2]}"
            }
        elif len(parts) == 2:
            return {
                "given": parts[0],
                "family": parts[1]
            }
        else:
            return {
                "given": full_name,
                "family": ""
            }

    def _clean_id_value(self, value: str, id_type: str = "CC") -> str:
        """
        Limpia el valor del ID para que sea válido en referencias FHIR (solo alfanumérico).
        """
        clean = str(value).replace(".", "").replace(",", "").replace(" ", "")
        return f"{id_type}-{clean}"

    def format_rda(self, data: dict, reps_code: str = "110011234501", patient_id_type: str = "CC") -> str:
        """
        Genera un Bundle de tipo 'document' (MinSalud v1.3) que agrupa todos los recursos del RDA.
        """
        print(f"[FHIRFormatter] Formatting for MinSalud v1.3. Data: {list(data.keys())}")

        now_iso = datetime.now().strftime("%Y-%m-%dT%H:%M:%S-05:00")
        bundle_id = str(uuid.uuid4())
        
        tipo_atencion = data.get("tipo_atencion", "paciente").lower()
        
        profile_map = {
            "paciente": "https://fhir.minsalud.gov.co/rda/StructureDefinition/CompositionPatientStatementRDA",
            "hospitalizacion": "https://fhir.minsalud.gov.co/rda/StructureDefinition/CompositionHospitalizationRDA",
            "urgencias": "https://fhir.minsalud.gov.co/rda/StructureDefinition/CompositionEmergencyRDA",
            "consulta": "https://fhir.minsalud.gov.co/rda/StructureDefinition/CompositionAmbulatoryRDA"
        }
        
        profile_url = profile_map.get(tipo_atencion, profile_map["paciente"])

        # IDs para referencias internas del Bundle (v1.3 usa referencias #id)
        patient_doc = data.get("patient_id") or data.get("Número documento") or "00000000"
        patient_id_value = self._clean_id_value(patient_doc, patient_id_type)
        
        practitioner_doc = data.get("practitioner_id") or data.get("Documento médico") or "111111111"
        practitioner_id_value = self._clean_id_value(practitioner_doc, patient_id_type)
        
        patient_full_name = data.get("patient_name") or data.get("Nombre") or "Paciente Desconocido"
        name_parts = self._split_name(str(patient_full_name))
        
        attention_date = data.get("attention_date") or data.get("Fecha de atención") or now_iso[:10]
        
        ips_name = data.get("ips_name") or "IPS NexoSalud"
        
        entries = []

        # ── 1. Recurso Patient (entry[1] según v1.3 Postman) ──
        patient_resource = {
            "resourceType": "Patient",
            "id": patient_id_value,
            "active": True,
            "name": [{
                "use": "official",
                "text": str(patient_full_name),
                "family": name_parts["family"],
                "given": [name_parts["given"]]
            }],
            "identifier": [{
                "use": "official",
                "type": {
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                        "code": patient_id_type
                    }]
                },
                "system": "http://minsalud.gov.co/interoperabilidad/identificacion",
                "value": str(patient_doc)
            }]
        }
        entries.append({
            "fullUrl": f"urn:uuid:{uuid.uuid4()}",
            "resource": patient_resource
        })

        # ── 2. Recurso Organization (IPS) ──
        organization_resource = {
            "resourceType": "Organization",
            "id": reps_code,
            "identifier": [{
                "system": "http://minsalud.gov.co/reps",
                "value": reps_code
            }],
            "name": ips_name
        }
        entries.append({
            "fullUrl": f"urn:uuid:{uuid.uuid4()}",
            "resource": organization_resource
        })

        # ── 3. Recurso Practitioner (Profesional) ──
        practitioner_resource = {
            "resourceType": "Practitioner",
            "id": practitioner_id_value,
            "identifier": [{
                "use": "official",
                "type": {
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                        "code": patient_id_type
                    }]
                },
                "value": str(practitioner_doc)
            }],
            "name": [{
                "use": "official",
                "text": data.get("practitioner_name") or "Profesional de Salud"
            }]
        }
        entries.append({
            "fullUrl": f"urn:uuid:{uuid.uuid4()}",
            "resource": practitioner_resource
        })

        # ── 4. Recurso Encounter ──
        encounter_resource = {
            "resourceType": "Encounter",
            "id": "Encounter-0",
            "status": "finished",
            "class": {
                "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                "code": "AMB",
                "display": "ambulatory"
            },
            "subject": {"reference": f"#{patient_id_value}"},
            "serviceProvider": {"reference": f"#{reps_code}"},
            "period": {
                "start": f"{attention_date}T08:00:00-05:00",
                "end": f"{attention_date}T08:30:00-05:00"
            }
        }
        entries.append({
            "fullUrl": f"urn:uuid:{uuid.uuid4()}",
            "resource": encounter_resource
        })

        # ── 5. Recursos Condition (Diagnósticos) ──
        diagnoses = data.get("diagnoses") or data.get("Diagnósticos") or []
        condition_refs = []
        
        for diag in diagnoses:
            cid = f"Condition-{uuid.uuid4().hex[:8]}"
            description = diag.get("description") if isinstance(diag, dict) else str(diag)
            code = diag.get("code") if isinstance(diag, dict) else "Z00"

            condition_resource = {
                "resourceType": "Condition",
                "id": cid,
                "subject": {"reference": f"#{patient_id_value}"},
                "code": {
                    "coding": [{
                        "system": "http://hl7.org/fhir/sid/icd-10",
                        "code": code,
                        "display": description
                    }],
                    "text": description
                }
            }
            entries.append({
                "fullUrl": f"urn:uuid:{uuid.uuid4()}",
                "resource": condition_resource
            })
            condition_refs.append({"reference": f"#{cid}"})

        # ── 6. Recursos AllergyIntolerance (Alergias) ──
        alergias = data.get("alergias") or data.get("Alergias") or []
        allergy_refs = []
        
        for allergy in alergias:
            aid = f"AllergyIntolerance-{uuid.uuid4().hex[:8]}"
            description = allergy.get("description") if isinstance(allergy, dict) else str(allergy)
            reaction = allergy.get("reaction") if isinstance(allergy, dict) else ""
            
            allergy_resource = {
                "resourceType": "AllergyIntolerance",
                "id": aid,
                "clinicalStatus": {
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                        "code": "active"
                    }]
                },
                "type": "allergy",
                "category": ["medication"],
                "criticality": "low",
                "patient": {"reference": f"#{patient_id_value}"},
                "code": {
                    "coding": [{
                        "system": "http://snomed.info/sct",
                        "code": "91935009",
                        "display": description
                    }],
                    "text": description
                },
                "reaction": [{
                    "manifestation": [{"text": reaction}],
                    "severity": "moderate"
                }] if reaction else None
            }
            if allergy_resource["reaction"]:
                allergy_resource["reaction"] = [r for r in allergy_resource["reaction"] if r is not None]
            
            entries.append({
                "fullUrl": f"urn:uuid:{uuid.uuid4()}",
                "resource": allergy_resource
            })
            allergy_refs.append({"reference": f"#{aid}"})

        # ── 7. Recursos para Antecedentes (Observation) ──
        antecedentes = data.get("antecedentes") or data.get("Antecedentes") or []
        antecedent_refs = []
        
        for ant in antecedentes:
            oid = f"Observation-antecedente-{uuid.uuid4().hex[:8]}"
            description = ant.get("description") if isinstance(ant, dict) else str(ant)
            
            observation_resource = {
                "resourceType": "Observation",
                "id": oid,
                "status": "final",
                "category": [{
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                        "code": "history",
                        "display": "History"
                    }]
                }],
                "code": {
                    "coding": [{
                        "system": "http://snomed.info/sct",
                        "code": "404684003",
                        "display": "Clinical finding"
                    }],
                    "text": description
                },
                "subject": {"reference": f"#{patient_id_value}"},
                "valueString": description
            }
            entries.append({
                "fullUrl": f"urn:uuid:{uuid.uuid4()}",
                "resource": observation_resource
            })
            antecedent_refs.append({"reference": f"#{oid}"})

        # ── 8. Secciones de la Composition ──
        sections = []

        # Sección de Diagnósticos (Requerida)
        section_diagnosticos = {
            "title": "Diagnósticos",
            "code": {
                "coding": [{"system": "http://loinc.org", "code": "29548-5"}]
            }
        }
        if condition_refs:
            section_diagnosticos["entry"] = condition_refs
        else:
            section_diagnosticos["emptyReason"] = {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/list-empty-reason",
                    "code": "nilknown",
                    "display": "Nil Known"
                }]
            }
        sections.append(section_diagnosticos)

        # Sección de Alergias
        section_alergias = {
            "title": "Alergias e Intolerancias",
            "code": {
                "coding": [{"system": "http://loinc.org", "code": "48765-2"}]
            }
        }
        if allergy_refs:
            section_alergias["entry"] = allergy_refs
        else:
            section_alergias["emptyReason"] = {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/list-empty-reason",
                    "code": "nilknown",
                    "display": "Nil Known"
                }]
            }
        sections.append(section_alergias)

        # Sección de Antecedentes
        section_antecedentes = {
            "title": "Antecedentes",
            "code": {
                "coding": [{"system": "http://loinc.org", "code": "11348-6"}]
            }
        }
        if antecedent_refs:
            section_antecedentes["entry"] = antecedent_refs
        else:
            section_antecedentes["emptyReason"] = {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/list-empty-reason",
                    "code": "nilknown",
                    "display": "Nil Known"
                }]
            }
        sections.append(section_antecedentes)

        # ── 9. Recurso Composition (entry[0] - PRIMER ELEMENTO según v1.3) ──
        composition_resource = {
            "resourceType": "Composition",
            "id": "Composition-0",
            "meta": {
                "profile": [profile_url]
            },
            "status": "final",
            "type": {
                "coding": [{
                    "system": "http://loinc.org", 
                    "code": "102089-0",
                    "display": "FHIR resource patient medical record"
                }]
            },
            "subject": {"reference": f"#{patient_id_value}"},
            "encounter": {"reference": "#Encounter-0"},
            "date": now_iso,
            "author": [{"reference": f"#{practitioner_id_value}"}],
            "title": f"Resumen Digital de Atención - {patient_full_name}",
            "confidentiality": "N",
            "attester": [
                {
                    "mode": "legal",
                    "party": {"reference": f"#{reps_code}"}
                }
            ],
            "custodian": {"reference": f"#{reps_code}"},
            "section": sections
        }
        
        composition_entry = {
            "fullUrl": f"urn:uuid:{uuid.uuid4()}",
            "resource": composition_resource
        }

        # ── 10. Ensamblar Bundle Final (Composition PRIMERO) ──
        # Insertar Composition al inicio de la lista de entries
        final_entries = [composition_entry] + entries
        
        bundle = {
            "resourceType": "Bundle",
            "language": "es-CO",
            "identifier": {
                "system": "http://minsalud.gov.co/interoperabilidad/bundle",
                "value": bundle_id
            },
            "type": "document",
            "timestamp": now_iso,
            "entry": final_entries
        }

        return json.dumps(bundle, ensure_ascii=False, indent=2)
