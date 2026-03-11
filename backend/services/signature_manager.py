import json
import base64
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.serialization import pkcs12
from authlib.jose import jwt
import os

class SignatureManager:
    """
    Gestiona la firma digital de documentos FHIR siguiendo el estándar JWS (Resol. 1888/Vulcano).
    """
    
    def __init__(self):
        self.private_key = None
        self.certificate = None
        self.initialized = False

    def load_certificate(self, p12_data: bytes, password: str):
        """
        Carga un certificado PKCS#12 (.p12) y extrae la llave privada y el certificado.
        """
        try:
            # En versiones modernas de cryptography, pkcs12.load_key_and_certificates es preferido
            private_key, certificate, additional_certificates = pkcs12.load_key_and_certificates(
                p12_data, 
                password.encode() if password else None
            )
            self.private_key = private_key
            self.certificate = certificate
            self.initialized = True
            return True
        except Exception as e:
            print(f"❌ Error cargando certificado .p12: {str(e)}")
            return False

    def sign_bundle(self, bundle_dict: dict) -> str:
        """
        Firma un Bundle FHIR (diccionario) y devuelve el JWS compacto.
        """
        if not self.initialized or not self.private_key:
            # Modo Simulado si no hay certificado cargado
            print("⚠️ Firma Digital: Usando modo simulado (sin certificado real)")
            return "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.SIMULATED_PAYLOAD.SIMULATED_SIGNATURE"

        header = {"alg": "RS256", "typ": "JWT"}
        # Usamos authlib para generar la firma JWS (compacta)
        # Nota: El payload es el Bundle completo
        token = jwt.encode(header, bundle_dict, self.private_key)
        return token.decode('utf-8')

    def verify_signature(self, jws: str):
        """
        Verifica una firma JWS utilizando el certificado cargado (llave pública).
        """
        if not self.initialized or not self.certificate:
            return False
            
        public_key = self.certificate.public_key()
        try:
            claims = jwt.decode(jws, public_key)
            claims.validate()
            return True
        except Exception as e:
            print(f"❌ Error verificando firma: {str(e)}")
            return False
