import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getEvento } from '../api'

export default function EventoDetalle() {
  const { id = '' } = useParams()
  const ev = useQuery({ queryKey: ['evento', id], queryFn: () => getEvento(id), enabled: !!id })

  if (ev.isLoading) return <div className="text-slate-500">Cargando…</div>
  if (ev.isError || !ev.data) return <div className="text-rechazada">Error cargando evento.</div>

  const e = ev.data
  const resultadoStyle: Record<string, string> = {
    CONFORME: 'bg-conforme text-white',
    OBSERVACIONES: 'bg-observaciones text-white',
    RECHAZADA: 'bg-rechazada text-white',
  }

  return (
    <div className="space-y-6">
      <Link to="/eventos" className="text-sm text-blue-600 hover:underline">
        ← volver a eventos
      </Link>

      <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Evento #{e.id.slice(0, 8)}</h2>
            <p className="text-sm text-slate-500">
              Patente <span className="font-mono">{e.patente_detectada ?? '—'}</span> · zona{' '}
              {e.zona_carga ?? '—'} · inicio{' '}
              {e.inicio ? new Date(e.inicio).toLocaleString('es-CL') : '—'}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded text-sm font-semibold ${
              resultadoStyle[e.resultado ?? ''] ?? 'bg-slate-300'
            }`}
          >
            {e.resultado ?? e.estado}
          </span>
        </div>
      </section>

      {e.conciliaciones && e.conciliaciones.length > 0 && (
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold mb-3">Conciliación</h3>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2 text-right">Declarado</th>
                <th className="px-3 py-2 text-right">Detectado</th>
                <th className="px-3 py-2 text-right">Diferencia</th>
                <th className="px-3 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {e.conciliaciones.map((c) => (
                <tr key={c.sku} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-mono">{c.sku}</td>
                  <td className="px-3 py-2 text-right">{c.declarado}</td>
                  <td className="px-3 py-2 text-right">{c.detectado}</td>
                  <td className="px-3 py-2 text-right">{c.diferencia}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        c.estado === 'OK' ? 'bg-conforme text-white' : 'bg-rechazada text-white'
                      }`}
                    >
                      {c.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {e.alertas && e.alertas.length > 0 && (
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold mb-3">Alertas</h3>
          <ul className="space-y-2">
            {e.alertas.map((a, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded mt-0.5 ${
                    a.severidad === 'ERROR' || a.severidad === 'CRITICAL'
                      ? 'bg-rechazada text-white'
                      : 'bg-observaciones text-white'
                  }`}
                >
                  {a.severidad}
                </span>
                <span>{a.mensaje}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
