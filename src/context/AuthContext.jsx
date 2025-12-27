import { createContext, useContext, useEffect, useState } from 'react'
import { mockUsers } from '@/data/mockData'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

// Detectar si estamos en modo mock (sin Supabase configurado)
const isMockMode = !import.meta.env.VITE_SUPABASE_URL || 
                   import.meta.env.VITE_SUPABASE_URL === 'TU_SUPABASE_URL_AQUI' ||
                   import.meta.env.VITE_SUPABASE_URL === ''

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // En modo mock, verificar si hay sesión guardada en localStorage
    if (isMockMode) {
      const savedUser = localStorage.getItem('crmap_mock_user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setUserProfile(userData)
      }
      setLoading(false)
      return
    }

    // Modo Supabase (cuando esté configurado)
    const initSupabase = async () => {
      try {
        const { supabase } = await import('@services/supabase')
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error('Supabase not configured:', error)
      }
      setLoading(false)
    }

    initSupabase()
  }, [])

  const fetchUserProfile = async (userId) => {
    if (isMockMode) return

    try {
      const { supabase } = await import('@services/supabase')
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', userId)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUserProfile(null)
    }
  }

  const signIn = async (email, password) => {
    // Modo Mock
    if (isMockMode) {
      const mockUser = mockUsers.find(u => u.email === email)
      if (mockUser && password === 'admin123') {
        setUser(mockUser)
        setUserProfile(mockUser)
        localStorage.setItem('crmap_mock_user', JSON.stringify(mockUser))
        return { data: { user: mockUser }, error: null }
      }
      return { data: null, error: { message: 'Credenciales incorrectas' } }
    }

    // Modo Supabase
    const { supabase } = await import('@services/supabase')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email, password, userData) => {
    if (isMockMode) {
      return { data: null, error: { message: 'Registro no disponible en modo demo' } }
    }

    const { supabase } = await import('@services/supabase')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData },
    })
    return { data, error }
  }

  const signOut = async () => {
    if (isMockMode) {
      setUser(null)
      setUserProfile(null)
      localStorage.removeItem('crmap_mock_user')
      return { error: null }
    }

    const { supabase } = await import('@services/supabase')
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setUserProfile(null)
    }
    return { error }
  }

  const resetPassword = async (email) => {
    if (isMockMode) {
      return { data: null, error: { message: 'No disponible en modo demo' } }
    }

    const { supabase } = await import('@services/supabase')
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  }

  const updatePassword = async (newPassword) => {
    if (isMockMode) {
      return { data: null, error: { message: 'No disponible en modo demo' } }
    }

    const { supabase } = await import('@services/supabase')
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { data, error }
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
    isAdmin: userProfile?.rol === 'Administrador',
    isMockMode,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
