// ============================================
// DATOS MOCK - Datos de ejemplo para demo
// ============================================

export const mockUsers = [
  { 
    id: '1', 
    auth_id: '1',
    nombre: 'Administrador', 
    email: 'admin@crmap.cl', 
    rol: 'Administrador', 
    activo: true, 
    created_at: '2024-01-01',
    permisos: { 
      usuarios: { ver: true, crear: true, editar: true, eliminar: true }, 
      clientes: { ver: true, crear: true, editar: true, eliminar: true }, 
      presupuestador: { ver: true, crear: true, editar: true, eliminar: true }, 
      pipeline: { ver: true, crear: true, editar: true, eliminar: true }, 
      pagos: { ver: true, crear: true, editar: true, eliminar: true } 
    } 
  },
  { 
    id: '2', 
    auth_id: '2',
    nombre: 'María González', 
    email: 'maria@crmap.cl', 
    rol: 'Abogado Senior', 
    activo: true,
    created_at: '2024-01-15', 
    permisos: { 
      usuarios: { ver: false, crear: false, editar: false, eliminar: false }, 
      clientes: { ver: true, crear: true, editar: true, eliminar: false }, 
      presupuestador: { ver: true, crear: true, editar: true, eliminar: false }, 
      pipeline: { ver: true, crear: true, editar: true, eliminar: false }, 
      pagos: { ver: true, crear: true, editar: false, eliminar: false } 
    } 
  },
  { 
    id: '3', 
    auth_id: '3',
    nombre: 'Pedro Sánchez', 
    email: 'pedro@crmap.cl', 
    rol: 'Asistente Legal', 
    activo: true,
    created_at: '2024-02-01', 
    permisos: { 
      usuarios: { ver: false, crear: false, editar: false, eliminar: false }, 
      clientes: { ver: true, crear: false, editar: false, eliminar: false }, 
      presupuestador: { ver: true, crear: false, editar: false, eliminar: false }, 
      pipeline: { ver: true, crear: false, editar: false, eliminar: false }, 
      pagos: { ver: true, crear: false, editar: false, eliminar: false } 
    } 
  },
]

export const mockClientes = [
  { id: '1', usuario_id: '1', nombre: 'Juan Carlos Méndez', rut: '12.345.678-9', email: 'jmendez@email.com', telefono: '+56 9 8765 4321', activo: true, created_at: '2024-01-10' },
  { id: '2', usuario_id: '1', nombre: 'María Fernanda López', rut: '11.222.333-4', email: 'mflopez@email.com', telefono: '+56 9 1234 5678', activo: true, created_at: '2024-01-20' },
  { id: '3', usuario_id: '2', nombre: 'Roberto Andrés Silva', rut: '9.876.543-2', email: 'rsilva@email.com', telefono: '+56 9 5555 4444', activo: true, created_at: '2024-02-05' },
  { id: '4', usuario_id: '2', nombre: 'Carolina Paz Muñoz', rut: '15.432.109-8', email: 'cmunoz@email.com', telefono: '+56 9 3333 2222', activo: true, created_at: '2024-02-15' },
]

export const mockCodigos = [
  { id: '1', codigo: 'EST-001', descripcion: 'Estudio de títulos de propiedad', precio: 150000, activo: true },
  { id: '2', codigo: 'ESC-001', descripcion: 'Redacción de escritura de compraventa', precio: 250000, activo: true },
  { id: '3', codigo: 'ESC-002', descripcion: 'Redacción de escritura de hipoteca', precio: 200000, activo: true },
  { id: '4', codigo: 'INS-001', descripcion: 'Inscripción en Conservador de Bienes Raíces', precio: 80000, activo: true },
  { id: '5', codigo: 'ASE-001', descripcion: 'Asesoría legal en compra de propiedad', precio: 180000, activo: true },
  { id: '6', codigo: 'ASE-002', descripcion: 'Asesoría legal en venta de propiedad', precio: 180000, activo: true },
  { id: '7', codigo: 'CON-001', descripcion: 'Redacción de contrato de arriendo', precio: 120000, activo: true },
  { id: '8', codigo: 'CON-002', descripcion: 'Redacción de promesa de compraventa', precio: 150000, activo: true },
  { id: '9', codigo: 'REP-001', descripcion: 'Representación en negociación inmobiliaria', precio: 300000, activo: true },
  { id: '10', codigo: 'TRA-001', descripcion: 'Trámite de alzamiento de hipoteca', precio: 100000, activo: true },
]

