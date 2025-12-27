import { IBaseRepository } from './IBaseRepository'

/**
 * Interfaz para el repositorio de Pagos
 */
export class IPagoRepository extends IBaseRepository {
    async getByPresupuesto(presupuestoId) {
        throw new Error('Method getByPresupuesto() must be implemented')
    }

    async getTotalByPresupuesto(presupuestoId) {
        throw new Error('Method getTotalByPresupuesto() must be implemented')
    }

    async getByFecha(fechaInicio, fechaFin) {
        throw new Error('Method getByFecha() must be implemented')
    }
}
