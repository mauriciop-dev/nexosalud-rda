# Guía de Instalación: NexoSalud RDA Enterprise Edition 🏥

Esta guía está dirigida a los departamentos de TI de las IPS que deseen desplegar NexoSalud RDA de forma local y soberana, sin dependencia de servicios en la nube.

## 📋 Requisitos Previos
1.  **Docker & Docker Compose:** Tener instalada la última versión estable.
2.  **Hardware Recomendado (Para IA Local):**
    *   **CPU:** 8 núcleos o más.
    *   **RAM:** 16GB (Mínimo), 32GB (Recomendado).
    *   **GPU:** Opcional pero recomendada (NVIDIA con 8GB+ VRAM) para mayor velocidad de extracción.
3.  **Sistema Operativo:** Linux (Ubuntu 22.04 LTS recomendado) o Windows Server con WSL2.

## 🚀 Pasos para la Instalación

### 1. Clonar o Descargar el Paquete
Descargue el paquete proporcionado por NexoSalud en el servidor local.

### 2. Configuración de Entorno
Cree o edite el archivo `backend/.env` con la siguiente configuración base:

```env
APP_MODE=enterprise
LICENSE_SECRET=tu_secreto_proporcionado
GEMINI_API_KEY=opcional_si_hay_internet
GROQ_API_KEY=opcional_si_hay_internet
```

### 3. Iniciar Servicios
Ejecute el siguiente comando en la raíz del proyecto:

```bash
docker-compose up -d
```

Esto levantará 4 servicios:
-   **nexosalud-db:** Base de datos PostgreSQL local.
-   **nexosalud-backend:** API de procesamiento y validación.
-   **nexosalud-frontend:** Interfaz premium para médicos.
-   **nexosalud-ollama:** Motor de IA local (Llama 3.1).

### 4. Configuración del Motor de IA (Offline)
Si el servidor no tiene acceso a internet, el sistema utilizará automáticamente **Ollama**. Asegúrese de que el modelo esté descargado dentro del contenedor o mapeado en los volúmenes configurados.

## 🔑 Validación de Licencia
Para que la extracción funcione en modo Enterprise, se requiere enviar la `license_key` en las peticiones. 

Para generar una llave para su IPS, contacte a soporte o use la utilidad interna:
`expected_hash = sha256(ips_name.lower() + secret_salt)`

## 🛡️ Seguridad y Respaldo
-   **Base de Datos:** Los datos persistentes se guardan en el volumen `nexosalud-db-data`.
-   **Aislamiento:** No se realiza ninguna conexión externa a menos que se configure explícitamente un motor Cloud (Groq/Gemini).

---
**Soporte Técnico:** soporte@nexosalud.com
