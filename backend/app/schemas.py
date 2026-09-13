from pydantic import BaseModel, Field
from typing import Literal, List, Optional
from datetime import datetime

class Paciente(BaseModel):
    tipo_id: Literal["CC", "TI", "CE", "PA"]
    numero_id: str
    nombre: str
    apellido: str
    fecha_nacimiento: str  # YYYY-MM-DD
    sexo: Literal["M", "F", "O"]

class Diagnostico(BaseModel):
    codigo: str
    descripcion: str
    tipo: Literal["principal", "secundario"] = "principal"

class Medicamento(BaseModel):
    codigo: str
    descripcion: str
    cantidad: int
    unidad: str
    frecuencia: str
    dias: int

class RDAInput(BaseModel):
    """Entrada simple de IPS → Nexo traduce a FHIR"""
    rda_type: Literal["consulta_ambulatoria", "hospitalizacion", "urgencias"]
    paciente: Paciente
    encuentro: dict
    diagnosticos: List[Diagnostico]
    procedimientos: List[dict]
    medicamentos: List[Medicamento]
    alergias: Optional[List[dict]] = None
    observaciones: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "rda_type": "consulta_ambulatoria",
                "paciente": {
                    "tipo_id": "CC",
                    "numero_id": "1234567890",
                    "nombre": "Juan",
                    "apellido": "Pérez",
                    "fecha_nacimiento": "1980-01-15",
                    "sexo": "M"
                },
                "encuentro": {
                    "fecha_inicio": "2026-09-12T14:30:00",
                    "fecha_fin": "2026-09-12T15:15:00",
                    "tipo_encuentro": "consulta",
                    "organizacion": {
                        "numero_habilitacion": "0987654321",
                        "sede": "00"
                    },
                    "profesional": {
                        "tipo_id": "CC",
                        "numero_id": "1000000001",
                        "especialidad": "100101"
                    }
                },
                "diagnosticos": [
                    {
                        "codigo": "E11",
                        "descripcion": "Diabetes mellitus tipo 2",
                        "tipo": "principal"
                    }
                ],
                "procedimientos": [],
                "medicamentos": [
                    {
                        "codigo": "C05BA04",
                        "descripcion": "Omeprazol 20 mg",
                        "cantidad": 30,
                        "unidad": "comprimido",
                        "frecuencia": "1 cada 12 horas",
                        "dias": 30
                    }
                ],
                "alergias": [],
                "observaciones": "Paciente presenta hiperglicemia sostenida"
            }
        }