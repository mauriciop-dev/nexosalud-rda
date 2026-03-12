from abc import ABC, abstractmethod
from typing import Optional

class BaseDatabase(ABC):
    @abstractmethod
    async def save_rda(self, data: dict):
        pass

    @abstractmethod
    async def get_recent_rda(self, tenant_id: Optional[str] = None, limit: int = 5):
        pass

    @abstractmethod
    async def save_audit_log(self, data: dict):
        pass

    @abstractmethod
    async def upsert_patient(self, patient_data: dict) -> str:
        """Crea o actualiza un paciente y devuelve su ID."""
        pass

    @abstractmethod
    async def save_rda_record(self, rda_data: dict):
        """Guarda un registro RDA vinculado a un paciente."""
        pass

    @abstractmethod
    async def get_recent_records_with_patients(self, tenant_id: Optional[str] = None, limit: int = 10):
        """Obtiene registros recientes con JOIN a la tabla de pacientes."""
        pass
