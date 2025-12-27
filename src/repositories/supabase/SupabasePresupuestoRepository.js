import { IPresupuestoRepository } from '../interfaces/IPresupuestoRepository'
import { supabase } from '@services/supabase'

/**
 * Implementación de Supabase para Presupuestos
 */
export class SupabasePresupuestoRepository extends IPresupuestoRepository {
    async getAll() {
        const { data, error } = await supabase
            .from('presupuestos')
            .select(`
        *,
        cliente:clientes(id, nombre, rut),
        usuario:usuarios(id, nombre)
      `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    }

    async getById(id) {
        const { data, error } = await supabase
            .from('presupuestos')
            .select(`
        *,
        cliente:clientes(id, nombre, rut),
        usuario:usuarios(id, nombre)
      `)
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    }

    async getByNumero(numero) {
        const { data, error } = await supabase
            .from('presupuestos')
            .select('*')
            .eq('numero', numero)
            .single()

        if (error) throw error
        return data
    }

    async getByCliente(clienteId) {
        const { data, error } = await supabase
            .from('presupuestos')
            .select('*')
            .eq('cliente_id', clienteId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    }

    async create(presupuestoData) {
        const { data, error } = await supabase
            .from('presupuestos')
            .insert([presupuestoData])
            .select()
            .single()

        if (error) throw error
        return data
    }

    async update(id, updates) {
        const { data, error } = await supabase
            .from('presupuestos')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async updateEstado(id, estado) {
        return this.update(id, { estado })
    }

    async delete(id) {
        const { error } = await supabase
            .from('presupuestos')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }

    // Métodos para items
    async getItems(presupuestoId) {
        const { data, error } = await supabase
            .from('presupuesto_items')
            .select(`
        *,
        codigo:codigos_servicio(codigo, descripcion)
      `)
            .eq('presupuesto_id', presupuestoId)

        if (error) throw error
        return data
    }

    async addItem(presupuestoId, itemData) {
        const { data, error } = await supabase
            .from('presupuesto_items')
            .insert([{ ...itemData, presupuesto_id: presupuestoId }])
            .select()
            .single()

        if (error) throw error
        return data
    }

    async updateItem(itemId, updates) {
        const { data, error } = await supabase
            .from('presupuesto_items')
            .update(updates)
            .eq('id', itemId)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async deleteItem(itemId) {
        const { error } = await supabase
            .from('presupuesto_items')
            .delete()
            .eq('id', itemId)

        if (error) throw error
        return true
    }
}
