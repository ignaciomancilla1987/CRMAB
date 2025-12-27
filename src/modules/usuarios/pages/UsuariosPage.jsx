import { useState, useEffect } from 'react'
import { getUsuarios } from '@services/dataService'
import { useApp } from '@context/AppContext'
import { useAuth } from '@context/AuthContext'
import { Button, Icon } from '@components/ui'

const UsuariosPage = () => {
  const { showNotification } = useApp()
  const { userProfile } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    setLoading(true)
    const { data, error } = await getUsuarios()

    if (error) {
      showNotification('Error al cargar usuarios', 'error')
    } else {
      setUsuarios(data || [])
    }
    setLoading(false)
  }

  const filteredUsuarios = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (user) => {
    setEditingUser(user)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-800 mb-1">Usuarios</h1>
          <p className="text-gray-500">Gestiona usuarios y permisos del sistema</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon="Download">
            Exportar
          </Button>
          <Button icon="Plus" onClick={() => setShowModal(true)}>
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-3 mb-6 flex items-center gap-3">
        <Icon name="Search" className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 outline-none text-sm"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Icon name="Users" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{usuarios.length}</p>
            <p className="text-sm text-gray-500">Total Usuarios</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-success-100 text-success-600 flex items-center justify-center">
            <Icon name="CheckCircle" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {usuarios.filter(u => u.activo).length}
            </p>
            <p className="text-sm text-gray-500">Activos</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-danger-100 text-danger-600 flex items-center justify-center">
            <Icon name="AlertCircle" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {usuarios.filter(u => !u.activo).length}
            </p>
            <p className="text-sm text-gray-500">Inactivos</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-5 py-16 text-center text-gray-500">
                  <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  Cargando usuarios...
                </td>
              </tr>
            ) : filteredUsuarios.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-5 py-16 text-center text-gray-500">
                  <Icon name="Users" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filteredUsuarios.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
                        {getInitials(user.nombre)}
                      </div>
                      <span className="font-medium text-gray-800">{user.nombre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{user.email}</td>
                  <td className="px-5 py-4 text-gray-600">{user.rol}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium ${
                      user.activo
                        ? 'bg-success-100 text-success-700'
                        : 'bg-danger-100 text-danger-700'
                    }`}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        <Icon name="Edit2" className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200">
                        <Icon name="Shield" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UsuariosPage
