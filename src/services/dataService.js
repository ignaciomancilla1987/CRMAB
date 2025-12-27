// ============================================
// DATA SERVICE - Maneja datos con localStorage
// ============================================

import { 
  mockUsers, 
  mockClientes, 
  mockCodigos, 
  mockPresupuestos, 
  mockTratos, 
  mockPagos 
} from '@/data/mockData'

// Claves de localStorage
const STORAGE_KEYS = {
  usuarios: 'crmap_usuarios',
  clientes: 'crmap_clientes',
  codigos: 'crmap_codigos',
  presupuestos: 'crmap_presupuestos',
  tratos: 'crmap_tratos',
  pagos: 'crmap_pagos',
}

// Inicializar datos desde localStorage o usar mock
const initData = (key, mockData) => {
  const stored = localStorage.getItem(key)
  if (stored) {
    return JSON.parse(stored)
  }
  localStorage.setItem(key, JSON.stringify(mockData))
  return [...mockData]
}

// Guardar en localStorage
const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data))
}

// Función helper para generar IDs
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

// ============================================
// USUARIOS
// ============================================
export const getUsuarios = async () => {
  const data = initData(STORAGE_KEYS.usuarios, mockUsers)
  return { data, error: null }
}

export const createUsuario = async (usuario) => {
  const data = initData(STORAGE_KEYS.usuarios, mockUsers)
  const newUser = { 
    ...usuario, 
    id: generateId(), 
    created_at: new Date().toISOString(),
    activo: true 
  }
  data.push(newUser)
  saveData(STORAGE_KEYS.usuarios, data)
  return { data: newUser, error: null }
}

export const updateUsuario = async (id, updates) => {
  const data = initData(STORAGE_KEYS.usuarios, mockUsers)
  const index = data.findIndex(u => u.id === id)
  if (index !== -1) {
    data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() }
    saveData(STORAGE_KEYS.usuarios, data)
    return { data: data[index], error: null }
  }
  return { data: null, error: { message: 'Usuario no encontrado' } }
}

export const deleteUsuario = async (id) => {
  let data = initData(STORAGE_KEYS.usuarios, mockUsers)
  data = data.filter(u => u.id !== id)
  saveData(STORAGE_KEYS.usuarios, data)
  return { error: null }
}

// ============================================
// CLIENTES
// ============================================
export const getClientes = async () => {
  const data = initData(STORAGE_KEYS.clientes, mockClientes)
  return { data, error: null }
}

export const createCliente = async (cliente) => {
  const data = initData(STORAGE_KEYS.clientes, mockClientes)
  const newCliente = { 
    ...cliente, 
    id: generateId(), 
    created_at: new Date().toISOString(),
    activo: true 
  }
  data.push(newCliente)
  saveData(STORAGE_KEYS.clientes, data)
  return { data: newCliente, error: null }
}

export const updateCliente = async (id, updates) => {
  const data = initData(STORAGE_KEYS.clientes, mockClientes)
  const index = data.findIndex(c => c.id === id)
  if (index !== -1) {
    data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() }
    saveData(STORAGE_KEYS.clientes, data)
    return { data: data[index], error: null }
  }
  return { data: null, error: { message: 'Cliente no encontrado' } }
}

export const deleteCliente = async (id) => {
  let data = initData(STORAGE_KEYS.clientes, mockClientes)
  data = data.filter(c => c.id !== id)
  saveData(STORAGE_KEYS.clientes, data)
  return { error: null }
}

// ============================================
// CÓDIGOS DE SERVICIO
// ============================================
export const getCodigos = async () => {
  const data = initData(STORAGE_KEYS.codigos, mockCodigos)
  return { data, error: null }
}

export const createCodigo = async (codigo) => {
  const data = initData(STORAGE_KEYS.codigos, mockCodigos)
  const newCodigo = { 
    ...codigo, 
    id: generateId(),
    activo: true 
  }
  data.push(newCodigo)
  saveData(STORAGE_KEYS.codigos, data)
  return { data: newCodigo, error: null }
}

export const updateCodigo = async (id, updates) => {
  const data = initData(STORAGE_KEYS.codigos, mockCodigos)
  const index = data.findIndex(c => c.id === id)
  if (index !== -1) {
    data[index] = { ...data[index], ...updates }
    saveData(STORAGE_KEYS.codigos, data)
    return { data: data[index], error: null }
  }
  return { data: null, error: { message: 'Código no encontrado' } }
}

export const deleteCodigo = async (id) => {
  let data = initData(STORAGE_KEYS.codigos, mockCodigos)
  data = data.filter(c => c.id !== id)
  saveData(STORAGE_KEYS.codigos, data)
  return { error: null }
}

