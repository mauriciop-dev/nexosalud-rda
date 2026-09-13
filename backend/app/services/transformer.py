"""Transformador JSON → FHIR Bundle (HL7 FHIR R4)"""
from datetime import datetime
from typing import Dict, Any, List
import uuid


def transform_to_fhir(rda_input: "RDAInput") -> Dict[str, Any]:
    """
    Transforma RDAInput (JSON simple) a FHIR Bundle válido
    """
    paciente = rda_input.paciente
    encuentro = rda_input.encuentro
    
    bundle = {
        "resourceType": "Bundle",
        "id": f"bundle-{uuid.uuid4()}",
        "type": "document",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "entry": [
            # 1. Composition (DEBE ser primer elemento)
            {
                "fullUrl": "urn:uuid:composition-0",
                "resource": build_composition(rda_input)
            },
            # 2. Patient
            {
                "fullUrl": f"urn:uuid:patient-{paciente.numero_id}",
                "resource": build_patient(paciente)
            },
            # 3. Encounter
            {
                "fullUrl": "urn:uuid:encounter-0",
                "resource": build_encounter(rda_input)
            },
            # 4. Conditions (Diagnósticos)
            *[
                {
                    "fullUrl": f"urn:uuid:condition-{idx}",
                    "resource": build_condition(dx, idx)
                }
                for idx, dx in enumerate(rda_input.diagnosticos)
            ],
            # 5. Procedures (Procedimientos)
            *[
                {
                    "fullUrl": f"urn:uuid:procedure-{idx}",
                    "resource": build_procedure(proc, idx)
                }
                for idx, proc in enumerate(rda_input.procedimientos)
            ],
            # 6. Medications
            *[
                {
                    "fullUrl": f"urn:uuid:medication-{idx}",
                    "resource": build_medication(med, idx)
                }
                for idx, med in enumerate(rda_input.medicamentos)
            ],
            # 7. Allergies
            *[
                {
                    "fullUrl": f"urn:uuid:allergy-{idx}",
                    "resource": build_allergy(alergia, idx)
                }
                for idx, alergia in enumerate(rda_input.alergias or [])
            ],
        ]
    }
    return bundle


def get_loinc_for_rda_type(rda_type: str) -> str:
    """Mapear tipo RDA a código LOINC"""
    mapping = {
        "consulta_ambulatoria": "34117-2",    # Ambulatory care note
        "hospitalizacion": "34133-9",         # Hospitalization summary
        "urgencias": "34108-1",               # Emergency department note
    }
    return mapping.get(rda_type, "34117-2")


def build_composition(rda_input: "RDAInput") -> Dict[str, Any]:
    """Construye recurso Composition (cabecera del RDA)"""
    paciente = rda_input.paciente
    encuentro = rda_input.encuentro
    org = encuentro.get("organizacion", {})
    prof = encuentro.get("profesional", {})
    
    return {
        "resourceType": "Composition",
        "id": f"composition-{uuid.uuid4()}",
        "identifier": {
            "system": "urn:ietf:rfc:3986",
            "value": f"urn:oid:2.16.578.1.12.4.1.1.{uuid.uuid4()}"
        },
        "status": "final",
        "type": {
            "coding": [{
                "system": "http://loinc.org",
                "code": get_loinc_for_rda_type(rda_input.rda_type),
                "display": rda_input.rda_type.replace("_", " ").title()
            }]
        },
        "subject": {
            "reference": f"Patient/{paciente.numero_id}",
            "display": f"{paciente.nombre} {paciente.apellido}"
        },
        "encounter": {
            "reference": "Encounter/encounter-0"
        },
        "date": datetime.utcnow().isoformat() + "Z",
        "author": [{
            "reference": f"Practitioner/{prof.get('numero_id', 'unknown')}",
            "display": f"Dr. {prof.get('nombre', '')} {prof.get('apellido', '')}".strip()
        }],
        "custodian": {
            "reference": f"Organization/{org.get('numero_habilitacion', 'unknown')}",
            "display": org.get("nombre", "Organización desconocida")
        },
        "title": f"RDA {rda_input.rda_type.replace('_', ' ').title()}",
        "section": build_sections(rda_input)
    }


