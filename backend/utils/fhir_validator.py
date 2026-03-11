import re
import json

class FHIRValidator:
    """
    Validador previo para asegurar que los datos cumplen con los 
    requerimientos mínimos de Vulcano (MinSalud Colombia).
    """

    def validate_bundle(self, bundle_str: str) -> dict:
        try:
            bundle = json.loads(bundle_str)
        except Exception as e:
            return {"valid": False, "error": f"JSON inválido: {str(e)}"}

        errors = []

        # 1. Validar REPS (12 dígitos)
        org_entry = next((e for e in bundle.get("entry", []) if e.get("resource", {}).get("resourceType") == "Organization"), None)
        if org_entry:
            reps = org_entry["resource"].get("identifier", [{}])[0].get("value", "")
            if not re.match(r"^\d{12}$", reps):
                errors.append(f"Código REPS inválido: '{reps}'. Debe tener exactamente 12 dígitos.")

        # 2. Validar Diagnósticos (CIE-10 básico: Letra + 2 o 3 números)
        conditions = [e["resource"] for e in bundle.get("entry", []) if e.get("resource", {}).get("resourceType") == "Condition"]
        for cond in conditions:
            code = cond.get("code", {}).get("coding", [{}])[0].get("code", "")
            if not re.match(r"^[A-Z][0-9][0-9][0-9]?[A-Z0-9]?$", code.replace(".", "")):
                errors.append(f"Código CIE-10 posiblemente inválido: '{code}' para '{cond.get('code', {}).get('text')}'")

        # 3. Validar Estructura de Bundle
        if bundle.get("type") != "transaction":
            errors.append("El Bundle debe ser de tipo 'transaction'.")

        # 4. Validar Presencia de Composition
        comp_entry = next((e for e in bundle.get("entry", []) if e.get("resource", {}).get("resourceType") == "Composition"), None)
        if not comp_entry:
            errors.append("Falta el recurso 'Composition' (carátula del documento).")

        return {
            "valid": len(errors) == 0,
            "errors": errors
        }
