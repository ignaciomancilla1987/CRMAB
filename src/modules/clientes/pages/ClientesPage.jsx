import { useState, useEffect } from 'react'
import { getClientes, createCliente, updateCliente, deleteCliente, exportarExcel } from '@services/dataService'
import { useApp } from '@context/AppContext'
import { Button, Input, Modal, Icon } from '@components/ui'

// Validador de RUT chileno
const validarRut = (rut) => {
  if (!rut) return false
  const rutLimpio = rut.replace(/[.-]/g, '').toUpperCase()
  if (rutLimpio.length < 2) return false
  const cuerpo = rutLimpio.slice(0, -1)
  const dv = rutLimpio.slice(-1)
  let suma = 0
  let multiplo = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo
    multiplo = multiplo < 7 ? multiplo + 1 : 2
  }
  const dvEsperado = 11 - (suma % 11)
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : String(dvEsperado)
  return dv === dvCalculado
}

const formatearRut = (rut) => {
  if (!rut) return ''
  const rutLimpio = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (rutLimpio.length < 2) return rutLimpio
  const cuerpo = rutLimpio.slice(0, -1)
  const dv = rutLimpio.slice(-1)
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${cuerpoFormateado}-${dv}`
}

const ClientesPage = () => {
  const { showNotification } = useApp()
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCliente, setEditingCliente] = useState(null)
  const [formData, setFormData] = useState({ nombre: '', rut: '', email: '', telefono: '' })
  const [rutError, setRutError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchClientes() }, [])

  const fetchClientes = async () => {
    setLoading(true)
    const { data, error } = await getClientes()
    if (error) showNotification('Error al cargar clientes', 'error')
    else setClientes(data || [])
    setLoading(false)
  }

  const filteredClientes = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.rut?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (cliente = null) => {
    setRutError('')
    if (cliente) {
      setEditingCliente(cliente)
      setFormData({ nombre: cliente.nombre, rut: cliente.rut, email: cliente.email || '', telefono: cliente.telefono || '' })
    } else {
      setEditingCliente(null)
      setFormData({ nombre: '', rut: '', email: '', telefono: '' })
    }
    setShowModal(true)
  }

  const handleRutChange = (e) => {
    const rut = formatearRut(e.target.value)
    setFormData({ ...formData, rut })
    if (rut && !validarRut(rut)) {
      setRutError('RUT inválido')
    } else {
      setRutError('')
    }
  }

  const handleSave = async () => {
    if (!formData.nombre || !formData.rut) {
      showNotification('Nombre y RUT son requeridos', 'error')
      return
    }
    if (!validarRut(formData.rut)) {
      showNotification('RUT inválido', 'error')
      return
    }
    // Verificar duplicados
    const rutExiste = clientes.find(c => c.rut === formData.rut && c.id !== editingCliente?.id)
    if (rutExiste) {
      showNotification('Ya existe un cliente con ese RUT', 'error')
      return
    }
    setSaving(true)
    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, formData)
        showNotification('Cliente actualizado correctamente', 'success')
      } else {
        await createCliente(formData)
        showNotification('Cliente creado correctamente', 'success')
      }
      setShowModal(false)
      fetchClientes()
    } catch (e) {
      showNotification('Error al guardar', 'error')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return
    await deleteCliente(id)
    showNotification('Cliente eliminado correctamente', 'success')
    fetchClientes()
  }

  const handleExport = () => {
    exportarExcel(filteredClientes, [
      { titulo: 'Nombre', campo: c => c.nombre },
      { titulo: 'RUT', campo: c => c.rut },
      { titulo: 'Email', campo: c => c.email },
      { titulo: 'Teléfono', campo: c => c.telefono },
    ], 'Clientes')
    showNotification('Exportado correctamente', 'success')
  }

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'C'

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Clientes</h1>
          <p className="text-gray-500">Gestiona tu cartera de clientes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="Download" onClick={handleExport}>Exportar</Button>
          <Button icon="Plus" variant="success" onClick={() => handleOpenModal()}>Nuevo Cliente</Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-4 flex items-center gap-3">
        <Icon name="Search" className="w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Buscar por nombre, RUT o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 outline-none text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center"><Icon name="Users" /></div>
          <div><p className="text-xl font-bold">{clientes.length}</p><p className="text-sm text-gray-500">Total Clientes</p></div>
        </div>
        <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center"><Icon name="CheckCircle" /></div>
          <div><p className="text-xl font-bold">{clientes.filter(c => c.activo !== false).length}</p><p className="text-sm text-gray-500">Activos</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">RUT</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Teléfono</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="px-4 py-12 text-center text-gray-500">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Cargando...
              </td></tr>
            ) : filteredClientes.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-12 text-center text-gray-500">
                <Icon name="Users" className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                No hay clientes
              </td></tr>
            ) : filteredClientes.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-semibold text-xs">{getInitials(c.nombre)}</div>
                    <div>
                      <p className="font-medium">{c.nombre}</p>
                      <p className="text-xs text-gray-500">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{c.rut}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-sm">{c.telefono}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700">Activo</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenModal(c)} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200" title="Editar"><Icon name="Edit2" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200" title="Eliminar"><Icon name="Trash2" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Cliente */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'} footer={
        <>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving} variant="success">Guardar</Button>
        </>
      }>
        <div className="space-y-4">
          <Input label="Nombre completo" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Ej: Juan Pérez González" required />
          <div>
            <Input label="RUT" value={formData.rut} onChange={handleRutChange} placeholder="12.345.678-9" error={rutError} required />
            <p className="text-xs text-gray-500 mt-1">Ingresa el RUT con puntos y guión</p>
          </div>
          <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="correo@ejemplo.com" />
          <Input label="Teléfono" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} placeholder="+56 9 1234 5678" />
        </div>
      </Modal>
    </div>
  )
}

export default ClientesPage