def build_sections(rda_input: "RDAInput") -> List[Dict[str, Any]]:
    """Construye secciones del Composition"""
    sections = [
        {
            "title": "Diagnósticos",
            "code": {
                "coding": [{
                    "system": "http://loinc.org",
                    "code": "30954-2",
                    "display": "Diagnoses"
                }]
            },
            "entry": [
                {"reference": f"Condition/condition-{i}"} 
                for i in range(len(rda_input.diagnosticos))
            ]
        },
        {
            "title": "Procedimientos",
            "code": {
                "coding": [{
                    "system": "http://loinc.org",
                    "code": "47519-4",
                    "display": "Procedures"
                }]
            },
            "entry": [
                {"reference": f"Procedure/procedure-{i}"} 
                for i in range(len(rda_input.procedimientos))
            ]
        },
        {
            "title": "Medicamentos",
            "code": {
                "coding": [{
                    "system": "http://loinc.org",
                    "code": "10160-0",
                    "display": "Medications"
                }]
            },
            "entry": [
                {"reference": f"MedicationRequest/medication-{i}"} 
                for i in range(len(rda_input.medicamentos))
            ]
        },
        {
            "title": "Alergias",
            "code": {
                "coding": [{
                    "system": "http://loinc.org",
                    "code": "48765-2",
                    "display": "Allergies"
                }]
            },
            "entry": [
                {"reference": f"AllergyIntolerance/allergy-{i}"} 
                for i in range(len(rda_input.alergias or []))
            ],
            "emptyReason": {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/list-empty-reason",
                    "code": "nilknown",
                    "display": "Nil Known"
                }]
            } if not rda_input.alergias else None
        }
    ]
    # Filtrar secciones vacías y remover emptyReason si hay entradas
    result = []
    for sec in sections:
        if sec["entry"] or sec.get("emptyReason"):
            if not sec["entry"] and sec.get("emptyReason"):
                result.append({k: v for k, v in sec.items() if k != "entry"})
            else:
                result.append({k: v for k, v in sec.items() if k != "emptyReason" or v is None})
    return result


def build_patient(paciente) -> Dict[str, Any]:
    """Construye recurso Patient"""
    return {
        "resourceType": "Patient",
        "id": f"patient-{paciente.numero_id}",
        "identifier": [{
            "system": f"http://evol.minsalud.gov.co/tipos/{paciente.tipo_id}",
            "value": paciente.numero_id,
            "type": {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                    "code": "NI",
                    "display": "National unique individual identifier"
                }]
            }
        }],
        "name": [{
            "family": paciente.apellido,
            "given": [paciente.nombre],
            "use": "official"
        }],
        "gender": "male" if paciente.sexo == "M" else "female",
        "birthDate": paciente.fecha_nacimiento
    }


def build_encounter(rda_input: "RDAInput") -> Dict[str, Any]:
    """Construye recurso Encounter"""
    encuentro = rda_input.encuentro
    paciente = rda_input.paciente
    org = encuentro.get("organizacion", {})
    prof = encuentro.get("profesional", {})
    
    tipo_encuentro_map = {
        "consulta": "AMB",
        "procedimiento": "IMP",
        "internacion": "IMP"
    }
    
    return {
        "resourceType": "Encounter",
        "id": f"encounter-{uuid.uuid4()}",
        "status": "finished",
        "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": tipo_encuentro_map.get(encuentro.get("tipo_encuentro", "consulta"), "AMB"),
            "display": encuentro.get("tipo_encuentro", "consulta").title()
        },
        "type": [{
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/encounter-type",
                "code": encuentro.get("tipo_encuentro", "consulta"),
                "display": encuentro.get("tipo_encuentro", "consulta").title()
            }]
        }],
        "subject": {
            "reference": f"Patient/{paciente.numero_id}"
        },
        "period": {
            "start": encuentro.get("fecha_inicio"),
            "end": encuentro.get("fecha_fin")
        },
        "participant": [{
            "type": [{
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                    "code": "PPRF",
                    "display": "Primary performer"
                }]
            }],
            "individual": {
                "reference": f"Practitioner/{prof.get('numero_id', 'unknown')}",
                "display": f"Dr. {prof.get('nombre', '')} {prof.get('apellido', '')}".strip()
            }
        }],
        "serviceProvider": {
            "reference": f"Organization/{org.get('numero_habilitacion', 'unknown')}"
        }
    }


