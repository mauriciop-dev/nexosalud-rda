-- Índices para optimizar el rendimiento del Dashboard
-- Fecha: 2026-03-13

-- Tabla: rda_records
CREATE INDEX IF NOT EXISTS idx_rda_records_tenant_id ON rda_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rda_records_created_at ON rda_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rda_records_tenant_created ON rda_records(tenant_id, created_at DESC);

-- Tabla: patients
CREATE INDEX IF NOT EXISTS idx_patients_documento ON patients(documento);
CREATE INDEX IF NOT EXISTS idx_patients_tipo_documento ON patients(tipo_documento);

-- Tabla: auditoria_logs
CREATE INDEX IF NOT EXISTS idx_auditoria_logs_timestamp ON auditoria_logs(timestamp DESC);

-- Tabla: envios_rda (schema original)
CREATE INDEX IF NOT EXISTS idx_envios_rda_created_at ON envios_rda(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_envios_rda_estado ON envios_rda(estado_envio);
