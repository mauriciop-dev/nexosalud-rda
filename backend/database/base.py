from abc import ABC, abstractmethod

class BaseDatabase(ABC):
    @abstractmethod
    async def save_rda(self, data: dict):
        pass

    @abstractmethod
    async def get_recent_rda(self, tenant_id: str = None, limit: int = 5):
        pass

    @abstractmethod
    async def save_audit_log(self, data: dict):
        pass
