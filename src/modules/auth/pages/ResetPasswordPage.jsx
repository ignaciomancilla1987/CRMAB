import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { Button, Input, Icon } from '@components/ui'

const ResetPasswordPage = () => {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    const { error } = await updatePassword(password)

    if (error) {
      setError('Error al actualizar la contraseña')
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    }

    setLoading(false)
  }

  return (
    <div className="relative bg-white rounded-3xl p-12 w-full max-w-md shadow-2xl">
      <div className="text-center mb-9">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5 text-primary-800">
          <Icon name="Lock" className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-primary-800 mb-2">Nueva Contraseña</h1>
        <p className="text-gray-500 text-sm">Ingresa tu nueva contraseña</p>
      </div>

      {success ? (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" className="w-8 h-8 text-success-600" />
          </div>
          <p className="text-gray-600 mb-2">Contraseña actualizada correctamente</p>
          <p className="text-sm text-gray-500">Redirigiendo al login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-danger-50 text-danger-700 rounded-xl text-sm">
              <Icon name="AlertCircle" className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Nueva Contraseña"
            type="password"
            icon="Lock"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            icon="Lock"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" loading={loading} className="w-full">
            Actualizar Contraseña
          </Button>
        </form>
      )}
    </div>
  )
}

export default ResetPasswordPage