// ============================================
// PRESUPUESTOS
// ============================================
export const getPresupuestos = async () => {
  const data = initData(STORAGE_KEYS.presupuestos, mockPresupuestos)
  return { data, error: null }
}

export const createPresupuesto = async (presupuesto) => {
  const data = initData(STORAGE_KEYS.presupuestos, mockPresupuestos)
  const numero = `PRES-${new Date().getFullYear()}-${String(data.length + 1).padStart(3, '0')}`
  const newPresupuesto = { 
    ...presupuesto, 
    id: generateId(), 
    numero,
    created_at: new Date().toISOString(),
    estado: presupuesto.estado || 'borrador'
  }
  data.push(newPresupuesto)
  saveData(STORAGE_KEYS.presupuestos, data)
  return { data: newPresupuesto, error: null }
}

export const updatePresupuesto = async (id, updates) => {
  const data = initData(STORAGE_KEYS.presupuestos, mockPresupuestos)
  const index = data.findIndex(p => p.id === id)
  if (index !== -1) {
    data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() }
    saveData(STORAGE_KEYS.presupuestos, data)
    return { data: data[index], error: null }
  }
  return { data: null, error: { message: 'Presupuesto no encontrado' } }
}

export const deletePresupuesto = async (id) => {
  let data = initData(STORAGE_KEYS.presupuestos, mockPresupuestos)
  data = data.filter(p => p.id !== id)
  saveData(STORAGE_KEYS.presupuestos, data)
  return { error: null }
}

// ============================================
// TRATOS
// ============================================
export const getTratos = async () => {
  const data = initData(STORAGE_KEYS.tratos, mockTratos)
  return { data, error: null }
}

export const createTrato = async (trato) => {
  const data = initData(STORAGE_KEYS.tratos, mockTratos)
  const newTrato = { 
    ...trato, 
    id: generateId(), 
    created_at: new Date().toISOString(),
    etapa_actual: trato.etapa_actual || 'contacto'
  }
  data.push(newTrato)
  saveData(STORAGE_KEYS.tratos, data)
  return { data: newTrato, error: null }
}

export const updateTrato = async (id, updates) => {
  const data = initData(STORAGE_KEYS.tratos, mockTratos)
  const index = data.findIndex(t => t.id === id)
  if (index !== -1) {
    data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() }
    saveData(STORAGE_KEYS.tratos, data)
    return { data: data[index], error: null }
  }
  return { data: null, error: { message: 'Trato no encontrado' } }
}

export const deleteTrato = async (id) => {
  let data = initData(STORAGE_KEYS.tratos, mockTratos)
  data = data.filter(t => t.id !== id)
  saveData(STORAGE_KEYS.tratos, data)
  return { error: null }
}

// ============================================
// PAGOS
// ============================================
export const getPagos = async () => {
  const data = initData(STORAGE_KEYS.pagos, mockPagos)
  return { data, error: null }
}

export const getPresupuestosConPagos = async () => {
  const presupuestos = initData(STORAGE_KEYS.presupuestos, mockPresupuestos)
  const pagos = initData(STORAGE_KEYS.pagos, mockPagos)
  const clientes = initData(STORAGE_KEYS.clientes, mockClientes)
  
  const presAprobados = presupuestos.filter(p => p.estado === 'aprobado')
  const data = presAprobados.map(p => ({
    ...p,
    clientes: clientes.find(c => c.id === p.cliente_id),
    pagos: pagos.filter(pago => pago.presupuesto_id === p.id)
  }))
  return { data, error: null }
}

export const createPago = async (pago) => {
  const data = initData(STORAGE_KEYS.pagos, mockPagos)
  const newPago = { 
    ...pago, 
    id: generateId(), 
    created_at: new Date().toISOString() 
  }
  data.push(newPago)
  saveData(STORAGE_KEYS.pagos, data)
  return { data: newPago, error: null }
}

export const deletePago = async (id) => {
  let data = initData(STORAGE_KEYS.pagos, mockPagos)
  data = data.filter(p => p.id !== id)
  saveData(STORAGE_KEYS.pagos, data)
  return { error: null }
}

// ============================================
// UTILIDADES
// ============================================
export const resetAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
}

export const exportarExcel = (datos, columnas, nombreArchivo) => {
  const BOM = '\uFEFF'
  const headers = columnas.map(c => c.titulo).join(';')
  const filas = datos.map(fila => 
    columnas.map(c => {
      let valor = c.campo(fila)
      if (valor === null || valor === undefined) valor = ''
      valor = String(valor).replace(/"/g, '""')
      if (valor.includes(';') || valor.includes('"') || valor.includes('\n')) {
        valor = `"${valor}"`
      }
      return valor
    }).join(';')
  ).join('\n')
  const contenido = BOM + headers + '\n' + filas
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
