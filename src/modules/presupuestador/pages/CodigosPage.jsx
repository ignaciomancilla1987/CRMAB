import { useState, useEffect } from 'react'
import { supabase } from '@services/supabase'
import { useApp } from '@context/AppContext'
import { Button, Icon } from '@components/ui'

const CodigosPage = () => {
  const { showNotification } = useApp()
  const [codigos, setCodigos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCodigos()
  }, [])

  const fetchCodigos = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('codigos_servicio').select('*').order('codigo')
    if (error) showNotification('Error al cargar códigos', 'error')
    else setCodigos(data || [])
    setLoading(false)
  }

  const filteredCodigos = codigos.filter(c =>
    c.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (v) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(v || 0)

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-800 mb-1">Códigos de Servicio</h1>
          <p className="text-gray-500">Catálogo de servicios y precios</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon="Download">Exportar</Button>
          <Button icon="Plus" style={{ backgroundColor: '#8B5CF6' }}>Nuevo Código</Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-3 mb-6 flex items-center gap-3">
        <Icon name="Search" className="w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Buscar código o descripción..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 outline-none text-sm" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Código</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Descripción</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Precio</th>
              <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="px-5 py-16 text-center text-gray-500">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>Cargando...
              </td></tr>
            ) : filteredCodigos.length === 0 ? (
              <tr><td colSpan="4" className="px-5 py-16 text-center text-gray-500">
                <Icon name="Hash" className="w-12 h-12 mx-auto mb-3 text-gray-300" />No hay códigos
              </td></tr>
            ) : filteredCodigos.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-4"><span className="font-mono font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">{c.codigo}</span></td>
                <td className="px-5 py-4 text-gray-600">{c.descripcion}</td>
                <td className="px-5 py-4 font-semibold">{formatCurrency(c.precio)}</td>
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

export default CodigosPage
