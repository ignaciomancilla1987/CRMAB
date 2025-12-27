import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'
import { useApp } from '@context/AppContext'
import Icon from '@components/ui/Icon'

const menuItems = [
  { path: '/dashboard', name: 'Dashboard', icon: 'Home' },
  { path: '/usuarios', name: 'Usuarios', icon: 'Users', permission: 'usuarios' },
  { path: '/clientes', name: 'Clientes', icon: 'User', permission: 'clientes' },
  { path: '/presupuestos', name: 'Presupuestos', icon: 'Calculator', permission: 'presupuestador' },
  { path: '/codigos', name: 'Códigos', icon: 'Hash', permission: 'presupuestador' },
  { path: '/pipeline', name: 'Pipeline', icon: 'GitBranch', permission: 'pipeline' },
  { path: '/pagos', name: 'Pagos', icon: 'CreditCard', permission: 'pagos' },
]

const Sidebar = () => {
  const { userProfile, signOut } = useAuth()
  const { sidebarCollapsed, toggleSidebar } = useApp()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const hasPermission = (permission) => {
    if (!permission) return true
    if (!userProfile?.permisos) return false
    return userProfile.permisos[permission]?.ver === true
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-primary-800 text-white flex flex-col transition-all duration-300 z-50 ${
        sidebarCollapsed ? 'w-20' : 'w-70'
      }`}
      style={{ width: sidebarCollapsed ? '80px' : '280px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Icon name="Building2" className="w-6 h-6" />
          {!sidebarCollapsed && (
            <span className="text-xl font-bold">CRMAP</span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Icon name="Menu" className="w-5 h-5" />
        </button>
      </div>

      {/* User Card */}
      <div className="flex items-center gap-3 p-5 border-b border-white/10">
        <div className="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center font-semibold text-sm flex-shrink-0">
          {getInitials(userProfile?.nombre)}
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <p className="font-semibold text-sm truncate">
              {userProfile?.nombre || 'Usuario'}
            </p>
            <p className="text-xs text-white/60">
              {userProfile?.rol || 'Sin rol'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            if (!hasPermission(item.permission)) return null

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white border-l-4 border-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white border-l-4 border-transparent'
                  }`
                }
              >
                <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-4 border-t border-white/10 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors"
      >
        <Icon name="LogOut" className="w-5 h-5 flex-shrink-0" />
        {!sidebarCollapsed && (
          <span className="text-sm font-medium">Cerrar Sesión</span>
        )}
      </button>
    </aside>
  )
}

export default Sidebar
