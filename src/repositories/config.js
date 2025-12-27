/**
 * Configuración del sistema de repositorios
 * Permite cambiar entre localStorage y Supabase fácilmente
 */

export const RepositoryConfig = {
  // Usar localStorage si la variable de entorno está en true o si no hay credenciales de Supabase
  useLocalStorage: import.meta.env.VITE_USE_LOCAL_STORAGE === 'true' || 
                   !import.meta.env.VITE_SUPABASE_URL || 
                   import.meta.env.VITE_SUPABASE_URL === 'TU_SUPABASE_URL_AQUI',
  
  // Configuración de Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
}

// Helper para logging en desarrollo
export const logRepositoryMode = () => {
  if (import.meta.env.DEV) {
    console.log(
      `🗄️ Repository Mode: ${RepositoryConfig.useLocalStorage ? 'LocalStorage' : 'Supabase'}`
    )
  }
}
