import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listDtes, listEventos } from '../api'

function KpiCard({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${color ?? ''}`}>{value}</div>
    </div>
  )
}

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

export default function Dashboard() {
  const dtes = useQuery({ queryKey: ['dtes'], queryFn: listDtes })
  const eventos = useQuery({ queryKey: ['eventos'], queryFn: listEventos })

  const conformes = eventos.data?.items.filter((e) => e.resultado === 'CONFORME').length ?? 0
  const observaciones = eventos.data?.items.filter((e) => e.resultado === 'OBSERVACIONES').length ?? 0
  const rechazadas = eventos.data?.items.filter((e) => e.resultado === 'RECHAZADA').length ?? 0

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="DTEs ingestados" value={dtes.data?.total ?? '—'} />
        <KpiCard label="Conformes" value={conformes} color="text-conforme" />
        <KpiCard label="Con observaciones" value={observaciones} color="text-observaciones" />
        <KpiCard label="Rechazadas" value={rechazadas} color="text-rechazada" />
      </section>

      <section className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">DTEs pendientes de despacho</h2>
          <Link to="/eventos" className="text-sm text-blue-600 hover:underline">
            Ver eventos →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Folio</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Patente</th>
                <th className="px-6 py-3">Ítems</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {dtes.isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-slate-500">
                    Cargando…
                  </td>
                </tr>
              )}
              {dtes.isError && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-rechazada">
                    Error: {(dtes.error as Error).message}
                  </td>
                </tr>
              )}
              {dtes.data?.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-slate-500 text-center">
                    No hay DTEs aún. Ingresa uno vía{' '}
                    <code className="bg-slate-100 px-1 rounded">POST /api/v1/dte/ingest</code>.
                  </td>
                </tr>
              )}
              {dtes.data?.items.map((d) => (
                <tr key={d.id} className="border-t border-slate-100">
                  <td className="px-6 py-3">{d.tipo_dte === 52 ? 'Guía' : d.tipo_dte === 33 ? 'Factura' : d.tipo_dte}</td>
                  <td className="px-6 py-3 font-mono">{d.folio}</td>
                  <td className="px-6 py-3">{d.razon_social_receptor ?? d.rut_receptor}</td>
                  <td className="px-6 py-3 font-mono">{d.patente_declarada ?? '—'}</td>
                  <td className="px-6 py-3">{d.total_items}</td>
                  <td className="px-6 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100">{d.estado}</span>
                  </td>
                  <td className="px-6 py-3">
                    <Link
                      to={`/simular/${d.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Simular despacho →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Últimos eventos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Inicio</th>
                <th className="px-6 py-3">Patente</th>
                <th className="px-6 py-3">Zona</th>
                <th className="px-6 py-3">Resultado</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {eventos.data?.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-slate-500 text-center">
                    Aún no hay eventos simulados.
                  </td>
                </tr>
              )}
              {eventos.data?.items.slice(0, 10).map((e) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="px-6 py-3">
                    {e.inicio ? new Date(e.inicio).toLocaleString('es-CL') : '—'}
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
      </section>
    </div>
  )
}
