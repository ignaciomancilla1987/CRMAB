import { useState, useEffect } from 'react'
import { getPresupuestos, getClientes, getCodigos, createPresupuesto, updatePresupuesto, deletePresupuesto, createTrato, exportarExcel } from '@services/dataService'
import { useApp } from '@context/AppContext'
import { Button, Input, Select, Modal, Icon } from '@components/ui'

const formatCurrency = (v) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(v || 0)

const estadoOptions = [
  { value: 'borrador', label: 'Borrador' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'rechazado', label: 'Rechazado' },
]

const estadoStyles = {
  borrador: 'bg-gray-100 text-gray-700',
  enviado: 'bg-blue-100 text-blue-700',
  aprobado: 'bg-green-100 text-green-700',
  rechazado: 'bg-red-100 text-red-700',
}

const PresupuestosPage = () => {
  const { showNotification } = useApp()
  const [presupuestos, setPresupuestos] = useState([])
  const [clientes, setClientes] = useState([])
  const [codigos, setCodigos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPresupuesto, setEditingPresupuesto] = useState(null)
  const [formData, setFormData] = useState({
    cliente_id: '', fecha: new Date().toISOString().split('T')[0],
    items: [], descuento: 0, estado: 'borrador', observaciones: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    const [presRes, cliRes, codRes] = await Promise.all([getPresupuestos(), getClientes(), getCodigos()])
    if (presRes.error) showNotification('Error al cargar', 'error')
    else setPresupuestos(presRes.data || [])
    setClientes(cliRes.data || [])
    setCodigos(codRes.data || [])
    setLoading(false)
  }

  const getClienteName = (clienteId) => clientes.find(c => c.id === clienteId)?.nombre || 'N/A'

  const filteredPresupuestos = presupuestos.filter(p =>
    p.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClienteName(p.cliente_id).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const calcularTotales = (items, descuento) => {
    const subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    const descuentoMonto = subtotal * (descuento / 100)
    const total = subtotal - descuentoMonto
    return { subtotal, total }
  }

  const handleOpenModal = (presupuesto = null) => {
    if (presupuesto) {
      setEditingPresupuesto(presupuesto)
      setFormData({
        cliente_id: presupuesto.cliente_id,
        fecha: presupuesto.fecha,
        items: presupuesto.items || [{ codigo_id: '', cantidad: 1, precio: 0 }],
        descuento: presupuesto.descuento || 0,
        estado: presupuesto.estado,
        observaciones: presupuesto.observaciones || ''
      })
    } else {
      setEditingPresupuesto(null)
      setFormData({
        cliente_id: '', fecha: new Date().toISOString().split('T')[0],
        items: [{ codigo_id: '', cantidad: 1, precio: 0 }],
        descuento: 0, estado: 'borrador', observaciones: ''
      })
    }
    setShowModal(true)
  }

  const handleAddItem = () => {
    setFormData({ ...formData, items: [...formData.items, { codigo_id: '', cantidad: 1, precio: 0 }] })
  }

  const handleRemoveItem = (index) => {
    const items = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: items.length ? items : [{ codigo_id: '', cantidad: 1, precio: 0 }] })
  }

  const handleItemChange = (index, field, value) => {
    const items = [...formData.items]
    items[index][field] = value
    if (field === 'codigo_id') {
      const codigo = codigos.find(c => c.id === value)
      if (codigo) items[index].precio = codigo.precio
    }
    setFormData({ ...formData, items })
  }

  const handleSave = async () => {
    if (!formData.cliente_id) {
      showNotification('Selecciona un cliente', 'error')
      return
    }
    if (!formData.items.some(i => i.codigo_id)) {
      showNotification('Agrega al menos un servicio', 'error')
      return
    }
    setSaving(true)
    try {
      const { subtotal, total } = calcularTotales(formData.items, formData.descuento)
      const data = { ...formData, subtotal, total }
      
      if (editingPresupuesto) {
        const estadoAnterior = editingPresupuesto.estado
        await updatePresupuesto(editingPresupuesto.id, data)
        showNotification('Presupuesto actualizado correctamente', 'success')
        
        // Si cambió a aprobado, crear trato
        if (estadoAnterior !== 'aprobado' && data.estado === 'aprobado') {
          const cliente = clientes.find(c => c.id === data.cliente_id)
          await createTrato({
            cliente_id: data.cliente_id,
            presupuesto_id: editingPresupuesto.id,
            titulo: `Presupuesto ${editingPresupuesto.numero}`,
            nombre_completo: cliente?.nombre || '',
            etapa_actual: 'en_proceso',
            plataforma_ingreso: 'Presupuesto',
            fecha_ingreso: new Date().toISOString().split('T')[0]
          })
          showNotification('Trato creado en Pipeline', 'success')
        }
      } else {
        const result = await createPresupuesto(data)
        showNotification('Presupuesto creado correctamente', 'success')
        
        // Si se crea como aprobado, crear trato
        if (data.estado === 'aprobado' && result.data) {
          const cliente = clientes.find(c => c.id === data.cliente_id)
          await createTrato({
            cliente_id: data.cliente_id,
            presupuesto_id: result.data.id,
            titulo: `Presupuesto ${result.data.numero}`,
            nombre_completo: cliente?.nombre || '',
            etapa_actual: 'en_proceso',
            plataforma_ingreso: 'Presupuesto',
            fecha_ingreso: new Date().toISOString().split('T')[0]
          })
        }
      }
      setShowModal(false)
      fetchData()
    } catch (e) {
      showNotification('Error al guardar', 'error')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este presupuesto?')) return
    await deletePresupuesto(id)
    showNotification('Presupuesto eliminado correctamente', 'success')
    fetchData()
  }

  const handleExport = () => {
    exportarExcel(filteredPresupuestos, [
      { titulo: 'Número', campo: p => p.numero },
      { titulo: 'Cliente', campo: p => getClienteName(p.cliente_id) },
      { titulo: 'Fecha', campo: p => p.fecha },
      { titulo: 'Subtotal', campo: p => p.subtotal },
      { titulo: 'Descuento %', campo: p => p.descuento },
      { titulo: 'Total', campo: p => p.total },
      { titulo: 'Estado', campo: p => p.estado },
    ], 'Presupuestos')
    showNotification('Exportado correctamente', 'success')
  }

  const { subtotal, total } = calcularTotales(formData.items, formData.descuento)

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Presupuestos</h1>
          <p className="text-gray-500">Gestiona tus presupuestos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="Download" onClick={handleExport}>Exportar</Button>
          <Button icon="Plus" onClick={() => handleOpenModal()} style={{ backgroundColor: '#8B5CF6' }}>Nuevo Presupuesto</Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-4 flex items-center gap-3">
        <Icon name="Search" className="w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 outline-none text-sm" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><Icon name="FileText" /></div>
          <div><p className="text-xl font-bold">{presupuestos.length}</p><p className="text-sm text-gray-500">Total</p></div>
        </div>
        <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center"><Icon name="Check" /></div>
          <div><p className="text-xl font-bold">{presupuestos.filter(p => p.estado === 'aprobado').length}</p><p className="text-sm text-gray-500">Aprobados</p></div>
        </div>
        <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center"><Icon name="Clock" /></div>
          <div><p className="text-xl font-bold">{presupuestos.filter(p => ['borrador', 'enviado'].includes(p.estado)).length}</p><p className="text-sm text-gray-500">Pendientes</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N° Presupuesto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="px-4 py-12 text-center text-gray-500">Cargando...</td></tr>
            ) : filteredPresupuestos.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                <Icon name="FileText" className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                No hay presupuestos
              </td></tr>
            ) : filteredPresupuestos.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-purple-600">{p.numero}</td>
                <td className="px-4 py-3 text-gray-600 text-sm">{getClienteName(p.cliente_id)}</td>
                <td className="px-4 py-3 text-gray-600 text-sm">{p.fecha}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(p.total)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${estadoStyles[p.estado]}`}>{p.estado}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenModal(p)} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"><Icon name="Edit2" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"><Icon name="Trash2" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Presupuesto */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingPresupuesto ? 'Editar Presupuesto' : 'Nuevo Presupuesto'} size="lg" footer={
        <>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving}>Guardar</Button>
        </>
      }>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Cliente" value={formData.cliente_id} onChange={e => setFormData({...formData, cliente_id: e.target.value})} options={clientes.map(c => ({ value: c.id, label: c.nombre }))} required />
            <Input label="Fecha" type="date" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} required />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Servicios</label>
              <Button variant="secondary" size="sm" icon="Plus" onClick={handleAddItem}>Agregar</Button>
            </div>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b"><th className="px-3 py-2 text-left">Servicio</th><th className="px-3 py-2 text-center w-20">Cant.</th><th className="px-3 py-2 text-right w-28">Precio</th><th className="px-3 py-2 text-right w-28">Subtotal</th><th className="w-10"></th></tr></thead>
                <tbody>
                  {formData.items.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-3 py-2">
                        <select value={item.codigo_id} onChange={e => handleItemChange(idx, 'codigo_id', e.target.value)} className="w-full border rounded px-2 py-1 text-sm">
                          <option value="">Seleccionar...</option>
                          {codigos.map(c => <option key={c.id} value={c.id}>{c.codigo} - {c.descripcion}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2"><input type="number" min="1" value={item.cantidad} onChange={e => handleItemChange(idx, 'cantidad', parseInt(e.target.value) || 1)} className="w-full border rounded px-2 py-1 text-sm text-center" /></td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.precio)}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.precio * item.cantidad)}</td>
                      <td className="px-2 py-2"><button onClick={() => handleRemoveItem(idx)} className="p-1 text-red-500 hover:text-red-700"><Icon name="X" className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input label="Descuento (%)" type="number" min="0" max="100" value={formData.descuento} onChange={e => setFormData({...formData, descuento: parseFloat(e.target.value) || 0})} />
            </div>
            <Select label="Estado" value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} options={estadoOptions} />
          </div>

          <Input label="Observaciones" value={formData.observaciones} onChange={e => setFormData({...formData, observaciones: e.target.value})} placeholder="Notas adicionales..." />

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span>Descuento ({formData.descuento}%):</span><span className="text-red-600">-{formatCurrency(subtotal * formData.descuento / 100)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total:</span><span>{formatCurrency(total)}</span></div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PresupuestosPage
