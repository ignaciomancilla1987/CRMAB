import axios from 'axios'

export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

export type DTEItem = {
  linea: number
  sku: string | null
  descripcion: string
  unidad_medida: string | null
  cantidad: number
}

export type DTE = {
  id: string
  tipo_dte: number
  folio: number
  rut_emisor: string
  rut_receptor: string
  razon_social_receptor: string | null
  fecha_emision: string
  patente_declarada: string | null
  monto_total: number | null
  estado: string
  total_items: number
  creado_en: string
  items: DTEItem[]
}

export type ConciliacionLinea = {
  sku: string
  declarado: number
  detectado: number
  diferencia: number
  tolerancia: number | null
  estado: 'OK' | 'EXCESO' | 'FALTANTE' | 'NO_DOCUMENTADO'
}

export type AlertaInline = {
  tipo: string
  severidad: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  mensaje: string
  datos: Record<string, unknown>
}

export type Evento = {
  id: string
  dte_id: string | null
  patente_detectada: string | null
  zona_carga: string | null
  estado: string
  resultado: 'CONFORME' | 'OBSERVACIONES' | 'RECHAZADA' | null
  peso_neto_kg: number | null
  peso_teorico_kg: number | null
  inicio: string | null
  fin: string | null
  resumen: Record<string, unknown> | null
  conciliaciones: ConciliacionLinea[] | null
  alertas: AlertaInline[] | null
}

export async function listDtes(): Promise<{ items: DTE[]; total: number }> {
  const { data } = await api.get('/dte')
  return data
}

export async function getDte(id: string): Promise<DTE> {
  const { data } = await api.get(`/dte/${id}`)
  return data
}

export async function ingestDteXml(xml: string): Promise<DTE> {
  const { data } = await api.post('/dte/ingest', xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
  return data
}

export async function simularDespacho(payload: {
  dte_id: string
  detectados: Record<string, number>
  peso_neto_kg?: number
  tolerancia_qty_pct?: number
}): Promise<Evento> {
  const { data } = await api.post('/eventos/simular', payload)
  return data
}

export async function listEventos(): Promise<{ items: Evento[]; total: number }> {
  const { data } = await api.get('/eventos')
  return data
}

export async function getEvento(id: string): Promise<Evento> {
  const { data } = await api.get(`/eventos/${id}`)
  return data
}
