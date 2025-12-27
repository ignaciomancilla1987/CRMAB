-- =============================================
-- CRMAP - Script de Base de Datos para Supabase
-- =============================================
-- Ejecuta este script en el SQL Editor de Supabase
-- para crear todas las tablas necesarias

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: usuarios
-- =============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  rol VARCHAR(50) DEFAULT 'Asistente Legal',
  activo BOOLEAN DEFAULT true,
  permisos JSONB DEFAULT '{
    "usuarios": {"ver": false, "crear": false, "editar": false, "eliminar": false},
    "clientes": {"ver": true, "crear": true, "editar": false, "eliminar": false},
    "presupuestador": {"ver": true, "crear": true, "editar": false, "eliminar": false},
    "pipeline": {"ver": true, "crear": true, "editar": true, "eliminar": false},
    "pagos": {"ver": true, "crear": true, "editar": false, "eliminar": false}
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: clientes
-- =============================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  nombre VARCHAR(255) NOT NULL,
  rut VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: codigos_servicio
-- =============================================
CREATE TABLE IF NOT EXISTS codigos_servicio (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  descripcion TEXT NOT NULL,
  precio INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: presupuestos
-- =============================================
CREATE TABLE IF NOT EXISTS presupuestos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  cliente_id UUID REFERENCES clientes(id),
  numero VARCHAR(50) UNIQUE NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  subtotal INTEGER DEFAULT 0,
  descuento DECIMAL(5,2) DEFAULT 0,
  total INTEGER DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'borrador',
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: presupuesto_items
-- =============================================
CREATE TABLE IF NOT EXISTS presupuesto_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  presupuesto_id UUID REFERENCES presupuestos(id) ON DELETE CASCADE,
  codigo_id UUID REFERENCES codigos_servicio(id),
  cantidad INTEGER DEFAULT 1,
  precio_unitario INTEGER DEFAULT 0,
  subtotal INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: tratos
-- =============================================
CREATE TABLE IF NOT EXISTS tratos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  cliente_id UUID REFERENCES clientes(id),
  presupuesto_id UUID REFERENCES presupuestos(id),
  titulo VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(255),
  plataforma_ingreso VARCHAR(100),
  fecha_ingreso DATE DEFAULT CURRENT_DATE,
  motivo_consulta TEXT,
  etapa_actual VARCHAR(50) DEFAULT 'contacto',
  fecha_vencimiento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: trato_historial
-- =============================================
CREATE TABLE IF NOT EXISTS trato_historial (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trato_id UUID REFERENCES tratos(id) ON DELETE CASCADE,
  etapa VARCHAR(50) NOT NULL,
  fecha DATE DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  descripcion TEXT,
  usuario VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: pagos
-- =============================================
CREATE TABLE IF NOT EXISTS pagos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  presupuesto_id UUID REFERENCES presupuestos(id) ON DELETE CASCADE,
  quien_transfiere VARCHAR(255) NOT NULL,
  monto INTEGER NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TRIGGERS para updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_codigos_servicio_updated_at BEFORE UPDATE ON codigos_servicio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presupuestos_updated_at BEFORE UPDATE ON presupuestos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tratos_updated_at BEFORE UPDATE ON tratos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE codigos_servicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuesto_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE trato_historial ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver todos los registros" ON usuarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden ver clientes" ON clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden ver códigos" ON codigos_servicio FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden ver presupuestos" ON presupuestos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden ver items" ON presupuesto_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden ver tratos" ON tratos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden ver historial" ON trato_historial FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden ver pagos" ON pagos FOR SELECT TO authenticated USING (true);

-- Políticas de inserción
CREATE POLICY "Usuarios pueden insertar clientes" ON clientes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios pueden insertar presupuestos" ON presupuestos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios pueden insertar items" ON presupuesto_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios pueden insertar tratos" ON tratos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios pueden insertar historial" ON trato_historial FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios pueden insertar pagos" ON pagos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios pueden insertar códigos" ON codigos_servicio FOR INSERT TO authenticated WITH CHECK (true);

-- Políticas de actualización
CREATE POLICY "Usuarios pueden actualizar clientes" ON clientes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios pueden actualizar presupuestos" ON presupuestos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios pueden actualizar tratos" ON tratos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios pueden actualizar códigos" ON codigos_servicio FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios pueden actualizar usuarios" ON usuarios FOR UPDATE TO authenticated USING (true);

-- Políticas de eliminación
CREATE POLICY "Usuarios pueden eliminar clientes" ON clientes FOR DELETE TO authenticated USING (true);
CREATE POLICY "Usuarios pueden eliminar presupuestos" ON presupuestos FOR DELETE TO authenticated USING (true);
CREATE POLICY "Usuarios pueden eliminar tratos" ON tratos FOR DELETE TO authenticated USING (true);
CREATE POLICY "Usuarios pueden eliminar códigos" ON codigos_servicio FOR DELETE TO authenticated USING (true);
CREATE POLICY "Usuarios pueden eliminar pagos" ON pagos FOR DELETE TO authenticated USING (true);

-- =============================================
-- DATOS DE EJEMPLO (opcional)
-- =============================================

-- Códigos de servicio
INSERT INTO codigos_servicio (codigo, descripcion, precio) VALUES
  ('EST-001', 'Estudio de títulos de propiedad', 150000),
  ('ESC-001', 'Redacción de escritura de compraventa', 250000),
  ('ESC-002', 'Redacción de escritura de hipoteca', 200000),
  ('INS-001', 'Inscripción en Conservador de Bienes Raíces', 80000),
  ('ASE-001', 'Asesoría legal en compra de propiedad', 180000),
  ('ASE-002', 'Asesoría legal en venta de propiedad', 180000),
  ('CON-001', 'Redacción de contrato de arriendo', 120000),
  ('CON-002', 'Redacción de promesa de compraventa', 150000),
  ('REP-001', 'Representación en negociación inmobiliaria', 300000),
  ('TRA-001', 'Trámite de alzamiento de hipoteca', 100000)
ON CONFLICT (codigo) DO NOTHING;

-- =============================================
-- FUNCIÓN para crear usuario después del signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (auth_id, email, nombre, rol, permisos)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    'Asistente Legal',
    '{
      "usuarios": {"ver": false, "crear": false, "editar": false, "eliminar": false},
      "clientes": {"ver": true, "crear": true, "editar": false, "eliminar": false},
      "presupuestador": {"ver": true, "crear": true, "editar": false, "eliminar": false},
      "pipeline": {"ver": true, "crear": true, "editar": true, "eliminar": false},
      "pagos": {"ver": true, "crear": true, "editar": false, "eliminar": false}
    }'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear usuario automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
