import { useState, useEffect } from 'react'
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, exportarExcel } from '@services/dataService'
import { useApp } from '@context/AppContext'
import { Button, Input, Select, Modal, Icon } from '@components/ui'

const roles = [
  { value: 'Administrador', label: 'Administrador' },
  { value: 'Abogado Senior', label: 'Abogado Senior' },
  { value: 'Abogado Junior', label: 'Abogado Junior' },
  { value: 'Asistente Legal', label: 'Asistente Legal' },
  { value: 'Secretaria', label: 'Secretaria' },
]

const defaultPermisos = {
  usuarios: { ver: false, crear: false, editar: false, eliminar: false },
  clientes: { ver: true, crear: false, editar: false, eliminar: false },
  presupuestador: { ver: true, crear: false, editar: false, eliminar: false },
  pipeline: { ver: true, crear: false, editar: false, eliminar: false },
  pagos: { ver: true, crear: false, editar: false, eliminar: false },
}

const UsuariosPage = () => {
  const { showNotification } = useApp()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showPermisosModal, setShowPermisosModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({ nombre: '', email: '', rol: '', activo: true })
  const [permisosData, setPermisosData] = useState(defaultPermisos)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchUsuarios() }, [])

  const fetchUsuarios = async () => {
    setLoading(true)
    const { data, error } = await getUsuarios()
    if (error) showNotification('Error al cargar usuarios', 'error')
    else setUsuarios(data || [])
    setLoading(false)
  }

  const filteredUsuarios = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({ nombre: user.nombre, email: user.email, rol: user.rol, activo: user.activo })
    } else {
      setEditingUser(null)
      setFormData({ nombre: '', email: '', rol: '', activo: true })
    }
    setShowModal(true)
  }

  const handleOpenPermisosModal = (user) => {
    setEditingUser(user)
    setPermisosData(user.permisos || defaultPermisos)
    setShowPermisosModal(true)
  }

  const handleSave = async () => {
    if (!formData.nombre || !formData.email || !formData.rol) {
      showNotification('Completa todos los campos', 'error')
      return
    }
    setSaving(true)
    try {
      if (editingUser) {
        await updateUsuario(editingUser.id, formData)
        showNotification('Usuario actualizado correctamente', 'success')
      } else {
        await createUsuario({ ...formData, permisos: defaultPermisos })
        showNotification('Usuario creado correctamente', 'success')
      }
      setShowModal(false)
      fetchUsuarios()
    } catch (e) {
      showNotification('Error al guardar', 'error')
    }
    setSaving(false)
  }

  const handleSavePermisos = async () => {
    setSaving(true)
    try {
      await updateUsuario(editingUser.id, { permisos: permisosData })
      showNotification('Permisos actualizados correctamente', 'success')
      setShowPermisosModal(false)
      fetchUsuarios()
    } catch (e) {
      showNotification('Error al guardar permisos', 'error')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return
    await deleteUsuario(id)
    showNotification('Usuario eliminado correctamente', 'success')
    fetchUsuarios()
  }

  const handleExport = () => {
    exportarExcel(filteredUsuarios, [
      { titulo: 'Nombre', campo: u => u.nombre },
      { titulo: 'Email', campo: u => u.email },
      { titulo: 'Rol', campo: u => u.rol },
      { titulo: 'Estado', campo: u => u.activo ? 'Activo' : 'Inactivo' },
    ], 'Usuarios')
    showNotification('Exportado correctamente', 'success')
  }

  const togglePermiso = (modulo, accion) => {
    setPermisosData(prev => ({
      ...prev,
      [modulo]: { ...prev[modulo], [accion]: !prev[modulo][accion] }
    }))
  }

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Usuarios</h1>
          <p className="text-gray-500">Gestiona usuarios y permisos del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="Download" onClick={handleExport}>Exportar</Button>
          <Button icon="Plus" onClick={() => handleOpenModal()}>Nuevo Usuario</Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-4 flex items-center gap-3">
        <Icon name="Search" className="w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Buscar por nombre o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 outline-none text-sm" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Icon name="Users" /></div>
          <div><p className="text-xl font-bold">{usuarios.length}</p><p className="text-sm text-gray-500">Total</p></div>
        </div>
        <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center"><Icon name="CheckCircle" /></div>
          <div><p className="text-xl font-bold">{usuarios.filter(u => u.activo).length}</p><p className="text-sm text-gray-500">Activos</p></div>
        </div>
        <div className="bg-white rounded-2xl border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center"><Icon name="AlertCircle" /></div>
          <div><p className="text-xl font-bold">{usuarios.filter(u => !u.activo).length}</p><p className="text-sm text-gray-500">Inactivos</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="px-4 py-12 text-center text-gray-500">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Cargando...
              </td></tr>
            ) : filteredUsuarios.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-12 text-center text-gray-500">
                <Icon name="Users" className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                No hay usuarios
              </td></tr>
            ) : filteredUsuarios.map(u => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center font-semibold text-xs">{getInitials(u.nombre)}</div>
                    <span className="font-medium">{u.nombre}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 text-sm">{u.email}</td>
                <td className="px-4 py-3 text-gray-600 text-sm">{u.rol}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenModal(u)} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200" title="Editar"><Icon name="Edit2" /></button>
                    <button onClick={() => handleOpenPermisosModal(u)} className="p-1.5 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200" title="Permisos"><Icon name="Shield" /></button>
                    <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200" title="Eliminar"><Icon name="Trash2" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Usuario */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'} footer={
        <>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button onClick={handleSave} loading={saving}>Guardar</Button>
        </>
      }>
        <div className="space-y-4">
          <Input label="Nombre completo" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} placeholder="Ej: Juan Pérez" required />
          <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="correo@ejemplo.com" required />
          <Select label="Rol" value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})} options={roles} required />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="activo" checked={formData.activo} onChange={e => setFormData({...formData, activo: e.target.checked})} className="w-4 h-4 rounded" />
            <label htmlFor="activo" className="text-sm text-gray-700">Usuario activo</label>
          </div>
        </div>
      </Modal>

      {/* Modal Permisos */}
      <Modal isOpen={showPermisosModal} onClose={() => setShowPermisosModal(false)} title={`Permisos: ${editingUser?.nombre}`} size="lg" footer={
        <>
          <Button variant="secondary" onClick={() => setShowPermisosModal(false)}>Cancelar</Button>
          <Button onClick={handleSavePermisos} loading={saving}>Guardar Permisos</Button>
        </>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left font-semibold">Módulo</th>
                <th className="py-2 text-center font-semibold">Ver</th>
                <th className="py-2 text-center font-semibold">Crear</th>
                <th className="py-2 text-center font-semibold">Editar</th>
                <th className="py-2 text-center font-semibold">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(permisosData).map(modulo => (
                <tr key={modulo} className="border-b">
                  <td className="py-3 capitalize font-medium">{modulo}</td>
                  {['ver', 'crear', 'editar', 'eliminar'].map(accion => (
                    <td key={accion} className="py-3 text-center">
                      <input type="checkbox" checked={permisosData[modulo]?.[accion] || false} onChange={() => togglePermiso(modulo, accion)} className="w-4 h-4 rounded cursor-pointer" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  )
}

export default UsuariosPage
