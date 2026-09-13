import httpx
import os
import json
import uuid
import time
from typing import Optional, Dict, Any

class MinSaludClient:
    def __init__(self):
        self.apim_url = os.environ.get("MINSALUD_APIM_URL", "https://sandbox.ihcecol.gov.co/ihce")
        self.subscription_key = os.environ.get("MINSALUD_APIM_SUBSCRIPTION_KEY")
        self.tenant_id = os.environ.get("TENANT_ID")
        self.client_id = os.environ.get("CLIENT_ID")
        self.client_secret = os.environ.get("CLIENT_SECRET")
        self.scope = os.environ.get("MINSALUD_SCOPE", "api://ca9a5155-3135-4e44-a644-b92175eb4d21/.default")
        
        self._token: Optional[str] = None
        self._token_expires_at: float = 0

    async def _get_access_token(self) -> str:
        """
        Obtiene el access_token desde Microsoft Entra ID usando grant_type: Client_Credentials.
        """
        if self._token and time.time() < self._token_expires_at - 60:
            return self._token

        url = f"https://login.microsoftonline.com/{self.tenant_id}/oauth2/v2.0/token"
        data = {
            "grant_type": "Client_Credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "scope": self.scope
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, data=data)
            if response.status_code != 200:
                print(f"❌ Error obteniendo token: {response.text}")
                raise Exception(f"Error de autenticación Entra ID: {response.status_code}")
            
            token_data = response.json()
            self._token = token_data["access_token"]
            self._token_expires_at = time.time() + token_data.get("expires_in", 3600)
            return self._token

    async def send_rda(self, fhir_bundle: str, type_rda: str = "paciente") -> Dict[str, Any]:
        """
        Envía el Bundle FHIR al Bus de Interoperabilidad de MinSalud.
        type_rda puede ser: paciente, hospitalizacion, urgencias, consulta
        """
        token = await self._get_access_token()
        
        # Mapeo de rutas según el tipo de RDA
        endpoint_map = {
            "paciente": "/Composition/$enviar-rda-paciente",
            "hospitalizacion": "/Composition/$enviar-rda-hospitalizacion",
            "urgencias": "/Composition/$enviar-rda-urgencias",
            "consulta": "/Composition/$enviar-rda-consulta"
        }
        
        path = endpoint_map.get(type_rda.lower(), "/Composition/$enviar-rda-paciente")
        url = f"{self.apim_url}{path}"
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Ocp-Apim-Subscription-Key": self.subscription_key,
            "Content-Type": "application/fhir+json"
        }
        
        print(f"📡 Enviando RDA ({type_rda}) a MinSalud: {url}")
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, content=fhir_bundle, headers=headers, timeout=30.0)
                
                # Extraer request_id de los headers si está disponible (común en Azure APIM)
                request_id = response.headers.get("X-Request-Id") or response.headers.get("Request-Id")
                
                if response.status_code in [200, 201]:
                    res_json = response.json()
                    # El bus suele retornar un OperationOutcome o el recurso procesado
                    codigo_vida = res_json.get("id") or (res_json.get("issue", [{}])[0].get("diagnostics") if "issue" in res_json else None)
                    
                    return {
                        "status": "success",
                        "codigo_vida": codigo_vida,
                        "request_id": request_id,
                        "raw_response": res_json
                    }
                else:
                    print(f"⚠️ Error de MinSalud ({response.status_code}): {response.text}")
                    return {
                        "status": "error",
                        "status_code": response.status_code,
                        "request_id": request_id,
                        "operation_outcome": response.json() if "application/json" in response.headers.get("Content-Type", "") else response.text
                    }
            except Exception as e:
                print(f"❌ Error de conexión: {str(e)}")
                return {
                    "status": "error",
                    "error": str(e)
                }

    async def get_patient_summary(self, patient_id: str, id_type: str = "CC") -> Dict[str, Any]:
        """
        Consulta el resumen histórico del paciente en el Bus IHCE.
        """
        token = await self._get_access_token()
        url = f"{self.apim_url}/Composition/$consultar-rda-paciente"
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Ocp-Apim-Subscription-Key": self.subscription_key,
            "Content-Type": "application/fhir+json"
        }
        
        # Cuerpo según v1.3 para consulta
        payload = {
            "resourceType": "Parameters",
            "parameter": [
                {
                    "name": "identifier",
                    "part": [
                        {"name": "type", "valueString": id_type},
                        {"name": "value", "valueString": patient_id}
                    ]
                },
                {
                    "name": "humanuser",
                    "valueString": f"{id_type}-{patient_id}" # Simulado, debería ser el ID del médico
                }
            ]
        }
        
        print(f"📡 Consultando historial nacional para: {patient_id}")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Error consultando IHCE: {response.text}")
                raise Exception(f"Error MinSalud IHCE: {response.status_code}")
