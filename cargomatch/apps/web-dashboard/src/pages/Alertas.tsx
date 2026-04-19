import { useQuery } from '@tanstack/react-query'
import { api } from '../api'

type Alerta = {
  id: string
  evento_id: string
  tipo: string
  severidad: string
  mensaje: string
  acknowledged: boolean
  creado_en: string
}

async function listAlertas(): Promise<{ items: Alerta[]; total: number }> {
  const { data } = await api.get('/alertas')
  return data
}

export default function Alertas() {
  const q = useQuery({ queryKey: ['alertas'], queryFn: listAlertas })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Alertas</h2>
        <span className="text-sm text-slate-500">{q.data?.total ?? 0} alertas</span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-6 py-3">Fecha</th>
            <th className="px-6 py-3">Tipo</th>
            <th className="px-6 py-3">Severidad</th>
            <th className="px-6 py-3">Mensaje</th>
            <th className="px-6 py-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          {q.data?.items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-6 text-slate-500 text-center">
                Sin alertas.
              </td>
            </tr>
          )}
          {q.data?.items.map((a) => (
            <tr key={a.id} className="border-t border-slate-100">
              <td className="px-6 py-3">{new Date(a.creado_en).toLocaleString('es-CL')}</td>
              <td className="px-6 py-3 font-mono text-xs">{a.tipo}</td>
              <td className="px-6 py-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    a.severidad === 'ERROR' || a.severidad === 'CRITICAL'
                      ? 'bg-rechazada text-white'
                      : 'bg-observaciones text-white'
                  }`}
                >
                  {a.severidad}
                </span>
              </td>
              <td className="px-6 py-3">{a.mensaje}</td>
              <td className="px-6 py-3 text-xs text-slate-500">
                {a.acknowledged ? 'reconocida' : 'pendiente'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
