import { IBaseRepository } from './IBaseRepository'

/**
 * Interfaz para el repositorio de Tratos (Pipeline)
 */
export class ITratoRepository extends IBaseRepository {
    async getByCliente(clienteId) {
        throw new Error('Method getByCliente() must be implemented')
    }

    async getByEtapa(etapa) {
        throw new Error('Method getByEtapa() must be implemented')
    }

    async updateEtapa(id, etapa) {
        throw new Error('Method updateEtapa() must be implemented')
    }

    async getHistorial(tratoId) {
        throw new Error('Method getHistorial() must be implemented')
    }

    async addHistorial(tratoId, historial) {
        throw new Error('Method addHistorial() must be implemented')
    }
}
