import hashlib
import os

class LicenseValidator:
    def __init__(self):
        self.secret_salt = os.environ.get("LICENSE_SECRET", "nexosalud_default_secret_2025")

    def validate_license(self, ips_name: str, license_key: str) -> bool:
        """
        Validates a license key based on the IPS name and a secret salt.
        In a real scenario, this could also involve hardware IDs or expiration dates.
        """
        if not ips_name or not license_key:
            return False
        
        # Simple verification logic: hash(ips_name + salt)
        # In production, this would be a signed JWT or a more complex cryptographic check.
        expected_hash = hashlib.sha256(f"{ips_name.lower()}{self.secret_salt}".encode()).hexdigest()
        
        # We check the first 16 characters for simplicity in the MVP
        return license_key.startswith(expected_hash[:16])

    def generate_key_for_ips(self, ips_name: str) -> str:
        """ Utility to generate keys for new enterprise clients """
        expected_hash = hashlib.sha256(f"{ips_name.lower()}{self.secret_salt}".encode()).hexdigest()
        return expected_hash[:16].upper()
