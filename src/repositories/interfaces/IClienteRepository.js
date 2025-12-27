import { IBaseRepository } from './IBaseRepository'

/**
 * Interfaz para el repositorio de Clientes
 */
export class IClienteRepository extends IBaseRepository {
    async getByRut(rut) {
        throw new Error('Method getByRut() must be implemented')
    }

    async search(query) {
        throw new Error('Method search() must be implemented')
    }

    async getActivos() {
        throw new Error('Method getActivos() must be implemented')
    }
}
