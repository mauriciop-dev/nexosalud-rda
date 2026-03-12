-- Schemas para el proyecto NexoSalud RDA
-- Fase 10: Integración de Supabase & Modelo de Datos Completo

-- 1. Tabla de Pacientes
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_documento TEXT NOT NULL,
    documento TEXT NOT NULL,
    nombre_completo TEXT NOT NULL,
    fecha_nacimiento DATE,
    sexo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id UUID, -- Identificador de inquilino (Dr./Clínica)
    UNIQUE(documento, tipo_documento)
);

-- 2. Tabla de Registros RDA
CREATE TABLE IF NOT EXISTS rda_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    tipo_rda TEXT, -- Urgencias/Consulta/Hosp
    fecha_atencion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    json_fhir JSONB NOT NULL,
    codigo_vida TEXT,
    estado_envio TEXT DEFAULT 'Pendiente', -- Pendiente/Exitoso/Error
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tenant_id UUID -- Identificador de inquilino
);

-- 3. Tabla de Auditoría (Refinada)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID, -- Referencia al usuario que realiza la acción
    accion TEXT NOT NULL, -- Consulta/Carga/Descarga
    patient_id UUID REFERENCES patients(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ip_address TEXT,
    details JSONB,
    tenant_id UUID
);

-- Habilitar Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE rda_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad (Ejemplo: Segregación por tenant_id)
-- Nota: Estas políticas deben ajustarse según la configuración de Auth de Supabase
CREATE POLICY "Segregación de pacientes por tenant" ON patients 
    FOR ALL USING (tenant_id::text = auth.uid()::text OR tenant_id IS NULL);

CREATE POLICY "Segregación de registros RDA por tenant" ON rda_records 
    FOR ALL USING (tenant_id::text = auth.uid()::text OR tenant_id IS NULL);

CREATE POLICY "Segregación de logs por tenant" ON audit_logs 
    FOR ALL USING (tenant_id::text = auth.uid()::text OR tenant_id IS NULL);
