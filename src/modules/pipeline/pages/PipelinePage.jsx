import { useState, useEffect } from 'react'
import { getTratos } from '@services/dataService'
import { etapas } from '@/data/mockData'
import { useApp } from '@context/AppContext'
import { Button, Icon } from '@components/ui'

const PipelinePage = () => {
  const { showNotification } = useApp()
  const [tratos, setTratos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTratos()
  }, [])

  const fetchTratos = async () => {
    setLoading(true)
    const { data, error } = await getTratos()
    if (error) showNotification('Error al cargar tratos', 'error')
    else setTratos(data || [])
    setLoading(false)
  }

  const tratosPorEtapa = (etapaId) => tratos.filter(t => t.etapa_actual === etapaId)

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-800 mb-1">Pipeline de Tratos</h1>
          <p className="text-gray-500">Gestiona el flujo de tus tratos</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon="Download">Exportar</Button>
          <Button icon="Plus" style={{ backgroundColor: '#F59E0B' }}>Nuevo Trato</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {etapas.map((etapa) => (
            <div key={etapa.id} className="min-w-[300px] max-w-[300px] bg-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: etapa.color }}></div>
                  <h3 className="font-semibold text-gray-800">{etapa.nombre}</h3>
                </div>
                <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: etapa.color + '20', color: etapa.color }}>
                  {tratosPorEtapa(etapa.id).length}
                </span>
              </div>
              <div className="space-y-3 min-h-[200px]">
                {tratosPorEtapa(etapa.id).length === 0 ? (
                  <p className="text-center text-gray-400 py-10 text-sm">Sin tratos</p>
                ) : (
                  tratosPorEtapa(etapa.id).map((trato) => (
                    <div key={trato.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">{trato.titulo}</h4>
                      <p className="text-xs text-gray-500 mb-2">{trato.nombre_completo}</p>
                      {trato.fecha_vencimiento && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Icon name="Clock" className="w-3 h-3" />
                          <span>{new Date(trato.fecha_vencimiento).toLocaleDateString('es-CL')}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PipelinePage
