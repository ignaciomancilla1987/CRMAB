import { useAuth } from '@context/AuthContext'
import { Icon } from '@components/ui'

const StatCard = ({ icon, value, label, color }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
    <div
      className="w-14 h-14 rounded-xl flex items-center justify-center"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <Icon name={icon} className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
)

const DashboardPage = () => {
  const { userProfile } = useAuth()

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-800 mb-1">
          ¡Bienvenido, {userProfile?.nombre?.split(' ')[0] || 'Usuario'}!
        </h1>
        <p className="text-gray-500">Resumen de tu actividad</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          icon="Users"
          value="--"
          label="Clientes"
          color="#10B981"
        />
        <StatCard
          icon="FileText"
          value="--"
          label="Presupuestos"
          color="#8B5CF6"
        />
        <StatCard
          icon="Target"
          value="--"
          label="Tratos Activos"
          color="#F59E0B"
        />
        <StatCard
          icon="DollarSign"
          value="--"
          label="Por Cobrar"
          color="#EF4444"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-success-100 text-success-600 flex items-center justify-center">
              <Icon name="Plus" className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-700">Nuevo Cliente</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Icon name="FileText" className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-700">Nuevo Presupuesto</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Icon name="GitBranch" className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-700">Nuevo Trato</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Icon name="CreditCard" className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-700">Registrar Pago</span>
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
            <Icon name="AlertCircle" className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-primary-800 mb-1">Conecta tu base de datos</h3>
            <p className="text-sm text-primary-700">
              Los datos se cargarán automáticamente una vez configures las credenciales de Supabase en el archivo .env
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
