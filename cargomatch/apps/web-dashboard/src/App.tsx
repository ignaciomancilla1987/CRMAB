import { Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Eventos from './pages/Eventos'
import EventoDetalle from './pages/EventoDetalle'
import Simular from './pages/Simular'
import Alertas from './pages/Alertas'

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium ${
          isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">CargoMatch</span>
            <span className="text-xs text-slate-500">validación inteligente de despachos</span>
          </div>
          <nav className="flex items-center gap-1">
            <NavItem to="/">Dashboard</NavItem>
            <NavItem to="/eventos">Eventos</NavItem>
            <NavItem to="/alertas">Alertas</NavItem>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/eventos/:id" element={<EventoDetalle />} />
          <Route path="/simular/:id" element={<Simular />} />
          <Route path="/alertas" element={<Alertas />} />
        </Routes>
      </main>
    </div>
  )
}
