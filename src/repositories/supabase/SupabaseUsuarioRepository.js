import { IUsuarioRepository } from '../interfaces/IUsuarioRepository'
import { supabase } from '@services/supabase'

/**
 * Implementación de Supabase para Usuarios
 */
export class SupabaseUsuarioRepository extends IUsuarioRepository {
    async getAll() {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    }

    async getById(id) {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    }

    async getByAuthId(authId) {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('auth_id', authId)
            .single()

        if (error) throw error
        return data
    }

    async getByEmail(email) {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single()

        if (error) throw error
        return data
    }

    async create(userData) {
        const { data, error } = await supabase
            .from('usuarios')
            .insert([userData])
            .select()
            .single()

        if (error) throw error
        return data
    }

    async update(id, updates) {
        const { data, error } = await supabase
            .from('usuarios')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async updatePermisos(id, permisos) {
        return this.update(id, { permisos })
    }

    async delete(id) {
        const { error } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    }
}
