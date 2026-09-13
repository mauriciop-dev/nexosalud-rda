class NexoSaludError(Exception):
    """Excepción base para errores de NexoSalud"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ValidationError(NexoSaludError):
    """Error de validación de schema JSON"""
    def __init__(self, message: str):
        super().__init__(f"JSON inválido: {message}", 400)


class AuthenticationError(NexoSaludError):
    """Error de autenticación/autorización"""
    def __init__(self, message: str = "Token inválido o expirado"):
        super().__init__(message, 401)


class NotFoundError(NexoSaludError):
    """Recurso no encontrado"""
    def __init__(self, resource: str, identifier: str):
        super().__init__(f"{resource} no encontrado: {identifier}", 404)


class ConflictError(NexoSaludError):
    """Conflicto de recurso (ej. encounter duplicado)"""
    def __init__(self, message: str):
        super().__init__(message, 409)


class IHCEGatewayError(NexoSaludError):
    """Error comunicándose con IHCE Ministerio"""
    def __init__(self, message: str):
        super().__init__(f"Error IHCE Gateway: {message}", 502)