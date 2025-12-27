import { IPresupuestoRepository } from '../interfaces/IPresupuestoRepository'
import { LocalStorageBase } from './LocalStorageBase'

/**
 * Implementación de LocalStorage para Presupuestos
 */
export class LocalStoragePresupuestoRepository extends IPresupuestoRepository {
    constructor() {
        super()
        this.storage = new LocalStorageBase('crmap_presupuestos')
        this.itemsStorage = new LocalStorageBase('crmap_presupuesto_items')
    }

    async getAll() {
        return this.storage.getAll()
    }

    async getById(id) {
        return this.storage.findById(id)
    }

    async getByNumero(numero) {
        const presupuestos = this.storage.getAll()
        return presupuestos.find(p => p.numero === numero)
    }

    async getByCliente(clienteId) {
        const presupuestos = this.storage.getAll()
        return presupuestos.filter(p => p.cliente_id === clienteId)
    }

    async create(data) {
        // Generar número de presupuesto automáticamente si no existe
        if (!data.numero) {
            const presupuestos = this.storage.getAll()
            const year = new Date().getFullYear()
            const count = presupuestos.filter(p => p.numero?.startsWith(`P-${year}`)).length + 1
            data.numero = `P-${year}-${String(count).padStart(4, '0')}`
        }

        return this.storage.create({
            ...data,
            fecha: data.fecha || new Date().toISOString().split('T')[0],
            estado: data.estado || 'borrador',
            subtotal: data.subtotal || 0,
            descuento: data.descuento || 0,
            total: data.total || 0,
        })
    }

    async update(id, data) {
        return this.storage.update(id, data)
    }

    async updateEstado(id, estado) {
        return this.storage.update(id, { estado })
    }

    async delete(id) {
        // Eliminar también los items asociados
        const items = this.itemsStorage.getAll()
        const filteredItems = items.filter(item => item.presupuesto_id !== id)
        this.itemsStorage.saveAll(filteredItems)

        return this.storage.delete(id)
    }

    // Métodos para items
    async getItems(presupuestoId) {
        const items = this.itemsStorage.getAll()
        return items.filter(item => item.presupuesto_id === presupuestoId)
    }

    async addItem(presupuestoId, itemData) {
        const item = this.itemsStorage.create({
            presupuesto_id: presupuestoId,
            ...itemData,
            subtotal: (itemData.cantidad || 1) * (itemData.precio_unitario || 0),
        })

        // Recalcular totales del presupuesto
        await this.recalcularTotales(presupuestoId)

        return item
    }

    async updateItem(itemId, data) {
        const item = this.itemsStorage.update(itemId, {
            ...data,
            subtotal: (data.cantidad || 1) * (data.precio_unitario || 0),
        })

        // Recalcular totales del presupuesto
        const itemData = this.itemsStorage.findById(itemId)
        if (itemData) {
            await this.recalcularTotales(itemData.presupuesto_id)
        }

        return item
    }

    async deleteItem(itemId) {
        const item = this.itemsStorage.findById(itemId)
        const result = this.itemsStorage.delete(itemId)

        // Recalcular totales del presupuesto
        if (item) {
            await this.recalcularTotales(item.presupuesto_id)
        }

        return result
    }

    async recalcularTotales(presupuestoId) {
        const items = await this.getItems(presupuestoId)
        const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0)

        const presupuesto = this.storage.findById(presupuestoId)
        const descuento = presupuesto?.descuento || 0
        const total = subtotal - (subtotal * descuento / 100)

        return this.storage.update(presupuestoId, { subtotal, total })
    }
}
