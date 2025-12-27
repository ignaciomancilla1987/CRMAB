// ============================================
// DATA SERVICE - Maneja datos mock o Supabase
// ============================================

import { 
  mockUsers, 
  mockClientes, 
  mockCodigos, 
  mockPresupuestos, 
  mockTratos, 
  mockPagos 
} from '@/data/mockData'

// Detectar si estamos en modo mock
const isMockMode = !import.meta.env.VITE_SUPABASE_URL || 
                   import.meta.env.VITE_SUPABASE_URL === 'TU_SUPABASE_URL_AQUI' ||
                   import.meta.env.VITE_SUPABASE_URL === ''

// Estado local para simular persistencia en modo mock
let localData = {
  usuarios: [...mockUsers],
  clientes: [...mockClientes],
  codigos_servicio: [...mockCodigos],
  presupuestos: [...mockPresupuestos],
  tratos: [...mockTratos],
  pagos: [...mockPagos],
}

// Función helper para generar IDs
const generateId = () => Date.now().toString()

// ============================================
// USUARIOS
// ============================================
export const getUsuarios = async () => {
  if (isMockMode) {
    return { data: localData.usuarios, error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('usuarios').select('*').order('created_at', { ascending: false })
}

export const createUsuario = async (usuario) => {
  if (isMockMode) {
    const newUser = { ...usuario, id: generateId(), created_at: new Date().toISOString() }
    localData.usuarios.push(newUser)
    return { data: newUser, error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('usuarios').insert(usuario).select().single()
}

export const updateUsuario = async (id, updates) => {
  if (isMockMode) {
    const index = localData.usuarios.findIndex(u => u.id === id)
    if (index !== -1) {
      localData.usuarios[index] = { ...localData.usuarios[index], ...updates }
      return { data: localData.usuarios[index], error: null }
    }
    return { data: null, error: { message: 'Usuario no encontrado' } }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('usuarios').update(updates).eq('id', id).select().single()
}

export const deleteUsuario = async (id) => {
  if (isMockMode) {
    localData.usuarios = localData.usuarios.filter(u => u.id !== id)
    return { error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('usuarios').delete().eq('id', id)
}

// ============================================
// CLIENTES
// ============================================
export const getClientes = async () => {
  if (isMockMode) {
    return { data: localData.clientes, error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('clientes').select('*').order('created_at', { ascending: false })
}

export const createCliente = async (cliente) => {
  if (isMockMode) {
    const newCliente = { ...cliente, id: generateId(), created_at: new Date().toISOString(), activo: true }
    localData.clientes.push(newCliente)
    return { data: newCliente, error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('clientes').insert(cliente).select().single()
}

export const updateCliente = async (id, updates) => {
  if (isMockMode) {
    const index = localData.clientes.findIndex(c => c.id === id)
    if (index !== -1) {
      localData.clientes[index] = { ...localData.clientes[index], ...updates }
      return { data: localData.clientes[index], error: null }
    }
    return { data: null, error: { message: 'Cliente no encontrado' } }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('clientes').update(updates).eq('id', id).select().single()
}

export const deleteCliente = async (id) => {
  if (isMockMode) {
    localData.clientes = localData.clientes.filter(c => c.id !== id)
    return { error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('clientes').delete().eq('id', id)
}

// ============================================
// CÓDIGOS DE SERVICIO
// ============================================
export const getCodigos = async () => {
  if (isMockMode) {
    return { data: localData.codigos_servicio, error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('codigos_servicio').select('*').order('codigo')
}

export const createCodigo = async (codigo) => {
  if (isMockMode) {
    const newCodigo = { ...codigo, id: generateId(), activo: true }
    localData.codigos_servicio.push(newCodigo)
    return { data: newCodigo, error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('codigos_servicio').insert(codigo).select().single()
}

export const updateCodigo = async (id, updates) => {
  if (isMockMode) {
    const index = localData.codigos_servicio.findIndex(c => c.id === id)
    if (index !== -1) {
      localData.codigos_servicio[index] = { ...localData.codigos_servicio[index], ...updates }
      return { data: localData.codigos_servicio[index], error: null }
    }
    return { data: null, error: { message: 'Código no encontrado' } }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('codigos_servicio').update(updates).eq('id', id).select().single()
}

export const deleteCodigo = async (id) => {
  if (isMockMode) {
    localData.codigos_servicio = localData.codigos_servicio.filter(c => c.id !== id)
    return { error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('codigos_servicio').delete().eq('id', id)
}

// ============================================
// PRESUPUESTOS
// ============================================
export const getPresupuestos = async () => {
  if (isMockMode) {
    // Simular join con clientes
    const data = localData.presupuestos.map(p => ({
      ...p,
      clientes: localData.clientes.find(c => c.id === p.cliente_id)
    }))
    return { data, error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('presupuestos').select('*, clientes(nombre)').order('created_at', { ascending: false })
}

export const createPresupuesto = async (presupuesto) => {
  if (isMockMode) {
    const newPresupuesto = { ...presupuesto, id: generateId(), created_at: new Date().toISOString() }
    localData.presupuestos.push(newPresupuesto)
    return { data: newPresupuesto, error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('presupuestos').insert(presupuesto).select().single()
}

export const updatePresupuesto = async (id, updates) => {
  if (isMockMode) {
    const index = localData.presupuestos.findIndex(p => p.id === id)
    if (index !== -1) {
      localData.presupuestos[index] = { ...localData.presupuestos[index], ...updates }
      return { data: localData.presupuestos[index], error: null }
    }
    return { data: null, error: { message: 'Presupuesto no encontrado' } }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('presupuestos').update(updates).eq('id', id).select().single()
}

export const deletePresupuesto = async (id) => {
  if (isMockMode) {
    localData.presupuestos = localData.presupuestos.filter(p => p.id !== id)
    return { error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('presupuestos').delete().eq('id', id)
}

// ============================================
// TRATOS
// ============================================
export const getTratos = async () => {
  if (isMockMode) {
    return { data: localData.tratos, error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('tratos').select('*').order('created_at', { ascending: false })
}

export const createTrato = async (trato) => {
  if (isMockMode) {
    const newTrato = { ...trato, id: generateId(), created_at: new Date().toISOString() }
    localData.tratos.push(newTrato)
    return { data: newTrato, error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('tratos').insert(trato).select().single()
}

export const updateTrato = async (id, updates) => {
  if (isMockMode) {
    const index = localData.tratos.findIndex(t => t.id === id)
    if (index !== -1) {
      localData.tratos[index] = { ...localData.tratos[index], ...updates }
      return { data: localData.tratos[index], error: null }
    }
    return { data: null, error: { message: 'Trato no encontrado' } }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('tratos').update(updates).eq('id', id).select().single()
}

export const deleteTrato = async (id) => {
  if (isMockMode) {
    localData.tratos = localData.tratos.filter(t => t.id !== id)
    return { error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('tratos').delete().eq('id', id)
}

// ============================================
// PAGOS
// ============================================
export const getPagos = async () => {
  if (isMockMode) {
    return { data: localData.pagos, error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('pagos').select('*').order('created_at', { ascending: false })
}

export const getPresupuestosConPagos = async () => {
  if (isMockMode) {
    const presAprobados = localData.presupuestos.filter(p => p.estado === 'aprobado')
    const data = presAprobados.map(p => ({
      ...p,
      clientes: localData.clientes.find(c => c.id === p.cliente_id),
      pagos: localData.pagos.filter(pago => pago.presupuesto_id === p.id)
    }))
    return { data, error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('presupuestos').select('*, clientes(nombre), pagos(*)').eq('estado', 'aprobado').order('created_at', { ascending: false })
}

export const createPago = async (pago) => {
  if (isMockMode) {
    const newPago = { ...pago, id: generateId(), created_at: new Date().toISOString() }
    localData.pagos.push(newPago)
    return { data: newPago, error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('pagos').insert(pago).select().single()
}

export const deletePago = async (id) => {
  if (isMockMode) {
    localData.pagos = localData.pagos.filter(p => p.id !== id)
    return { error: null }
  }
  const { supabase } = await import('@services/supabase')
  return supabase.from('pagos').delete().eq('id', id)
}

// ============================================
// UTILIDADES
// ============================================
export const isMock = () => isMockMode
