import { ITratoRepository } from '../interfaces/ITratoRepository'
import { supabase } from '@services/supabase'

/**
 * Implementación de Supabase para Tratos (Pipeline)
 */
export class SupabaseTratoRepository extends ITratoRepository {
    async getAll() {
        const { data, error } = await supabase
            .from('tratos')
            .select(`
        *,
        cliente:clientes(id, nombre, rut),
        presupuesto:presupuestos(id, numero, total)
      `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    }

    async getById(id) {
        const { data, error } = await supabase
            .from('tratos')
            .select(`
        *,
        cliente:clientes(id, nombre, rut),
        presupuesto:presupuestos(id, numero, total)
      `)
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    }

    async getByCliente(clienteId) {
        const { data, error } = await supabase
            .from('tratos')
            .select('*')
            .eq('cliente_id', clienteId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    }

    async getByEtapa(etapa) {
        const { data, error } = await supabase
            .from('tratos')
            .select('*')
            .eq('etapa_actual', etapa)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    }

    async create(tratoData) {
        const { data, error } = await supabase
            .from('tratos')
            .insert([tratoData])
            .select()
            .single()

        if (error) throw error
        return data
    }

    async update(id, updates) {
        const { data, error } = await supabase
            .from('tratos')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async updateEtapa(id, etapa) {
        return this.update(id, { etapa_actual: etapa })
    }

    async delete(id) {
        const { error } = await supabase
            .from('tratos')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }

    // Métodos para historial
    async getHistorial(tratoId) {
        const { data, error } = await supabase
            .from('trato_historial')
            .select('*')
            .eq('trato_id', tratoId)
            .order('fecha', { ascending: false })

        if (error) throw error
        return data
    }

    async addHistorial(tratoId, historialData) {
        const { data, error } = await supabase
            .from('trato_historial')
            .insert([{ ...historialData, trato_id: tratoId }])
            .select()
            .single()

        if (error) throw error
        return data
    }
}
