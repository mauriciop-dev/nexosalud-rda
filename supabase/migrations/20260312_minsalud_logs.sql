-- Migración para añadir soporte a logs oficiales de MinSalud
ALTER TABLE rda_records ADD COLUMN IF NOT EXISTS request_id TEXT;
ALTER TABLE rda_records ADD COLUMN IF NOT EXISTS operation_outcome JSONB;
