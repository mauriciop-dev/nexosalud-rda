-- 1. Tabla de IPS (Instituciones Prestadoras de Salud)
CREATE TABLE IF NOT EXISTS public.ips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razon_social TEXT NOT NULL,
    nit TEXT UNIQUE NOT NULL,
    codigo_habilitacion TEXT, -- Código REPS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Pacientes
CREATE TABLE IF NOT EXISTS public.pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_identificacion TEXT NOT NULL, -- CC, TI, RC, CE, PA
    numero_identificacion TEXT NOT NULL,
    primer_nombre TEXT NOT NULL,
    segundo_nombre TEXT,
    primer_apellido TEXT NOT NULL,
    segundo_apellido TEXT,
    fecha_nacimiento DATE NOT NULL,
    genero TEXT NOT NULL, -- M, F, O
    ips_id UUID REFERENCES public.ips(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tipo_identificacion, numero_identificacion)
);

-- 3. Tabla de Envíos RDA (Resumen Digital de Atención)
CREATE TABLE IF NOT EXISTS public.envios_rda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.pacientes(id),
    ips_id UUID REFERENCES public.ips(id),
    fecha_atencion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fhir_payload JSONB NOT NULL, -- El JSON HL7 FHIR final
    codigo_vida TEXT, -- El certificado retornado por MinSalud
    estado_envio TEXT DEFAULT 'borrador', -- borrador, procesando, enviado, error, validado
    error_log TEXT,
    archivo_original_url TEXT, -- Link a Supabase Storage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Auditoría (Cumplimiento Habeas Data)
CREATE TABLE IF NOT EXISTS public.auditoria_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID, -- Referencia a auth.users
    accion TEXT NOT NULL,
    recurso TEXT NOT NULL,
    detalles JSONB,
    ip_address TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envios_rda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria_logs ENABLE ROW LEVEL SECURITY;
