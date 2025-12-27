import { useState, useEffect } from 'react'
import { getPresupuestosConPagos, getClientes, createPago, deletePago, exportarExcel } from '@services/dataService'
import { useApp } from '@context/AppContext'
import { Button, Input, Modal, Icon } from '@components/ui'

const formatCurrency = (v) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(v || 0)

const PagosPage = () => {
  const { showNotification } = useApp()
  const [presupuestos, setPresupuestos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPagoModal, setShowPagoModal] = useState(false)
  const [showDetalleModal, setShowDetalleModal] = useState(false)
  const [selectedPresupuesto, setSelectedPresupuesto] = useState(null)
  const [pagoForm, setPagoForm] = useState({
    quien_transfiere: '', monto: '', fecha: new Date().toISOString().split('T')[0], observaciones: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    const [pagosRes, clientesRes] = await Promise.all([getPresupuestosConPagos(), getClientes()])
    if (pagosRes.error) showNotification('Error al cargar pagos', 'error')
    else setPresupuestos(pagosRes.data || [])
    setClientes(clientesRes.data || [])
    setLoading(false)
  }

  const getClienteName = (p) => {
    const cliente = clientes.find(c => c.id === p.cliente_id)
    return cliente?.nombre || p.clientes?.nombre || 'N/A'
  }

  const calcularPagado = (p) => (p.pagos || []).reduce((sum, pago) => sum + (pago.monto || 0), 0)
  const calcularSaldo = (p) => (p.total || 0) - calcularPagado(p)

  const getEstadoPago = (p) => {
    const saldo = calcularSaldo(p)
    if (saldo <= 0) return { text: 'Pagado', style: 'bg-green-100 text-green-700' }
    if (calcularPagado(p) > 0) return { text: 'Parcial', style: 'bg-yellow-100 text-yellow-700' }
    return { text: 'Pendiente', style: 'bg-red-100 text-red-700' }
  }

  const filteredPresupuestos = presupuestos.filter(p =>
    p.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClienteName(p).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalFacturado = presupuestos.reduce((s, p) => s + (p.total || 0), 0)
  const totalCobrado = presupuestos.reduce((s, p) => s + calcularPagado(p), 0)

  const handleOpenPagoModal = (presupuesto) => {
    setSelectedPresupuesto(presupuesto)
    const cliente = clientes.find(c => c.id === presupuesto.cliente_id)
    setPagoForm({
      quien_transfiere: cliente?.nombre || '',
      monto: '',
      fecha: new Date().toISOString().split('T')[0],
      observaciones: ''
    })
    setShowPagoModal(true)
  }

  const handleOpenDetalleModal = (presupuesto) => {
    setSelectedPresupuesto(presupuesto)
    setShowDetalleModal(true)
  }

  const handleSavePago = async () => {
    if (!pagoForm.quien_transfiere || !pagoForm.monto) {
      showNotification('Completa los campos requeridos', 'error')
      return
    }
    const monto = parseInt(pagoForm.monto.replace(/\D/g, ''))
    if (isNaN(monto) || monto <= 0) {
      showNotification('Monto inválido', 'error')
      return
    }
    setSaving(true)
    try {
      await createPago({
        presupuesto_id: selectedPresupuesto.id,
        quien_transfiere: pagoForm.quien_transfiere,
        monto,
        fecha: pagoForm.fecha,
        observaciones: pagoForm.observaciones
      })
      showNotification('Pago registrado correctamente', 'success')
      setShowPagoModal(false)
      fetchData()
    } catch (e) {
      showNotification('Error al guardar', 'error')
    }
    setSaving(false)
  }

  const handleDeletePago = async (pagoId) => {
    if (!confirm('¿Eliminar este pago?')) return
    await deletePago(pagoId)
    showNotification('Pago eliminado', 'success')
    fetchData()
    // Actualizar el modal si está abierto
    if (selectedPresupuesto) {
      const updated = presupuestos.find(p => p.id === selectedPresupuesto.id)
      if (updated) setSelectedPresupuesto(updated)
    }
  }

  const handleExport = () => {
    const data = []
    filteredPresupuestos.forEach(p => {
      data.push({
        numero: p.numero,
        cliente: getClienteName(p),
        total: p.total,
        pagado: calcularPagado(p),
        saldo: calcularSaldo(p),
        estado: getEstadoPago(p).text
      })
    })
    exportarExcel(data, [
      { titulo: 'N° Presupuesto', campo: d => d.numero },
      { titulo: 'Cliente', campo: d => d.cliente },
      { titulo: 'Total', campo: d => d.total },
      { titulo: 'Pagado', campo: d => d.pagado },
      { titulo: 'Saldo', campo: d => d.saldo },
      { titulo: 'Estado', campo: d => d.estado },
    ], 'Pagos')
    showNotification('Exportado correctamente', 'success')
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Pagos</h1>
          <p className="text-gray-500">Control de pagos de presupuestos aprobados</p>
        </div>
        <Button variant="secondary" icon="Download" onClick={handleExport}>Exportar</Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-4 flex items-center gap-3">
        <Icon name="Search" className="w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 outline-none text-sm" />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Icon name="FileText" /></div>
          <div><p className="text-xl font-bold">{presupuestos.length}</p><p className="text-sm text-gray-500">Aprobados</p></div>
        </div>
        <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><Icon name="DollarSign" /></div>
          <div><p className="text-lg font-bold">{formatCurrency(totalFacturado)}</p><p className="text-sm text-gray-500">Facturado</p></div>
        </div>
        <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center"><Icon name="CheckCircle" /></div>
          <div><p className="text-lg font-bold">{formatCurrency(totalCobrado)}</p><p className="text-sm text-gray-500">Cobrado</p></div>
        </div>
        <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center"><Icon name="AlertCircle" /></div>
          <div><p className="text-lg font-bold">{formatCurrency(totalFacturado - totalCobrado)}</p><p className="text-sm text-gray-500">Pendiente</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N° Presupuesto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pagado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Saldo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="px-4 py-12 text-center text-gray-500">Cargando...</td></tr>
            ) : filteredPresupuestos.length === 0 ? (
              <tr><td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                <Icon name="CreditCard" className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                No hay presupuestos aprobados
              </td></tr>
            ) : filteredPresupuestos.map(p => {
              const estado = getEstadoPago(p)
              const saldo = calcularSaldo(p)
              return (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-green-600">{p.numero}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{getClienteName(p)}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(p.total)}</td>
                  <td className="px-4 py-3 font-semibold text-green-600">{formatCurrency(calcularPagado(p))}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: saldo > 0 ? '#DC2626' : '#059669' }}>{formatCurrency(saldo)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${estado.style}`}>{estado.text}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => handleOpenDetalleModal(p)} className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200" title="Ver detalle">
                        <Icon name="Eye" />
                      </button>
                      <button onClick={() => handleOpenPagoModal(p)} className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200" title="Agregar pago">
                        <Icon name="Plus" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Agregar Pago */}
      <Modal isOpen={showPagoModal} onClose={() => setShowPagoModal(false)} title="Registrar Pago" footer={
        <>
          <Button variant="secondary" onClick={() => setShowPagoModal(false)}>Cancelar</Button>
          <Button onClick={handleSavePago} loading={saving} variant="success">Registrar Pago</Button>
        </>
      }>
        {selectedPresupuesto && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-500">Presupuesto</p>
              <p className="font-bold text-lg">{selectedPresupuesto.numero}</p>
              <div className="flex justify-between mt-2 text-sm">
                <span>Total: {formatCurrency(selectedPresupuesto.total)}</span>
                <span>Saldo: <strong className="text-red-600">{formatCurrency(calcularSaldo(selectedPresupuesto))}</strong></span>
              </div>
            </div>

            <Input label="Quién transfiere" value={pagoForm.quien_transfiere} onChange={e => setPagoForm({...pagoForm, quien_transfiere: e.target.value})} placeholder="Nombre de quien realiza el pago" required />
            <Input label="Monto (CLP)" type="number" value={pagoForm.monto} onChange={e => setPagoForm({...pagoForm, monto: e.target.value})} placeholder="Ej: 150000" required />
            <Input label="Fecha" type="date" value={pagoForm.fecha} onChange={e => setPagoForm({...pagoForm, fecha: e.target.value})} required />
            <Input label="Observaciones" value={pagoForm.observaciones} onChange={e => setPagoForm({...pagoForm, observaciones: e.target.value})} placeholder="Notas opcionales..." />
          </div>
        )}
      </Modal>

      {/* Modal Detalle */}
      <Modal isOpen={showDetalleModal} onClose={() => setShowDetalleModal(false)} title="Detalle de Pagos" size="lg" footer={
        <>
          <Button variant="secondary" onClick={() => setShowDetalleModal(false)}>Cerrar</Button>
          <Button onClick={() => { setShowDetalleModal(false); handleOpenPagoModal(selectedPresupuesto); }} variant="success" icon="Plus">Agregar Pago</Button>
        </>
      }>
        {selectedPresupuesto && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg">{selectedPresupuesto.numero}</p>
                  <p className="text-gray-500">{getClienteName(selectedPresupuesto)}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getEstadoPago(selectedPresupuesto).style}`}>
                  {getEstadoPago(selectedPresupuesto).text}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                <div><p className="text-sm text-gray-500">Total</p><p className="font-bold">{formatCurrency(selectedPresupuesto.total)}</p></div>
                <div><p className="text-sm text-gray-500">Pagado</p><p className="font-bold text-green-600">{formatCurrency(calcularPagado(selectedPresupuesto))}</p></div>
                <div><p className="text-sm text-gray-500">Saldo</p><p className="font-bold text-red-600">{formatCurrency(calcularSaldo(selectedPresupuesto))}</p></div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Historial de Pagos</h4>
              {(selectedPresupuesto.pagos || []).length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No hay pagos registrados</p>
              ) : (
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 border-b"><th className="px-3 py-2 text-left">Fecha</th><th className="px-3 py-2 text-left">Quién</th><th className="px-3 py-2 text-right">Monto</th><th className="px-3 py-2 text-left">Obs.</th><th className="w-10"></th></tr></thead>
                    <tbody>
                      {(selectedPresupuesto.pagos || []).map(pago => (
                        <tr key={pago.id} className="border-b">
                          <td className="px-3 py-2">{pago.fecha}</td>
                          <td className="px-3 py-2">{pago.quien_transfiere}</td>
                          <td className="px-3 py-2 text-right font-semibold text-green-600">{formatCurrency(pago.monto)}</td>
                          <td className="px-3 py-2 text-gray-500 text-xs">{pago.observaciones || '-'}</td>
                          <td className="px-2 py-2">
                            <button onClick={() => handleDeletePago(pago.id)} className="p-1 text-red-500 hover:text-red-700" title="Eliminar">
                              <Icon name="Trash2" className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PagosPage
