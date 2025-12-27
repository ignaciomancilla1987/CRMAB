import { IBaseRepository } from './IBaseRepository'

/**
 * Interfaz para el repositorio de Usuarios
 */
export class IUsuarioRepository extends IBaseRepository {
    async getByAuthId(authId) {
        throw new Error('Method getByAuthId() must be implemented')
    }

    async getByEmail(email) {
        throw new Error('Method getByEmail() must be implemented')
    }

    async updatePermisos(id, permisos) {
        throw new Error('Method updatePermisos() must be implemented')
    }
}
