import { useLocation } from 'react-router-dom'
import Icon from '@components/ui/Icon'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/usuarios': 'Usuarios',
  '/clientes': 'Clientes',
  '/presupuestos': 'Presupuestos',
  '/codigos': 'Códigos de Servicio',
  '/pipeline': 'Pipeline',
  '/pagos': 'Pagos',
}

const Header = () => {
  const location = useLocation()
  const currentTitle = pageTitles[location.pathname] || 'CRMAP'

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-gray-500">
        <Icon name="Home" className="w-4 h-4" />
        <Icon name="ChevronRight" className="w-4 h-4" />
        <span className="text-sm font-medium text-primary-800">
          {currentTitle}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="relative p-2.5 bg-gray-100 rounded-xl text-gray-500 hover:bg-gray-200 transition-colors">
          <Icon name="Bell" className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
            3
          </span>
        </button>
      </div>
    </header>
  )
}

export default Header
