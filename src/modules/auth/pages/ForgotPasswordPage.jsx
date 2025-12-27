import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { Button, Input, Icon } from '@components/ui'

const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await resetPassword(email)

    if (error) {
      setError('Error al enviar el correo. Verifica tu email.')
    } else {
      setSent(true)
    }

    setLoading(false)
  }

  return (
    <div className="relative bg-white rounded-3xl p-12 w-full max-w-md shadow-2xl">
      <div className="text-center mb-9">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5 text-primary-800">
          <Icon name="Lock" className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-primary-800 mb-2">Recuperar Contraseña</h1>
        <p className="text-gray-500 text-sm">
          {sent
            ? 'Revisa tu correo electrónico'
            : 'Ingresa tu email para recibir instrucciones'}
        </p>
      </div>

      {sent ? (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" className="w-8 h-8 text-success-600" />
          </div>
          <p className="text-gray-600 mb-6">
            Hemos enviado un enlace de recuperación a <strong>{email}</strong>
          </p>
          <Link to="/login">
            <Button variant="secondary" className="w-full">
              Volver al Login
            </Button>
          </Link>
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
            label="Email"
            type="email"
            icon="Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
          />

          <Button type="submit" loading={loading} className="w-full">
            Enviar Instrucciones
          </Button>

          <Link
            to="/login"
            className="block text-center text-sm text-gray-500 hover:text-gray-700"
          >
            Volver al Login
          </Link>
        </form>
      )}
    </div>
  )
}

export default ForgotPasswordPage
