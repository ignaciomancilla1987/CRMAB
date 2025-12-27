import { ICodigoRepository } from '../interfaces/ICodigoRepository'
import { supabase } from '@services/supabase'

/**
 * Implementación de Supabase para Códigos de Servicio
 */
export class SupabaseCodigoRepository extends ICodigoRepository {
    async getAll() {
        const { data, error } = await supabase
            .from('codigos_servicio')
            .select('*')
            .order('codigo')

        if (error) throw error
        return data
    }

    async getById(id) {
        const { data, error } = await supabase
            .from('codigos_servicio')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    }

    async getByCodigo(codigo) {
        const { data, error } = await supabase
            .from('codigos_servicio')
            .select('*')
            .eq('codigo', codigo)
            .single()

        if (error) throw error
        return data
    }

    async getActivos() {
        const { data, error } = await supabase
            .from('codigos_servicio')
            .select('*')
            .eq('activo', true)
            .order('codigo')

        if (error) throw error
        return data
    }

    async search(query) {
        const { data, error } = await supabase
            .from('codigos_servicio')
            .select('*')
            .or(`codigo.ilike.%${query}%,descripcion.ilike.%${query}%`)

        if (error) throw error
        return data
    }

    async create(codigoData) {
        const { data, error } = await supabase
            .from('codigos_servicio')
            .insert([codigoData])
            .select()
            .single()

        if (error) throw error
        return data
    }

    async update(id, updates) {
        const { data, error } = await supabase
            .from('codigos_servicio')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async delete(id) {
        const { error } = await supabase
            .from('codigos_servicio')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }
}
