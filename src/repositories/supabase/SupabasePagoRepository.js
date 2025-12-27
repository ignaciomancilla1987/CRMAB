import { IPagoRepository } from '../interfaces/IPagoRepository'
import { supabase } from '@services/supabase'

/**
 * Implementación de Supabase para Pagos
 */
export class SupabasePagoRepository extends IPagoRepository {
    async getAll() {
        const { data, error } = await supabase
            .from('pagos')
            .select(`
        *,
        presupuesto:presupuestos(id, numero, total)
      `)
            .order('fecha', { ascending: false })

        if (error) throw error
        return data
    }

    async getById(id) {
        const { data, error } = await supabase
            .from('pagos')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    }

    async getByPresupuesto(presupuestoId) {
        const { data, error } = await supabase
            .from('pagos')
            .select('*')
            .eq('presupuesto_id', presupuestoId)
            .order('fecha', { ascending: false })

        if (error) throw error
        return data
    }

    async getTotalByPresupuesto(presupuestoId) {
        const { data, error } = await supabase
            .from('pagos')
            .select('monto')
            .eq('presupuesto_id', presupuestoId)

        if (error) throw error
        return data.reduce((sum, pago) => sum + (pago.monto || 0), 0)
    }

    async getByFecha(fechaInicio, fechaFin) {
        const { data, error } = await supabase
            .from('pagos')
            .select('*')
            .gte('fecha', fechaInicio)
            .lte('fecha', fechaFin)
            .order('fecha', { ascending: false })

        if (error) throw error
        return data
    }

    async create(pagoData) {
        const { data, error } = await supabase
            .from('pagos')
            .insert([pagoData])
            .select()
            .single()

        if (error) throw error
        return data
    }

    async update(id, updates) {
        const { data, error } = await supabase
            .from('pagos')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async delete(id) {
        const { error } = await supabase
            .from('pagos')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }
}
