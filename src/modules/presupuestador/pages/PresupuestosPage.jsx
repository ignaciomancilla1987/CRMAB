import { useState, useEffect } from 'react'
import { supabase } from '@services/supabase'
import { useApp } from '@context/AppContext'
import { Button, Icon } from '@components/ui'

const PresupuestosPage = () => {
  const { showNotification } = useApp()
  const [presupuestos, setPresupuestos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPresupuestos()
  }, [])

  const fetchPresupuestos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('presupuestos')
      .select(`*, clientes(nombre)`)
      .order('created_at', { ascending: false })

    if (error) {
      showNotification('Error al cargar presupuestos', 'error')
    } else {
      setPresupuestos(data || [])
    }
    setLoading(false)
  }

  const filteredPresupuestos = presupuestos.filter(p =>
    p.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clientes?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value || 0)
  }

  const estadoStyles = {
    borrador: 'bg-gray-100 text-gray-700',
    enviado: 'bg-blue-100 text-blue-700',
    aprobado: 'bg-success-100 text-success-700',
    rechazado: 'bg-danger-100 text-danger-700',
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-800 mb-1">Presupuestos</h1>
          <p className="text-gray-500">Gestiona tus presupuestos</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon="Download">Exportar</Button>
          <Button icon="Plus" style={{ backgroundColor: '#8B5CF6' }}>Nuevo Presupuesto</Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-3 mb-6 flex items-center gap-3">
        <Icon name="Search" className="w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 outline-none text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><Icon name="FileText" className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold text-gray-800">{presupuestos.length}</p><p className="text-sm text-gray-500">Total</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-success-100 text-success-600 flex items-center justify-center"><Icon name="Check" className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold text-gray-800">{presupuestos.filter(p => p.estado === 'aprobado').length}</p><p className="text-sm text-gray-500">Aprobados</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-warning-100 text-warning-600 flex items-center justify-center"><Icon name="Clock" className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold text-gray-800">{presupuestos.filter(p => p.estado === 'borrador' || p.estado === 'enviado').length}</p><p className="text-sm text-gray-500">Pendientes</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">N° Presupuesto</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="px-5 py-16 text-center text-gray-500">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>Cargando...
              </td></tr>
            ) : filteredPresupuestos.length === 0 ? (
              <tr><td colSpan="6" className="px-5 py-16 text-center text-gray-500">
                <Icon name="FileText" className="w-12 h-12 mx-auto mb-3 text-gray-300" />No hay presupuestos
              </td></tr>
            ) : filteredPresupuestos.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-4 font-semibold text-purple-600">{p.numero}</td>
                <td className="px-5 py-4 text-gray-600">{p.clientes?.nombre || 'N/A'}</td>
                <td className="px-5 py-4 text-gray-600">{p.fecha}</td>
                <td className="px-5 py-4 font-semibold">{formatCurrency(p.total)}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium capitalize ${estadoStyles[p.estado] || estadoStyles.borrador}`}>{p.estado}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"><Icon name="Edit2" className="w-4 h-4" /></button>
                    <button className="p-2 rounded-lg bg-danger-100 text-danger-600 hover:bg-danger-200"><Icon name="Trash2" className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PresupuestosPage
