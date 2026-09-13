"""NexoSalud SDK - Integración IHCE simplificada para IPS"""

from .client import NexoSaludClient
from .schemas import RDAInput, Paciente, Diagnostico, Medicamento
from .exceptions import (
    NexoSaludError,
    ValidationError,
    AuthenticationError,
    NotFoundError,
    ConflictError,
    IHCEGatewayError
)

__version__ = "0.1.0"
__all__ = [
    "NexoSaludClient",
    "RDAInput",
    "Paciente",
    "Diagnostico",
    "Medicamento",
    "NexoSaludError",
    "ValidationError",
    "AuthenticationError",
    "NotFoundError",
    "ConflictError",
    "IHCEGatewayError",
]