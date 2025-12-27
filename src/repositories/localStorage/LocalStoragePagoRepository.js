import { IPagoRepository } from '../interfaces/IPagoRepository'
import { LocalStorageBase } from './LocalStorageBase'

/**
 * Implementación de LocalStorage para Pagos
 */
export class LocalStoragePagoRepository extends IPagoRepository {
    constructor() {
        super()
        this.storage = new LocalStorageBase('crmap_pagos')
    }

    async getAll() {
        return this.storage.getAll()
    }

    async getById(id) {
        return this.storage.findById(id)
    }

    async getByPresupuesto(presupuestoId) {
        const pagos = this.storage.getAll()
        return pagos.filter(p => p.presupuesto_id === presupuestoId)
    }

    async getTotalByPresupuesto(presupuestoId) {
        const pagos = await this.getByPresupuesto(presupuestoId)
        return pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0)
    }

    async getByFecha(fechaInicio, fechaFin) {
        const pagos = this.storage.getAll()
        return pagos.filter(p => {
            const fecha = new Date(p.fecha)
            const inicio = new Date(fechaInicio)
            const fin = new Date(fechaFin)
            return fecha >= inicio && fecha <= fin
        })
    }

    async create(data) {
        return this.storage.create({
            ...data,
            fecha: data.fecha || new Date().toISOString().split('T')[0],
        })
    }

    async update(id, data) {
        return this.storage.update(id, data)
    }

    async delete(id) {
        return this.storage.delete(id)
    }
}
