import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listEventos } from '../api'

function resultadoBadge(resultado: string | null) {
  if (!resultado) return <span className="text-slate-400 text-xs">—</span>
  const colors: Record<string, string> = {
    CONFORME: 'bg-conforme text-white',
    OBSERVACIONES: 'bg-observaciones text-white',
    RECHAZADA: 'bg-rechazada text-white',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[resultado] ?? 'bg-slate-300'}`}>
      {resultado}
    </span>
  )
}

export default function Eventos() {
  const eventos = useQuery({ queryKey: ['eventos'], queryFn: listEventos })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold">Eventos de despacho</h2>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-6 py-3">Inicio</th>
            <th className="px-6 py-3">Fin</th>
            <th className="px-6 py-3">Patente</th>
            <th className="px-6 py-3">Zona</th>
            <th className="px-6 py-3">Resultado</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {eventos.isLoading && (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-slate-500">
                Cargando…
              </td>
            </tr>
          )}
          {eventos.data?.items.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-6 text-slate-500 text-center">
                Aún no hay eventos.
              </td>
            </tr>
          )}
          {eventos.data?.items.map((e) => (
            <tr key={e.id} className="border-t border-slate-100">
              <td className="px-6 py-3">
                {e.inicio ? new Date(e.inicio).toLocaleString('es-CL') : '—'}
              </td>
              <td className="px-6 py-3">
                {e.fin ? new Date(e.fin).toLocaleString('es-CL') : '—'}
              </td>
              <td className="px-6 py-3 font-mono">{e.patente_detectada ?? '—'}</td>
              <td className="px-6 py-3">{e.zona_carga ?? '—'}</td>
              <td className="px-6 py-3">{resultadoBadge(e.resultado)}</td>
              <td className="px-6 py-3">
                <Link to={`/eventos/${e.id}`} className="text-blue-600 hover:underline text-sm">
                  Ver detalle →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