export const mockPresupuestos = [
  { id: '1', usuario_id: '1', cliente_id: '1', numero: 'PRES-2024-001', fecha: '2024-03-15', subtotal: 400000, descuento: 10, total: 360000, estado: 'aprobado', observaciones: 'Cliente requiere urgencia', created_at: '2024-03-15' },
  { id: '2', usuario_id: '1', cliente_id: '2', numero: 'PRES-2024-002', fecha: '2024-03-20', subtotal: 260000, descuento: 0, total: 260000, estado: 'aprobado', observaciones: '', created_at: '2024-03-20' },
  { id: '3', usuario_id: '2', cliente_id: '4', numero: 'PRES-2024-003', fecha: '2024-04-01', subtotal: 240000, descuento: 15, total: 204000, estado: 'aprobado', observaciones: 'Dos contratos de arriendo', created_at: '2024-04-01' },
  { id: '4', usuario_id: '2', cliente_id: '3', numero: 'PRES-2024-004', fecha: '2024-04-10', subtotal: 300000, descuento: 5, total: 285000, estado: 'borrador', observaciones: 'Pendiente de revisión', created_at: '2024-04-10' },
  { id: '5', usuario_id: '1', cliente_id: '1', numero: 'PRES-2024-005', fecha: '2024-04-15', subtotal: 180000, descuento: 0, total: 180000, estado: 'enviado', observaciones: '', created_at: '2024-04-15' },
]

export const mockTratos = [
  { id: '1', usuario_id: '1', cliente_id: '1', presupuesto_id: '1', titulo: 'Compraventa Depto. Las Condes', nombre_completo: 'Juan Carlos Méndez', plataforma_ingreso: 'Referido', fecha_ingreso: '2024-03-15', motivo_consulta: 'Compra de departamento en Las Condes', etapa_actual: 'en_proceso', fecha_vencimiento: '2024-12-20', created_at: '2024-03-15' },
  { id: '2', usuario_id: '1', cliente_id: '2', presupuesto_id: '2', titulo: 'Asesoría Compra Terreno Colina', nombre_completo: 'María Fernanda López', plataforma_ingreso: 'Sitio Web', fecha_ingreso: '2024-03-20', motivo_consulta: 'Asesoría para compra de terreno', etapa_actual: 'documentacion', fecha_vencimiento: '2024-12-18', created_at: '2024-03-20' },
  { id: '3', usuario_id: '2', cliente_id: '4', presupuesto_id: '3', titulo: 'Contratos Arriendo Locales', nombre_completo: 'Carolina Paz Muñoz', plataforma_ingreso: 'Redes Sociales', fecha_ingreso: '2024-04-01', motivo_consulta: 'Contratos de arriendo para locales', etapa_actual: 'propuesta', fecha_vencimiento: '2024-12-15', created_at: '2024-04-01' },
  { id: '4', usuario_id: '2', cliente_id: '3', presupuesto_id: null, titulo: 'Consulta Promesa Compraventa', nombre_completo: 'Roberto Andrés Silva', plataforma_ingreso: 'Referido', fecha_ingreso: '2024-04-05', motivo_consulta: 'Promesa de compraventa con asesoría legal', etapa_actual: 'contacto', fecha_vencimiento: '2024-12-28', created_at: '2024-04-05' },
]

export const mockPagos = [
  { id: '1', presupuesto_id: '1', quien_transfiere: 'Juan Carlos Méndez', monto: 200000, fecha: '2024-03-20', observaciones: 'Pago inicial 50%', created_at: '2024-03-20' },
  { id: '2', presupuesto_id: '1', quien_transfiere: 'Juan Carlos Méndez', monto: 160000, fecha: '2024-04-15', observaciones: 'Pago final', created_at: '2024-04-15' },
  { id: '3', presupuesto_id: '2', quien_transfiere: 'Inversiones López SpA', monto: 260000, fecha: '2024-03-25', observaciones: 'Pago total', created_at: '2024-03-25' },
  { id: '4', presupuesto_id: '3', quien_transfiere: 'Carolina Muñoz', monto: 100000, fecha: '2024-04-10', observaciones: 'Anticipo inicial', created_at: '2024-04-10' },
]

export const etapas = [
  { id: 'contacto', nombre: 'Contacto Inicial', color: '#6366F1' },
  { id: 'propuesta', nombre: 'Propuesta', color: '#EC4899' },
  { id: 'en_proceso', nombre: 'En Proceso', color: '#3B82F6' },
  { id: 'documentacion', nombre: 'Documentación', color: '#06B6D4' },
  { id: 'revision', nombre: 'Revisión Final', color: '#10B981' },
  { id: 'cerrado', nombre: 'Cerrado', color: '#059669' },
]
