import { useState, useEffect } from 'react'
import { getCodigos, createCodigo, updateCodigo, deleteCodigo, exportarExcel } from '@services/dataService'
import { useApp } from '@context/AppContext'
import { Button, Input, Modal, Icon } from '@components/ui'

const formatCurrency = (v) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(v || 0)

const CodigosPage = () => {
  const { showNotification } = useApp()
  const [codigos, setCodigos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCodigo, setEditingCodigo] = useState(null)
  const [formData, setFormData] = useState({ codigo: '', descripcion: '', precio: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchCodigos() }, [])

  const fetchCodigos = async () => {
    setLoading(true)
    const { data, error } = await getCodigos()
    if (error) showNotification('Error al cargar códigos', 'error')
    else setCodigos(data || [])
    setLoading(false)
  }

  const filteredCodigos = codigos.filter(c =>
    c.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (codigo = null) => {
    if (codigo) {
      setEditingCodigo(codigo)
      setFormData({ codigo: codigo.codigo, descripcion: codigo.descripcion, precio: String(codigo.precio) })
    } else {
      setEditingCodigo(null)
      setFormData({ codigo: '', descripcion: '', precio: '' })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.codigo || !formData.descripcion || !formData.precio) {
      showNotification('Completa todos los campos', 'error')
      return
    }
    const precio = parseInt(formData.precio.replace(/\D/g, ''))
    if (isNaN(precio) || precio <= 0) {
      showNotification('Precio inválido', 'error')
      return
    }
    // Verificar código duplicado
    const codigoExiste = codigos.find(c => c.codigo.toLowerCase() === formData.codigo.toLowerCase() && c.id !== editingCodigo?.id)
    if (codigoExiste) {
      showNotification('Ya existe un servicio con ese código', 'error')
      return
    }
    setSaving(true)
    try {
      const data = { codigo: formData.codigo.toUpperCase(), descripcion: formData.descripcion, precio }
      if (editingCodigo) {
        await updateCodigo(editingCodigo.id, data)
        showNotification('Código actualizado correctamente', 'success')
      } else {
        await createCodigo(data)
        showNotification('Código creado correctamente', 'success')
      }
      setShowModal(false)
      fetchCodigos()
    } catch (e) {
      showNotification('Error al guardar', 'error')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este código?')) return
    await deleteCodigo(id)
    showNotification('Código eliminado correctamente', 'success')
    fetchCodigos()
  }

  const handleExport = () => {
    exportarExcel(filteredCodigos, [
      { titulo: 'Código', campo: c => c.codigo },
      { titulo: 'Descripción', campo: c => c.descripcion },
      { titulo: 'Precio', campo: c => c.precio },
    ], 'CodigosServicio')
    showNotification('Exportado correctamente', 'success')
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Códigos de Servicio</h1>
          <p className="text-gray-500">Catálogo de servicios y precios</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="Download" onClick={handleExport}>Exportar</Button>
          <Button icon="Plus" onClick={() => handleOpenModal()} style={{ backgroundColor: '#8B5CF6' }}>Nuevo Código</Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-4 flex items-center gap-3">
        <Icon name="Search" className="w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Buscar código o descripción..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 outline-none text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><Icon name="Hash" /></div>
          <div><p className="text-xl font-bold">{codigos.length}</p><p className="text-sm text-gray-500">Total Códigos</p></div>
        </div>
        <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center"><Icon name="DollarSign" /></div>
          <div><p className="text-xl font-bold">{formatCurrency(codigos.reduce((s, c) => s + (c.precio || 0), 0) / codigos.length || 0)}</p><p className="text-sm text-gray-500">Precio Promedio</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Código</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Precio</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="px-4 py-12 text-center text-gray-500">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Cargando...
              </td></tr>
            ) : filteredCodigos.length === 0 ? (
              <tr><td colSpan="4" className="px-4 py-12 text-center text-gray-500">
                <Icon name="Hash" className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                No hay códigos
              </td></tr>
            ) : filteredCodigos.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-mono font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">{c.codigo}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-sm">{c.descripcion}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(c.precio)}</td>
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

      {/* Modal Código */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCodigo ? 'Editar Código' : 'Nuevo Código'} footer={
        <>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving}>Guardar</Button>
        </>
      }>
        <div className="space-y-4">
          <Input label="Código" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value.toUpperCase()})} placeholder="Ej: EST-001" required />
          <Input label="Descripción" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} placeholder="Descripción del servicio" required />
          <Input label="Precio (CLP)" type="number" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} placeholder="150000" required />
        </div>
      </Modal>
    </div>
  )
}

export default CodigosPage
