import { IClienteRepository } from '../interfaces/IClienteRepository'
import { supabase } from '@services/supabase'

/**
 * Implementación de Supabase para Clientes
 */
export class SupabaseClienteRepository extends IClienteRepository {
    async getAll() {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    }

    async getById(id) {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    }

    async getByRut(rut) {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('rut', rut)
            .single()

        if (error) throw error
        return data
    }

    async getActivos() {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('activo', true)
            .order('nombre')

        if (error) throw error
        return data
    }

    async search(query) {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .or(`nombre.ilike.%${query}%,rut.ilike.%${query}%,email.ilike.%${query}%`)

        if (error) throw error
        return data
    }

    async create(clienteData) {
        const { data, error } = await supabase
            .from('clientes')
            .insert([clienteData])
            .select()
            .single()

        if (error) throw error
        return data
    }

    async update(id, updates) {
        const { data, error } = await supabase
            .from('clientes')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async delete(id) {
        const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }
}
