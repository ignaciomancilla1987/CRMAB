import { ICodigoRepository } from '../interfaces/ICodigoRepository'
import { LocalStorageBase } from './LocalStorageBase'

/**
 * Implementación de LocalStorage para Códigos de Servicio
 */
export class LocalStorageCodigoRepository extends ICodigoRepository {
    constructor() {
        super()
        this.storage = new LocalStorageBase('crmap_codigos')
        this.initializeSampleData()
    }

    initializeSampleData() {
        const codigos = this.storage.getAll()
        if (codigos.length === 0) {
            const servicios = [
                { codigo: 'EST-001', descripcion: 'Estudio de títulos de propiedad', precio: 150000 },
                { codigo: 'ESC-001', descripcion: 'Redacción de escritura de compraventa', precio: 250000 },
                { codigo: 'ESC-002', descripcion: 'Redacción de escritura de hipoteca', precio: 200000 },
                { codigo: 'INS-001', descripcion: 'Inscripción en Conservador de Bienes Raíces', precio: 80000 },
                { codigo: 'ASE-001', descripcion: 'Asesoría legal en compra de propiedad', precio: 180000 },
                { codigo: 'ASE-002', descripcion: 'Asesoría legal en venta de propiedad', precio: 180000 },
                { codigo: 'CON-001', descripcion: 'Redacción de contrato de arriendo', precio: 120000 },
                { codigo: 'CON-002', descripcion: 'Redacción de promesa de compraventa', precio: 150000 },
                { codigo: 'REP-001', descripcion: 'Representación en negociación inmobiliaria', precio: 300000 },
                { codigo: 'TRA-001', descripcion: 'Trámite de alzamiento de hipoteca', precio: 100000 },
            ]

            servicios.forEach(servicio => {
                this.storage.create({ ...servicio, activo: true })
            })
        }
    }

    async getAll() {
        return this.storage.getAll()
    }

    async getById(id) {
        return this.storage.findById(id)
    }

    async getByCodigo(codigo) {
        const codigos = this.storage.getAll()
        return codigos.find(c => c.codigo === codigo)
    }

    async getActivos() {
        const codigos = this.storage.getAll()
        return codigos.filter(c => c.activo)
    }

    async search(query) {
        const codigos = this.storage.getAll()
        const lowerQuery = query.toLowerCase()
        return codigos.filter(c =>
            c.codigo.toLowerCase().includes(lowerQuery) ||
            c.descripcion.toLowerCase().includes(lowerQuery)
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
