import { RepositoryConfig, logRepositoryMode } from './config'

// LocalStorage Repositories
import { LocalStorageUsuarioRepository } from './localStorage/LocalStorageUsuarioRepository'
import { LocalStorageClienteRepository } from './localStorage/LocalStorageClienteRepository'
import { LocalStorageCodigoRepository } from './localStorage/LocalStorageCodigoRepository'
import { LocalStoragePresupuestoRepository } from './localStorage/LocalStoragePresupuestoRepository'
import { LocalStorageTratoRepository } from './localStorage/LocalStorageTratoRepository'
import { LocalStoragePagoRepository } from './localStorage/LocalStoragePagoRepository'

// Supabase Repositories (se importarán cuando estén implementados)
import { SupabaseUsuarioRepository } from './supabase/SupabaseUsuarioRepository'
import { SupabaseClienteRepository } from './supabase/SupabaseClienteRepository'
import { SupabaseCodigoRepository } from './supabase/SupabaseCodigoRepository'
import { SupabasePresupuestoRepository } from './supabase/SupabasePresupuestoRepository'
import { SupabaseTratoRepository } from './supabase/SupabaseTratoRepository'
import { SupabasePagoRepository } from './supabase/SupabasePagoRepository'

/**
 * Factory para crear instancias de repositorios
 * Usa Singleton pattern para mantener una única instancia de cada repositorio
 */
class RepositoryFactory {
    constructor() {
        this.repositories = {}
        logRepositoryMode()
    }

    /**
     * Obtiene o crea una instancia del repositorio
     */
    getRepository(name, LocalStorageClass, SupabaseClass) {
        if (!this.repositories[name]) {
            this.repositories[name] = RepositoryConfig.useLocalStorage
                ? new LocalStorageClass()
                : new SupabaseClass()
        }
        return this.repositories[name]
    }

    /**
     * Obtiene el repositorio de Usuarios
     */
    getUsuarioRepository() {
        return this.getRepository('usuario', LocalStorageUsuarioRepository, SupabaseUsuarioRepository)
    }

    /**
     * Obtiene el repositorio de Clientes
     */
    getClienteRepository() {
        return this.getRepository('cliente', LocalStorageClienteRepository, SupabaseClienteRepository)
    }

    /**
     * Obtiene el repositorio de Códigos
     */
    getCodigoRepository() {
        return this.getRepository('codigo', LocalStorageCodigoRepository, SupabaseCodigoRepository)
    }

    /**
     * Obtiene el repositorio de Presupuestos
     */
    getPresupuestoRepository() {
        return this.getRepository('presupuesto', LocalStoragePresupuestoRepository, SupabasePresupuestoRepository)
    }

    /**
     * Obtiene el repositorio de Tratos
     */
    getTratoRepository() {
        return this.getRepository('trato', LocalStorageTratoRepository, SupabaseTratoRepository)
    }

    /**
     * Obtiene el repositorio de Pagos
     */
    getPagoRepository() {
        return this.getRepository('pago', LocalStoragePagoRepository, SupabasePagoRepository)
    }

    /**
     * Limpia todas las instancias (útil para testing o cambio de configuración)
     */
    clearAll() {
        this.repositories = {}
    }
}

// Exportar una instancia única del factory
export const repositoryFactory = new RepositoryFactory()
