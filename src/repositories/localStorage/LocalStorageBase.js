/**
 * Clase base para repositorios de LocalStorage
 * Proporciona funcionalidad común para todos los repositorios
 */
export class LocalStorageBase {
    constructor(storageKey) {
        this.storageKey = storageKey
        this.initializeStorage()
    }

    /**
     * Inicializa el storage si no existe
     */
    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]))
        }
    }

    /**
     * Obtiene todos los registros
     */
    getAll() {
        const data = localStorage.getItem(this.storageKey)
        return data ? JSON.parse(data) : []
    }

    /**
     * Guarda todos los registros
     */
    saveAll(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data))
    }

    /**
     * Genera un UUID simple
     */
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0
            const v = c === 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        })
    }

    /**
     * Obtiene la fecha actual en formato ISO
     */
    getCurrentTimestamp() {
        return new Date().toISOString()
    }

    /**
     * Busca un registro por ID
     */
    findById(id) {
        const data = this.getAll()
        return data.find(item => item.id === id)
    }

    /**
     * Crea un nuevo registro
     */
    create(newData) {
        const data = this.getAll()
        const record = {
            id: this.generateId(),
            ...newData,
            created_at: this.getCurrentTimestamp(),
            updated_at: this.getCurrentTimestamp(),
        }
        data.push(record)
        this.saveAll(data)
        return record
    }

    /**
     * Actualiza un registro existente
     */
    update(id, updates) {
        const data = this.getAll()
        const index = data.findIndex(item => item.id === id)

        if (index === -1) {
            throw new Error(`Record with id ${id} not found`)
        }

        data[index] = {
            ...data[index],
            ...updates,
            updated_at: this.getCurrentTimestamp(),
        }

        this.saveAll(data)
        return data[index]
    }

    /**
     * Elimina un registro
     */
    delete(id) {
        const data = this.getAll()
        const filtered = data.filter(item => item.id !== id)

        if (data.length === filtered.length) {
            throw new Error(`Record with id ${id} not found`)
        }

        this.saveAll(filtered)
        return true
    }

    /**
     * Limpia todos los datos (útil para testing)
     */
    clear() {
        localStorage.removeItem(this.storageKey)
        this.initializeStorage()
    }
}
