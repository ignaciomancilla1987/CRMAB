import { useState, useEffect } from 'react'
import { getTratos, getClientes, createTrato, updateTrato, deleteTrato, exportarExcel } from '@services/dataService'
import { etapas } from '@/data/mockData'
import { useApp } from '@context/AppContext'
import { Button, Input, Select, Modal, Icon } from '@components/ui'

const plataformasOptions = [
  { value: 'Sitio Web', label: 'Sitio Web' },
  { value: 'Referido', label: 'Referido' },
  { value: 'Redes Sociales', label: 'Redes Sociales' },
  { value: 'Teléfono', label: 'Teléfono' },
  { value: 'Email', label: 'Email' },
  { value: 'Presencialmente', label: 'Presencialmente' },
  { value: 'Otro', label: 'Otro' },
]

const PipelinePage = () => {
  const { showNotification } = useApp()
  const [tratos, setTratos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [editingTrato, setEditingTrato] = useState(null)
  const [selectedTrato, setSelectedTrato] = useState(null)
  const [formData, setFormData] = useState({
    titulo: '', nombre_completo: '', cliente_id: '',
    plataforma_ingreso: '', fecha_ingreso: new Date().toISOString().split('T')[0],
    motivo_consulta: '', etapa_actual: 'contacto', fecha_vencimiento: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    const [tratosRes, clientesRes] = await Promise.all([getTratos(), getClientes()])
    if (tratosRes.error) showNotification('Error al cargar tratos', 'error')
    else setTratos(tratosRes.data || [])
    setClientes(clientesRes.data || [])
    setLoading(false)
  }

  const tratosPorEtapa = (etapaId) => tratos.filter(t => t.etapa_actual === etapaId)

  const handleOpenModal = (trato = null, etapa = null) => {
    if (trato) {
      setEditingTrato(trato)
      setFormData({
        titulo: trato.titulo, nombre_completo: trato.nombre_completo || '',
        cliente_id: trato.cliente_id || '', plataforma_ingreso: trato.plataforma_ingreso || '',
        fecha_ingreso: trato.fecha_ingreso || new Date().toISOString().split('T')[0],
        motivo_consulta: trato.motivo_consulta || '', etapa_actual: trato.etapa_actual,
        fecha_vencimiento: trato.fecha_vencimiento || ''
      })
    } else {
      setEditingTrato(null)
      setFormData({
        titulo: '', nombre_completo: '', cliente_id: '',
        plataforma_ingreso: '', fecha_ingreso: new Date().toISOString().split('T')[0],
        motivo_consulta: '', etapa_actual: etapa || 'contacto', fecha_vencimiento: ''
      })
    }
    setShowModal(true)
  }

  const handleOpenDetail = (trato) => {
    setSelectedTrato(trato)
    setShowDetailModal(true)
  }

  const handleClienteChange = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId)
    setFormData({
      ...formData,
      cliente_id: clienteId,
      nombre_completo: cliente?.nombre || formData.nombre_completo
    })
  }

  const handleSave = async () => {
    if (!formData.titulo) {
      showNotification('El título es requerido', 'error')
      return
    }
    setSaving(true)
    try {
      if (editingTrato) {
        await updateTrato(editingTrato.id, formData)
        showNotification('Trato actualizado correctamente', 'success')
      } else {
        await createTrato(formData)
        showNotification('Trato creado correctamente', 'success')
      }
      setShowModal(false)
      fetchData()
    } catch (e) {
      showNotification('Error al guardar', 'error')
    }
    setSaving(false)
  }

  const handleMoveEtapa = async (tratoId, nuevaEtapa) => {
    await updateTrato(tratoId, { etapa_actual: nuevaEtapa })
    showNotification('Trato movido correctamente', 'success')
    fetchData()
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este trato?')) return
    await deleteTrato(id)
    showNotification('Trato eliminado correctamente', 'success')
    setShowDetailModal(false)
    fetchData()
  }

  const handleExport = () => {
    exportarExcel(tratos, [
      { titulo: 'Título', campo: t => t.titulo },
      { titulo: 'Cliente', campo: t => t.nombre_completo },
      { titulo: 'Plataforma', campo: t => t.plataforma_ingreso },
      { titulo: 'Etapa', campo: t => etapas.find(e => e.id === t.etapa_actual)?.nombre },
      { titulo: 'Fecha Ingreso', campo: t => t.fecha_ingreso },
      { titulo: 'Vencimiento', campo: t => t.fecha_vencimiento },
    ], 'Pipeline')
    showNotification('Exportado correctamente', 'success')
  }

  const isVencido = (fecha) => fecha && new Date(fecha) < new Date()
  const isProximoVencer = (fecha) => {
    if (!fecha) return false
    const diff = (new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 3
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Pipeline de Tratos</h1>
          <p className="text-gray-500">Gestiona el flujo de tus tratos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="Download" onClick={handleExport}>Exportar</Button>
          <Button icon="Plus" onClick={() => handleOpenModal()} style={{ backgroundColor: '#F59E0B' }}>Nuevo Trato</Button>
        </div>
      </div>

      {/* Alertas de vencimiento */}
      {tratos.some(t => isVencido(t.fecha_vencimiento)) && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-xl flex items-center gap-2 text-red-700">
          <Icon name="AlertCircle" className="w-5 h-5" />
          <span className="font-medium">Hay tratos vencidos que requieren atención</span>
        </div>
      )}
      {tratos.some(t => isProximoVencer(t.fecha_vencimiento)) && (
        <div className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-xl flex items-center gap-2 text-amber-700">
          <Icon name="Clock" className="w-5 h-5" />
          <span className="font-medium">Hay tratos próximos a vencer en los próximos 3 días</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {etapas.map((etapa) => (
            <div key={etapa.id} className="min-w-[280px] max-w-[280px] bg-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: etapa.color }}></div>
                  <h3 className="font-semibold text-gray-800 text-sm">{etapa.nombre}</h3>
                </div>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full" style={{ backgroundColor: etapa.color + '20', color: etapa.color }}>
                  {tratosPorEtapa(etapa.id).length}
                </span>
              </div>
              <div className="space-y-3 min-h-[200px]">
                {tratosPorEtapa(etapa.id).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm mb-2">Sin tratos</p>
                    <button onClick={() => handleOpenModal(null, etapa.id)} className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                      + Agregar trato
                    </button>
                  </div>
                ) : (
                  tratosPorEtapa(etapa.id).map((trato) => {
                    const vencido = isVencido(trato.fecha_vencimiento)
                    const proximo = isProximoVencer(trato.fecha_vencimiento)
                    return (
                      <div
                        key={trato.id}
                        onClick={() => handleOpenDetail(trato)}
                        className={`bg-white rounded-xl p-3 shadow-sm border-2 cursor-pointer hover:shadow-md transition-shadow ${
                          vencido ? 'border-red-400' : proximo ? 'border-amber-400' : 'border-gray-200'
                        }`}
                      >
                        <h4 className="font-semibold text-gray-800 text-sm mb-1">{trato.titulo}</h4>
                        <p className="text-xs text-gray-500 mb-2">{trato.nombre_completo}</p>
                        {trato.fecha_vencimiento && (
                          <div className={`flex items-center gap-1 text-xs ${vencido ? 'text-red-600' : proximo ? 'text-amber-600' : 'text-gray-400'}`}>
                            <Icon name="Clock" className="w-3 h-3" />
                            <span>{new Date(trato.fecha_vencimiento).toLocaleDateString('es-CL')}</span>
                            {vencido && <span className="ml-1 font-medium">• Vencido</span>}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingTrato ? 'Editar Trato' : 'Nuevo Trato'} size="lg" footer={
        <>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving}>Guardar</Button>
        </>
      }>
        <div className="space-y-4">
          <Input label="Título / Tarea" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} placeholder="Ej: Compraventa Depto. Las Condes" required />
          
          <div className="grid grid-cols-2 gap-4">
            <Select label="Cliente (opcional)" value={formData.cliente_id} onChange={e => handleClienteChange(e.target.value)} options={clientes.map(c => ({ value: c.id, label: c.nombre }))} placeholder="Seleccionar cliente..." />
            <Input label="Nombre completo" value={formData.nombre_completo} onChange={e => setFormData({...formData, nombre_completo: e.target.value})} placeholder="Nombre del contacto" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Plataforma de ingreso" value={formData.plataforma_ingreso} onChange={e => setFormData({...formData, plataforma_ingreso: e.target.value})} options={plataformasOptions} />
            <Input label="Fecha de ingreso" type="date" value={formData.fecha_ingreso} onChange={e => setFormData({...formData, fecha_ingreso: e.target.value})} />
          </div>

          <Input label="Motivo de consulta" value={formData.motivo_consulta} onChange={e => setFormData({...formData, motivo_consulta: e.target.value})} placeholder="Describe brevemente el motivo..." />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Etapa" value={formData.etapa_actual} onChange={e => setFormData({...formData, etapa_actual: e.target.value})} options={etapas.map(e => ({ value: e.id, label: e.nombre }))} />
            <Input label="Fecha de vencimiento" type="date" value={formData.fecha_vencimiento} onChange={e => setFormData({...formData, fecha_vencimiento: e.target.value})} />
          </div>
        </div>
      </Modal>

      {/* Modal Detalle */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detalle del Trato" size="lg" footer={
        <>
          <Button variant="danger" icon="Trash2" onClick={() => handleDelete(selectedTrato?.id)}>Eliminar</Button>
          <Button variant="secondary" onClick={() => { setShowDetailModal(false); handleOpenModal(selectedTrato); }}>Editar</Button>
          <Button onClick={() => setShowDetailModal(false)}>Cerrar</Button>
        </>
      }>
        {selectedTrato && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{selectedTrato.titulo}</h3>
              <p className="text-gray-500">{selectedTrato.nombre_completo}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Plataforma:</span><p className="font-medium">{selectedTrato.plataforma_ingreso || '-'}</p></div>
              <div><span className="text-gray-500">Fecha ingreso:</span><p className="font-medium">{selectedTrato.fecha_ingreso || '-'}</p></div>
              <div><span className="text-gray-500">Vencimiento:</span><p className="font-medium">{selectedTrato.fecha_vencimiento || '-'}</p></div>
              <div><span className="text-gray-500">Etapa actual:</span><p className="font-medium">{etapas.find(e => e.id === selectedTrato.etapa_actual)?.nombre}</p></div>
            </div>

            {selectedTrato.motivo_consulta && (
              <div><span className="text-gray-500 text-sm">Motivo:</span><p className="text-gray-700">{selectedTrato.motivo_consulta}</p></div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Mover a etapa:</label>
              <div className="flex flex-wrap gap-2">
                {etapas.map(e => (
                  <button
                    key={e.id}
                    onClick={() => { handleMoveEtapa(selectedTrato.id, e.id); setShowDetailModal(false); }}
                    disabled={e.id === selectedTrato.etapa_actual}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      e.id === selectedTrato.etapa_actual
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={e.id !== selectedTrato.etapa_actual ? { backgroundColor: e.color + '20', color: e.color } : {}}
                  >
                    {e.nombre}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PipelinePage
