import { IUsuarioRepository } from '../interfaces/IUsuarioRepository'
import { LocalStorageBase } from './LocalStorageBase'

/**
 * Implementación de LocalStorage para Usuarios
 */
export class LocalStorageUsuarioRepository extends IUsuarioRepository {
    constructor() {
        super()
        this.storage = new LocalStorageBase('crmap_usuarios')
        this.initializeSampleData()
    }

    /**
     * Inicializa datos de ejemplo si no existen
     */
    initializeSampleData() {
        const usuarios = this.storage.getAll()
        if (usuarios.length === 0) {
            // Usuario administrador por defecto
            this.storage.create({
                auth_id: 'admin-auth-id',
                nombre: 'Administrador',
                email: 'admin@crmap.cl',
                rol: 'Administrador',
                activo: true,
                permisos: {
                    usuarios: { ver: true, crear: true, editar: true, eliminar: true },
                    clientes: { ver: true, crear: true, editar: true, eliminar: true },
                    presupuestador: { ver: true, crear: true, editar: true, eliminar: true },
                    pipeline: { ver: true, crear: true, editar: true, eliminar: true },
                    pagos: { ver: true, crear: true, editar: true, eliminar: true },
                },
            })

            // Usuario asistente legal
            this.storage.create({
                auth_id: 'user-auth-id',
                nombre: 'Asistente Legal',
                email: 'asistente@crmap.cl',
                rol: 'Asistente Legal',
                activo: true,
                permisos: {
                    usuarios: { ver: false, crear: false, editar: false, eliminar: false },
                    clientes: { ver: true, crear: true, editar: false, eliminar: false },
                    presupuestador: { ver: true, crear: true, editar: false, eliminar: false },
                    pipeline: { ver: true, crear: true, editar: true, eliminar: false },
                    pagos: { ver: true, crear: true, editar: false, eliminar: false },
                },
            })
        }
    }

    async getAll() {
        return this.storage.getAll()
    }

    async getById(id) {
        return this.storage.findById(id)
    }

    async getByAuthId(authId) {
        const usuarios = this.storage.getAll()
        return usuarios.find(u => u.auth_id === authId)
    }

    async getByEmail(email) {
        const usuarios = this.storage.getAll()
        return usuarios.find(u => u.email === email)
    }

    async create(data) {
        return this.storage.create(data)
    }

    async update(id, data) {
        return this.storage.update(id, data)
    }

    async updatePermisos(id, permisos) {
        return this.storage.update(id, { permisos })
    }

    async delete(id) {
        return this.storage.delete(id)
    }
}
