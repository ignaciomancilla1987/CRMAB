import { IClienteRepository } from '../interfaces/IClienteRepository'
import { LocalStorageBase } from './LocalStorageBase'

/**
 * Implementación de LocalStorage para Clientes
 */
export class LocalStorageClienteRepository extends IClienteRepository {
    constructor() {
        super()
        this.storage = new LocalStorageBase('crmap_clientes')
        this.initializeSampleData()
    }

    initializeSampleData() {
        const clientes = this.storage.getAll()
        if (clientes.length === 0) {
            this.storage.create({
                nombre: 'Juan Pérez García',
                rut: '12345678-9',
                email: 'juan.perez@email.com',
                telefono: '+56912345678',
                activo: true,
            })

            this.storage.create({
                nombre: 'María González López',
                rut: '98765432-1',
                email: 'maria.gonzalez@email.com',
                telefono: '+56987654321',
                activo: true,
            })

            this.storage.create({
                nombre: 'Empresa ABC Ltda.',
                rut: '76543210-K',
                email: 'contacto@empresaabc.cl',
                telefono: '+56922334455',
                activo: true,
            })
        }
    }

    async getAll() {
        return this.storage.getAll()
    }

    async getById(id) {
        return this.storage.findById(id)
    }

    async getByRut(rut) {
        const clientes = this.storage.getAll()
        return clientes.find(c => c.rut === rut)
    }

    async getActivos() {
        const clientes = this.storage.getAll()
        return clientes.filter(c => c.activo)
    }

    async search(query) {
        const clientes = this.storage.getAll()
        const lowerQuery = query.toLowerCase()
        return clientes.filter(c =>
            c.nombre.toLowerCase().includes(lowerQuery) ||
            c.rut.includes(query) ||
            (c.email && c.email.toLowerCase().includes(lowerQuery))
        )
    }

    async create(data) {
        return this.storage.create(data)
    }

    async update(id, data) {
        return this.storage.update(id, data)
    }

    async delete(id) {
        return this.storage.delete(id)
    }
}
