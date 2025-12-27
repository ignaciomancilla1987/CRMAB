import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { Button, Input, Icon } from '@components/ui'

const LoginPage = () => {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)

    if (error) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
    }

    setLoading(false)
  }

  return (
    <div className="relative bg-white rounded-3xl p-12 w-full max-w-md shadow-2xl">
      {/* Header */}
      <div className="text-center mb-9">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5 text-primary-800">
          <Icon name="Building2" className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-primary-800 mb-2">CRMAP</h1>
        <p className="text-gray-500">Sistema de Gestión</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-danger-50 text-danger-700 rounded-xl text-sm">
            <Icon name="AlertCircle" className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Email"
          type="email"
          icon="Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
          required
        />

        <div className="relative">
          <Input
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            icon="Lock"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-9 text-gray-400 hover:text-gray-600"
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} className="w-5 h-5" />
          </button>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full mt-2"
        >
          Iniciar Sesión
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center">
        <Link
          to="/forgot-password"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {/* Demo Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl text-center">
        <p className="text-xs text-gray-500">
          <strong>Ambiente:</strong> {import.meta.env.VITE_APP_ENV || 'development'}
        </p>
      </div>
    </div>
  )
}

export default LoginPage
