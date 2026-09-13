# NexoSalud Python SDK

SDK oficial para integrar sistemas HIS/IPS con la plataforma NexoSalud (interoperabilidad IHCE Colombia).

## Instalación

```bash
pip install nexosalud
```

## Uso Rápido (15 min)

```python
from nexosalud import NexoSaludClient

# 1. Inicializar cliente con credenciales de Sandbox
client = NexoSaludClient(
    api_key="test-ips-001",
    api_secret="secret-ips-001-abc123xyz",
    base_url="https://sandbox.nexosalud.com"
)

# 2. Preparar RDA (JSON simple - datos de tu HIS)
rda_data = {
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

# 3. Enviar RDA
try:
    result = client.send_rda(rda_data)
    print(f"✅ RDA Enviado: {result['rda_id']}")
    print(f"Estado: {result['status']}")
except Exception as e:
    print(f"❌ Error: {e}")

# 4. Consultar estado
status = client.get_rda_status(result['rda_id'])
print(status)
```

## Validar paciente antes de enviar

```python
if client.validate_patient("CC", "1234567890"):
    print("Paciente existe en EVOL")
else:
    print("Paciente no encontrado en sandbox")
```

## Manejo de errores

```python
from nexosalud import ValidationError, AuthenticationError, NotFoundError

try:
    result = client.send_rda(rda_data)
except ValidationError as e:
    print(f"Datos inválidos: {e}")
except AuthenticationError:
    print("Credenciales inválidas")
except NotFoundError as e:
    print(f"No encontrado: {e}")
```

## Documentación

- [Guía de 15 min](https://docs.nexosalud.com/quickstart)
- [Schema JSON completo](https://docs.nexosalud.com/schema)
- [Códigos de error](https://docs.nexosalud.com/errors)

## Licencia

MIT