def build_condition(diagnostico, idx: int) -> Dict[str, Any]:
    """Construye recurso Condition (Diagnóstico)"""
    return {
        "resourceType": "Condition",
        "id": f"condition-{idx}",
        "clinicalStatus": {
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                "code": "active",
                "display": "Active"
            }]
        },
        "verificationStatus": {
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                "code": "confirmed",
                "display": "Confirmed"
            }]
        },
        "category": [{
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/condition-category",
                "code": "encounter-diagnosis",
                "display": "Encounter Diagnosis"
            }]
        }],
        "code": {
            "coding": [{
                "system": "http://hl7.org/fhir/sid/icd-10",
                "code": diagnostico.codigo,
                "display": diagnostico.descripcion
            }]
        },
        "subject": {
            "reference": f"Patient/{diagnostico.get('paciente_id', 'unknown')}"
        },
        "encounter": {
            "reference": "Encounter/encounter-0"
        },
        "recordedDate": datetime.utcnow().isoformat() + "Z"
    }


def build_procedure(procedimiento, idx: int) -> Dict[str, Any]:
    """Construye recurso Procedure"""
    return {
        "resourceType": "Procedure",
        "id": f"procedure-{idx}",
        "status": "completed",
        "code": {
            "coding": [{
                "system": "http://www.dane.gov.co/index.php/clasificaciones-y-estandares/cups",
                "code": procedimiento.get("codigo", ""),
                "display": procedimiento.get("descripcion", "")
            }]
        },
        "subject": {
            "reference": f"Patient/unknown"
        },
        "encounter": {
            "reference": "Encounter/encounter-0"
        },
        "performedDateTime": procedimiento.get("fecha", datetime.utcnow().isoformat() + "Z")
    }


def build_medication(medicamento, idx: int) -> Dict[str, Any]:
    """Construye recurso MedicationRequest"""
    return {
        "resourceType": "MedicationRequest",
        "id": f"medication-{idx}",
        "status": "active",
        "intent": "order",
        "medicationCodeableConcept": {
            "coding": [{
                "system": "http://www.whocc.no/atc",
                "code": medicamento.codigo,
                "display": medicamento.descripcion
            }]
        },
        "subject": {
            "reference": f"Patient/unknown"
        },
        "encounter": {
            "reference": "Encounter/encounter-0"
        },
        "authoredOn": datetime.utcnow().isoformat() + "Z",
        "dosageInstruction": [{
            "text": f"{medicamento.frecuencia} por {medicamento.dias} días",
            "timing": {
                "repeat": {
                    "frequency": 1,
                    "period": 1,
                    "periodUnit": "d",
                    "duration": medicamento.dias,
                    "durationUnit": "d"
                }
            },
            "doseAndRate": [{
                "type": {
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/dose-rate-type",
                        "code": "ordered",
                        "display": "Ordered"
                    }]
                },
                "doseQuantity": {
                    "value": medicamento.cantidad,
                    "unit": medicamento.unidad,
                    "system": "http://unitsofmeasure.org",
                    "code": medicamento.unidad
                }
            }]
        }]
    }


def build_allergy(alergia, idx: int) -> Dict[str, Any]:
    """Construye recurso AllergyIntolerance"""
    return {
        "resourceType": "AllergyIntolerance",
        "id": f"allergy-{idx}",
        "clinicalStatus": {
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                "code": "active",
                "display": "Active"
            }]
        },
        "verificationStatus": {
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                "code": "confirmed",
                "display": "Confirmed"
            }]
        },
        "type": "allergy" if alergia.get("tipo_reaccion") == "alergia" else "intolerance",
        "category": ["medication"] if alergia.get("tipo_reaccion") == "alergia" else ["environment"],
        "code": {
            "coding": [{
                "system": "http://snomed.info/sct",
                "code": alergia.get("codigo", ""),
                "display": alergia.get("descripcion", "")
            }]
        },
        "patient": {
            "reference": f"Patient/unknown"
        },
        "recordedDate": datetime.utcnow().isoformat() + "Z"
    }