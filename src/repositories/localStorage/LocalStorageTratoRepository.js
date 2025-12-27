import { ITratoRepository } from '../interfaces/ITratoRepository'
import { LocalStorageBase } from './LocalStorageBase'

/**
 * Implementación de LocalStorage para Tratos (Pipeline)
 */
export class LocalStorageTratoRepository extends ITratoRepository {
    constructor() {
        super()
        this.storage = new LocalStorageBase('crmap_tratos')
        this.historialStorage = new LocalStorageBase('crmap_trato_historial')
    }

    async getAll() {
        return this.storage.getAll()
    }

    async getById(id) {
        return this.storage.findById(id)
    }

    async getByCliente(clienteId) {
        const tratos = this.storage.getAll()
        return tratos.filter(t => t.cliente_id === clienteId)
    }

    async getByEtapa(etapa) {
        const tratos = this.storage.getAll()
        return tratos.filter(t => t.etapa_actual === etapa)
    }

    async create(data) {
        return this.storage.create({
            ...data,
            fecha_ingreso: data.fecha_ingreso || new Date().toISOString().split('T')[0],
            etapa_actual: data.etapa_actual || 'contacto',
        })
    }

    async update(id, data) {
        return this.storage.update(id, data)
    }

    async updateEtapa(id, etapa) {
        const trato = this.storage.findById(id)

        // Registrar en historial
        await this.addHistorial(id, {
            etapa,
            descripcion: `Cambio de etapa: ${trato.etapa_actual} → ${etapa}`,
            usuario: 'Sistema',
        })

        return this.storage.update(id, { etapa_actual: etapa })
    }

    async delete(id) {
        // Eliminar también el historial asociado
        const historial = this.historialStorage.getAll()
        const filteredHistorial = historial.filter(h => h.trato_id !== id)
        this.historialStorage.saveAll(filteredHistorial)

        return this.storage.delete(id)
    }

    // Métodos para historial
    async getHistorial(tratoId) {
        const historial = this.historialStorage.getAll()
        return historial
            .filter(h => h.trato_id === tratoId)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    }

    async addHistorial(tratoId, historialData) {
        return this.historialStorage.create({
            trato_id: tratoId,
            ...historialData,
            fecha: historialData.fecha || new Date().toISOString().split('T')[0],
        })
    }
}
