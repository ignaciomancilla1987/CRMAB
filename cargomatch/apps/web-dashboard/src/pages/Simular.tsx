import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getDte, simularDespacho, Evento } from '../api'

/**
 * Pantalla que emula al edge Jetson: permite ajustar cuántas unidades se
 * "detectaron" de cada ítem del DTE + un peso neto opcional, dispara el
 * matching y muestra el resultado con conciliación y alertas.
 */
export default function Simular() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const dte = useQuery({ queryKey: ['dte', id], queryFn: () => getDte(id), enabled: !!id })

  const [detectados, setDetectados] = useState<Record<string, number>>({})
  const [pesoNeto, setPesoNeto] = useState<string>('')
  const [resultado, setResultado] = useState<Evento | null>(null)

  useEffect(() => {
    if (!dte.data) return
    const init: Record<string, number> = {}
    for (const it of dte.data.items) {
      const key = (it.sku ?? it.descripcion).toUpperCase()
      init[key] = it.cantidad
    }
    setDetectados(init)
  }, [dte.data])

  const simular = useMutation({
    mutationFn: () =>
      simularDespacho({
        dte_id: id,
        detectados,
        peso_neto_kg: pesoNeto ? Number(pesoNeto) : undefined,
      }),
    onSuccess: (data) => setResultado(data),
  })

  if (!dte.data) return <div className="text-slate-500">Cargando DTE…</div>

  const resultadoStyle: Record<string, string> = {
    CONFORME: 'bg-conforme text-white',
    OBSERVACIONES: 'bg-observaciones text-white',
    RECHAZADA: 'bg-rechazada text-white',
  }

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">
          ← volver
        </button>
      </div>

      <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {dte.data.tipo_dte === 52 ? 'Guía de despacho' : 'Factura'} #{dte.data.folio}
            </h2>
            <p className="text-sm text-slate-500">
              {dte.data.razon_social_receptor ?? dte.data.rut_receptor} · patente{' '}
              <span className="font-mono">{dte.data.patente_declarada ?? '—'}</span>
            </p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-100">{dte.data.estado}</span>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="font-semibold mb-2">Simular detecciones del edge</h3>
        <p className="text-sm text-slate-500 mb-4">
          Ajusta la cantidad "detectada" por la cámara para cada ítem. Agrega SKUs no declarados
          para simular material no documentado.
        </p>
        <div className="space-y-2">
          {dte.data.items.map((it) => {
            const key = (it.sku ?? it.descripcion).toUpperCase()
            return (
              <div key={it.linea} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-2 text-xs text-slate-500 font-mono">{it.sku ?? '—'}</div>
                <div className="col-span-5 text-sm">{it.descripcion}</div>
                <div className="col-span-2 text-sm text-slate-500 text-right">
                  declarado: <span className="font-semibold">{it.cantidad}</span> {it.unidad_medida}
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    step="0.001"
                    value={detectados[key] ?? 0}
                    onChange={(e) =>
                      setDetectados((p) => ({ ...p, [key]: Number(e.target.value) }))
                    }
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 grid grid-cols-12 gap-3 items-center">
          <label className="col-span-3 text-sm text-slate-600">
            Peso neto báscula (kg, opcional)
          </label>
          <div className="col-span-3">
            <input
              type="number"
              step="0.1"
              value={pesoNeto}
              onChange={(e) => setPesoNeto(e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="ej: 1000"
            />
          </div>
          <div className="col-span-6 text-right">
            <button
              onClick={() => simular.mutate()}
              disabled={simular.isPending}
              className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-700 disabled:opacity-50"
            >
              {simular.isPending ? 'Procesando…' : 'Ejecutar simulación'}
            </button>
          </div>
        </div>
      </section>

      {resultado && (
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Resultado</h3>
            <span
              className={`px-3 py-1 rounded text-sm font-semibold ${
                resultadoStyle[resultado.resultado ?? ''] ?? 'bg-slate-300'
              }`}
            >
              {resultado.resultado}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-slate-600 mt-4 mb-2">Conciliación</h4>
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
              {resultado.conciliaciones?.map((c) => (
                <tr key={c.sku} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-mono">{c.sku}</td>
                  <td className="px-3 py-2 text-right">{c.declarado}</td>
                  <td className="px-3 py-2 text-right">{c.detectado}</td>
                  <td className="px-3 py-2 text-right">{c.diferencia}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        c.estado === 'OK'
                          ? 'bg-conforme text-white'
                          : 'bg-rechazada text-white'
                      }`}
                    >
                      {c.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {resultado.alertas && resultado.alertas.length > 0 && (
            <>
              <h4 className="text-sm font-semibold text-slate-600 mt-6 mb-2">Alertas</h4>
              <ul className="space-y-1">
                {resultado.alertas.map((a, i) => (
                  <li key={i} className="text-sm">
                    <span
                      className={`text-xs px-2 py-0.5 rounded mr-2 ${
                        a.severidad === 'ERROR' || a.severidad === 'CRITICAL'
                          ? 'bg-rechazada text-white'
                          : 'bg-observaciones text-white'
                      }`}
                    >
                      {a.severidad}
                    </span>
                    {a.mensaje}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  )
}
