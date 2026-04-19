-- CargoMatch - Schema PostgreSQL
-- Ejecutar: psql -U cargomatch -d cargomatch -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- Maestros
-- =============================================================================

CREATE TABLE IF NOT EXISTS sku_master (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku             VARCHAR(64) NOT NULL UNIQUE,
    descripcion     TEXT NOT NULL,
    familia         VARCHAR(64),
    unidad_medida   VARCHAR(16) NOT NULL,
    peso_unitario   NUMERIC(12,3),  -- kg por unidad
    codigo_barras   VARCHAR(64),
    aspecto_visual  JSONB,          -- referencia a embedding, muestras, etc.
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sku_master_familia ON sku_master(familia);
CREATE INDEX idx_sku_master_codigo_barras ON sku_master(codigo_barras);

CREATE TABLE IF NOT EXISTS clientes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rut             VARCHAR(16) NOT NULL UNIQUE,  -- RUT Chile
    razon_social    VARCHAR(255) NOT NULL,
    giro            VARCHAR(255),
    direccion       TEXT,
    contacto_email  VARCHAR(255),
    vip             BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operadores (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rut             VARCHAR(16) NOT NULL UNIQUE,
    nombre          VARCHAR(255) NOT NULL,
    email           VARCHAR(255) UNIQUE,
    rol             VARCHAR(32) NOT NULL DEFAULT 'operador',  -- operador, supervisor, admin, auditor
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS camiones (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patente         VARCHAR(16) NOT NULL UNIQUE,
    tipo            VARCHAR(32),   -- rampla, plataforma, furgon, cama_baja, granelero
    transportista   VARCHAR(255),
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- DTE - Documentos Tributarios Electrónicos (SII Chile)
-- =============================================================================

CREATE TABLE IF NOT EXISTS dte (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_dte            SMALLINT NOT NULL,  -- 33=factura, 52=guia despacho, 34, 56, 61
    folio               BIGINT NOT NULL,
    rut_emisor          VARCHAR(16) NOT NULL,
    rut_receptor        VARCHAR(16) NOT NULL,
    razon_social_receptor VARCHAR(255),
    fecha_emision       DATE NOT NULL,
    patente_declarada   VARCHAR(16),
    monto_total         NUMERIC(14,2),
    observaciones       TEXT,
    xml_raw             TEXT,           -- XML original firmado
    pdf_path            VARCHAR(512),   -- referencia S3/MinIO
    xml_path            VARCHAR(512),
    estado              VARCHAR(32) NOT NULL DEFAULT 'PENDIENTE',
                        -- PENDIENTE, EN_VALIDACION, VALIDADO, RECHAZADO
    origen_ingesta      VARCHAR(32),    -- sii_api, erp_webhook, upload, email
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tipo_dte, folio, rut_emisor)
);

CREATE INDEX idx_dte_estado ON dte(estado);
CREATE INDEX idx_dte_patente ON dte(patente_declarada);
CREATE INDEX idx_dte_fecha ON dte(fecha_emision DESC);

CREATE TABLE IF NOT EXISTS dte_item (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dte_id              UUID NOT NULL REFERENCES dte(id) ON DELETE CASCADE,
    linea               INT NOT NULL,
    sku_declarado       VARCHAR(64),
    sku_id              UUID REFERENCES sku_master(id),  -- resultado normalización
    descripcion         TEXT NOT NULL,
    unidad_medida       VARCHAR(16),
    cantidad            NUMERIC(14,3) NOT NULL,
    peso_teorico        NUMERIC(14,3),
    precio_unitario     NUMERIC(14,2),
    monto_linea         NUMERIC(14,2),
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(dte_id, linea)
);

CREATE INDEX idx_dte_item_sku_id ON dte_item(sku_id);

-- =============================================================================
-- Eventos de despacho
-- =============================================================================

CREATE TABLE IF NOT EXISTS evento_despacho (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dte_id              UUID REFERENCES dte(id),
    patente_detectada   VARCHAR(16),
    camion_id           UUID REFERENCES camiones(id),
    operador_id         UUID REFERENCES operadores(id),
    zona_carga          VARCHAR(64),
    estado              VARCHAR(32) NOT NULL DEFAULT 'INICIADO',
                        -- INICIADO, EN_CURSO, VALIDANDO, FINALIZADO
    resultado           VARCHAR(32),
                        -- CONFORME, OBSERVACIONES, RECHAZADA
    peso_entrada_kg     NUMERIC(14,3),
    peso_salida_kg      NUMERIC(14,3),
    peso_neto_kg        NUMERIC(14,3),
    peso_teorico_kg     NUMERIC(14,3),
    inicio              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fin                 TIMESTAMPTZ,
    resumen             JSONB,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evento_dte ON evento_despacho(dte_id);
CREATE INDEX idx_evento_estado ON evento_despacho(estado);
CREATE INDEX idx_evento_resultado ON evento_despacho(resultado);
CREATE INDEX idx_evento_patente ON evento_despacho(patente_detectada);
CREATE INDEX idx_evento_inicio ON evento_despacho(inicio DESC);

-- =============================================================================
-- Detecciones de visión
-- =============================================================================

CREATE TABLE IF NOT EXISTS deteccion (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evento_id       UUID NOT NULL REFERENCES evento_despacho(id) ON DELETE CASCADE,
    camara_id       VARCHAR(64) NOT NULL,
    frame_id        BIGINT,
    timestamp_det   TIMESTAMPTZ NOT NULL,
    track_id        VARCHAR(64) NOT NULL,   -- ID multi-objeto
    sku_predicho    VARCHAR(64),
    sku_id          UUID REFERENCES sku_master(id),
    confianza       NUMERIC(4,3),            -- 0.000 - 1.000
    bbox            JSONB,                   -- {x,y,w,h}
    metadata        JSONB,                   -- depth, angle, class prob, etc.
    confirmado      BOOLEAN NOT NULL DEFAULT FALSE,  -- aprobado por tracking
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deteccion_evento ON deteccion(evento_id);
CREATE INDEX idx_deteccion_track ON deteccion(evento_id, track_id);
CREATE INDEX idx_deteccion_sku ON deteccion(sku_id);

-- =============================================================================
-- Conciliación
-- =============================================================================

CREATE TABLE IF NOT EXISTS conciliacion (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evento_id       UUID NOT NULL REFERENCES evento_despacho(id) ON DELETE CASCADE,
    sku_id          UUID REFERENCES sku_master(id),
    sku_texto       VARCHAR(64),
    declarado       NUMERIC(14,3) NOT NULL DEFAULT 0,
    detectado       NUMERIC(14,3) NOT NULL DEFAULT 0,
    diferencia      NUMERIC(14,3) NOT NULL DEFAULT 0,
    tolerancia      NUMERIC(6,3),
    estado          VARCHAR(32) NOT NULL,
                    -- OK, EXCESO, FALTANTE, NO_DOCUMENTADO, SUSTITUCION
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(evento_id, sku_texto)
);

CREATE INDEX idx_conciliacion_evento ON conciliacion(evento_id);
CREATE INDEX idx_conciliacion_estado ON conciliacion(estado);

-- =============================================================================
-- Alertas
-- =============================================================================

CREATE TABLE IF NOT EXISTS alerta (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evento_id       UUID NOT NULL REFERENCES evento_despacho(id) ON DELETE CASCADE,
    tipo            VARCHAR(32) NOT NULL,
                    -- EXCESO, FALTANTE, NO_DOCUMENTADO, SUSTITUCION,
                    -- DIFERENCIA_PESO, PATENTE_NO_COINCIDE, CAMARA_OBSTRUIDA,
                    -- OPERADOR_NO_AUTORIZADO, etc.
    severidad       VARCHAR(16) NOT NULL,
                    -- INFO, WARNING, ERROR, CRITICAL
    mensaje         TEXT NOT NULL,
    datos           JSONB,
    canales         TEXT[],        -- ['dashboard','whatsapp','email','sirena']
    ack_user        UUID REFERENCES operadores(id),
    ack_ts          TIMESTAMPTZ,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerta_evento ON alerta(evento_id);
CREATE INDEX idx_alerta_severidad ON alerta(severidad);
CREATE INDEX idx_alerta_ack ON alerta(ack_ts);

-- =============================================================================
-- Evidencias
-- =============================================================================

CREATE TABLE IF NOT EXISTS evidencia (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evento_id       UUID NOT NULL REFERENCES evento_despacho(id) ON DELETE CASCADE,
    tipo            VARCHAR(32) NOT NULL,
                    -- IMAGEN, VIDEO, XML_DTE, PESAJE, LECTURA_BC, LECTURA_RFID
    path            VARCHAR(512) NOT NULL,   -- referencia S3/MinIO
    sha256          VARCHAR(64) NOT NULL,
    firma           TEXT,                     -- HMAC o firma asimétrica
    metadata        JSONB,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidencia_evento ON evidencia(evento_id);
CREATE INDEX idx_evidencia_tipo ON evidencia(tipo);

-- =============================================================================
-- Auditoría append-only con hash encadenado
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id              BIGSERIAL PRIMARY KEY,
    timestamp_ts    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor           VARCHAR(128),
    accion          VARCHAR(64) NOT NULL,
    entidad         VARCHAR(64),
    entidad_id      UUID,
    payload         JSONB,
    prev_hash       VARCHAR(64),
    hash            VARCHAR(64) NOT NULL
);

CREATE INDEX idx_audit_timestamp ON audit_log(timestamp_ts DESC);
CREATE INDEX idx_audit_entidad ON audit_log(entidad, entidad_id);

-- =============================================================================
-- Tolerancias y reglas
-- =============================================================================

CREATE TABLE IF NOT EXISTS tolerancia (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scope           VARCHAR(32) NOT NULL,  -- GLOBAL, FAMILIA, SKU, CLIENTE
    scope_ref       VARCHAR(64),
    tipo            VARCHAR(32) NOT NULL,  -- CANTIDAD_PCT, CANTIDAD_ABS, PESO_PCT, PESO_ABS
    valor           NUMERIC(10,3) NOT NULL,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Triggers
-- =============================================================================

CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dte_touch BEFORE UPDATE ON dte
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER trg_sku_master_touch BEFORE UPDATE ON sku_master
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
