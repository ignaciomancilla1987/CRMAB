import { useState, useEffect } from 'react'
import { supabase } from '@services/supabase'
import { useApp } from '@context/AppContext'
import { Button, Icon } from '@components/ui'

const PagosPage = () => {
  const { showNotification } = useApp()
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPagos()
  }, [])

  const fetchPagos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('presupuestos')
      .select(`*, clientes(nombre), pagos(*)`)
      .eq('estado', 'aprobado')
      .order('created_at', { ascending: false })
    if (error) showNotification('Error al cargar pagos', 'error')
    else setPagos(data || [])
    setLoading(false)
  }

  const formatCurrency = (v) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(v || 0)

  const calcularPagado = (p) => (p.pagos || []).reduce((sum, pago) => sum + (pago.monto || 0), 0)
  const calcularSaldo = (p) => (p.total || 0) - calcularPagado(p)

  const getEstadoPago = (p) => {
    const saldo = calcularSaldo(p)
    if (saldo <= 0) return { text: 'Pagado', style: 'bg-success-100 text-success-700' }
    if (calcularPagado(p) > 0) return { text: 'Parcial', style: 'bg-warning-100 text-warning-700' }
    return { text: 'Pendiente', style: 'bg-danger-100 text-danger-700' }
  }

  const filteredPagos = pagos.filter(p =>
    p.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clientes?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalFacturado = pagos.reduce((sum, p) => sum + (p.total || 0), 0)
  const totalCobrado = pagos.reduce((sum, p) => sum + calcularPagado(p), 0)

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-800 mb-1">Pagos</h1>
          <p className="text-gray-500">Control de pagos de presupuestos aprobados</p>
        </div>
        <Button variant="secondary" icon="Download">Exportar</Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-3 mb-6 flex items-center gap-3">
        <Icon name="Search" className="w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 outline-none text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Icon name="FileText" className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold text-gray-800">{pagos.length}</p><p className="text-sm text-gray-500">Aprobados</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><Icon name="DollarSign" className="w-6 h-6" /></div>
          <div><p className="text-xl font-bold text-gray-800">{formatCurrency(totalFacturado)}</p><p className="text-sm text-gray-500">Facturado</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-success-100 text-success-600 flex items-center justify-center"><Icon name="CheckCircle" className="w-6 h-6" /></div>
          <div><p className="text-xl font-bold text-gray-800">{formatCurrency(totalCobrado)}</p><p className="text-sm text-gray-500">Cobrado</p></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-danger-100 text-danger-600 flex items-center justify-center"><Icon name="AlertCircle" className="w-6 h-6" /></div>
          <div><p className="text-xl font-bold text-gray-800">{formatCurrency(totalFacturado - totalCobrado)}</p><p className="text-sm text-gray-500">Pendiente</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">N° Presupuesto</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Pagado</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Saldo</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="px-5 py-16 text-center text-gray-500">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>Cargando...
              </td></tr>
            ) : filteredPagos.length === 0 ? (
              <tr><td colSpan="7" className="px-5 py-16 text-center text-gray-500">
                <Icon name="CreditCard" className="w-12 h-12 mx-auto mb-3 text-gray-300" />No hay presupuestos aprobados
              </td></tr>
            ) : filteredPagos.map((p) => {
              const estado = getEstadoPago(p)
              const saldo = calcularSaldo(p)
              return (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-4 font-semibold text-success-600">{p.numero}</td>
                  <td className="px-5 py-4 text-gray-600">{p.clientes?.nombre || 'N/A'}</td>
                  <td className="px-5 py-4 font-semibold">{formatCurrency(p.total)}</td>
                  <td className="px-5 py-4 font-semibold text-success-600">{formatCurrency(calcularPagado(p))}</td>
                  <td className="px-5 py-4 font-semibold" style={{ color: saldo > 0 ? '#DC2626' : '#059669' }}>{formatCurrency(saldo)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium ${estado.style}`}>{estado.text}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-success-100 text-success-600 hover:bg-success-200"><Icon name="Eye" className="w-4 h-4" /></button>
                      <button className="p-2 rounded-lg bg-success-100 text-success-600 hover:bg-success-200"><Icon name="Plus" className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PagosPage
