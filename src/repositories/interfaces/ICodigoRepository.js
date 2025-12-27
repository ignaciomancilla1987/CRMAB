import { IBaseRepository } from './IBaseRepository'

/**
 * Interfaz para el repositorio de Códigos de Servicio
 */
export class ICodigoRepository extends IBaseRepository {
    async getByCodigo(codigo) {
        throw new Error('Method getByCodigo() must be implemented')
    }

    async getActivos() {
        throw new Error('Method getActivos() must be implemented')
    }

    async search(query) {
        throw new Error('Method search() must be implemented')
    }
}
