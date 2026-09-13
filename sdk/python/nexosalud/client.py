import requests
from typing import Dict, Optional
from .schemas import RDAInput
from .exceptions import NexoSaludError, ValidationError, AuthenticationError, NotFoundError


class NexoSaludClient:
    """
    Cliente simple para IPS.
    
    Uso:
    client = NexoSaludClient(api_key="xxx", api_secret="yyy")
    result = client.send_rda(rda_data)
    """
    
    def __init__(self, api_key: str, api_secret: str, base_url: str = "https://api.nexosalud.com"):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = base_url.rstrip("/")
        self.token: Optional[str] = None
        self.token_expires_at: Optional[float] = None
    
    def authenticate(self) -> str:
        """Obtener token OAuth2"""
        import time
        response = requests.post(
            f"{self.base_url}/auth/token",
            json={"client_id": self.api_key, "client_secret": self.api_secret},
            timeout=10
        )
        if response.status_code != 200:
            raise AuthenticationError("Autenticación fallida")
        data = response.json()
        self.token = data["access_token"]
        # Asumir expiración en 1 hora si no viene en respuesta
        self.token_expires_at = time.time() + data.get("expires_in", 3600)
        return self.token
    
    def _get_token(self) -> str:
        """Obtener token válido, refrescando si es necesario"""
        import time
        if not self.token or (self.token_expires_at and time.time() >= self.token_expires_at - 60):
            self.authenticate()
        return self.token
    
    def send_rda(self, rda_data: Dict) -> Dict:
        """
        Enviar RDA a NexoSalud.
        
        Args:
            rda_data: Dict con estructura RDAInput
        
        Returns:
            {
                "status": "accepted|rejected",
                "rda_id": "RDA-001234",
                "message": "...",
                "errors": [...]  # Si fue rechazado
            }
        
        Raises:
            ValidationError: Si el JSON no es válido
            NexoSaludError: Si hay error en servidor
        """
        # Validar schema localmente (fail fast)
        try:
            RDAInput(**rda_data)
        except Exception as e:
            raise ValidationError(f"JSON inválido: {str(e)}")
        
        # Enviar a servidor
        token = self._get_token()
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        response = requests.post(
            f"{self.base_url}/api/v1/rda/send",
            json=rda_data,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 401:
            self.token = None  # Forzar re-autenticación
            token = self._get_token()
            headers["Authorization"] = f"Bearer {token}"
            response = requests.post(
                f"{self.base_url}/api/v1/rda/send",
                json=rda_data,
                headers=headers,
                timeout=30
            )
        
        if response.status_code == 404:
            raise NotFoundError("Endpoint", "/api/v1/rda/send")
        
        if response.status_code >= 400:
            try:
                error_data = response.json()
                raise NexoSaludError(f"Error {response.status_code}: {error_data.get('detail', response.text)}")
            except ValueError:
                raise NexoSaludError(f"Error {response.status_code}: {response.text}")
        
        return response.json()
    
    def get_rda_status(self, rda_id: str) -> Dict:
        """Consultar estado de RDA"""
        token = self._get_token()
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{self.base_url}/api/v1/rda/{rda_id}",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 404:
            raise NotFoundError("RDA", rda_id)
        
        if response.status_code != 200:
            raise NexoSaludError(f"Error consultando RDA {rda_id}: {response.text}")
        
        return response.json()
    
    def validate_patient(self, tipo_id: str, numero_id: str) -> bool:
        """Verificar que paciente exista en EVOL antes de enviar"""
        token = self._get_token()
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        response = requests.post(
            f"{self.base_url}/api/v1/patient/validate",
            json={"tipo_id": tipo_id, "numero_id": numero_id},
            headers=headers,
            timeout=10
        )
        
        if response.status_code != 200:
            return False
        
        return response.json().get("valid", False)