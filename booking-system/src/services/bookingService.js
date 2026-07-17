import { supabase } from '@/lib/supabase'
import { toISODate } from '@/utils/date'

/**
 * Capa de acceso a datos del flujo de reservas.
 * Toda la escritura pasa por RPC (crear_reserva) para respetar RLS.
 */
export const bookingService = {
  /** Lista las sucursales activas ordenadas. */
  async getSucursales() {
    const { data, error } = await supabase
      .from('sucursales')
      .select('id, nombre, slug, tipo, direccion, ciudad')
      .eq('activo', true)
      .order('orden', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  /**
   * Horas libres para una sucursal en una fecha dada.
   * @returns {Promise<string[]>} ej: ['09:00', '10:00', ...]
   */
  async getSlots(sucursalId, fecha) {
    const { data, error } = await supabase.rpc('slots_disponibles', {
      p_sucursal_id: sucursalId,
      p_fecha: toISODate(fecha),
    })
    if (error) throw error
    return (data ?? []).map((row) => String(row.hora).slice(0, 5))
  },

  /**
   * Crea la reserva de forma atómica (asigna vendedor + valida slot).
   * @returns {Promise<object>} la reserva creada
   */
  async crearReserva({ sucursalId, fecha, hora, cliente }) {
    const { data, error } = await supabase.rpc('crear_reserva', {
      p_sucursal_id: sucursalId,
      p_fecha: toISODate(fecha),
      p_hora: hora,
      p_cliente_nombre: cliente.nombre,
      p_cliente_email: cliente.email,
      p_cliente_telefono: cliente.telefono,
      p_cliente_rut: cliente.rut || null,
      p_proyecto: cliente.proyecto || null,
      p_mensaje: cliente.mensaje || null,
    })
    if (error) {
      // Traduce el error de negocio a algo legible para el usuario
      if (error.message?.includes('SLOT_NO_DISPONIBLE')) {
        const e = new Error('El horario seleccionado ya no está disponible. Elige otro.')
        e.code = 'SLOT_NO_DISPONIBLE'
        throw e
      }
      throw error
    }
    return data
  },
}

export default bookingService
