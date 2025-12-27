import { IBaseRepository } from './IBaseRepository'

/**
 * Interfaz para el repositorio de Presupuestos
 */
export class IPresupuestoRepository extends IBaseRepository {
    async getByNumero(numero) {
        throw new Error('Method getByNumero() must be implemented')
    }

    async getByCliente(clienteId) {
        throw new Error('Method getByCliente() must be implemented')
    }

    async getItems(presupuestoId) {
        throw new Error('Method getItems() must be implemented')
    }

    async addItem(presupuestoId, item) {
        throw new Error('Method addItem() must be implemented')
    }

    async updateItem(itemId, data) {
        throw new Error('Method updateItem() must be implemented')
    }

    async deleteItem(itemId) {
        throw new Error('Method deleteItem() must be implemented')
    }

    async updateEstado(id, estado) {
        throw new Error('Method updateEstado() must be implemented')
    }
}
