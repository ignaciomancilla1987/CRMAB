import { useEffect, useState } from 'react'
import { bookingService } from '@/services/bookingService'
import { ICONO_TIPO } from '@/data/constants'
import Spinner from '@/components/ui/Spinner'

export function StepSucursal({ onSelect, seleccionada }) {
  const [sucursales, setSucursales] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let vivo = true
    bookingService
      .getSucursales()
      .then((data) => vivo && setSucursales(data))
      .catch(() => vivo && setError('No pudimos cargar las ubicaciones.'))
      .finally(() => vivo && setCargando(false))
    return () => { vivo = false }
  }, [])

  if (cargando) {
    return (
      <div className="flex justify-center py-16 text-brand-700">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return <p className="py-10 text-center text-sm text-red-600">{error}</p>
  }

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-slate-800">
        ¿Dónde deseas realizar la visita?
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        Selecciona la ubicación para ver los horarios disponibles.
      </p>

      <div className="grid gap-3">
        {sucursales.map((s) => {
          const activa = seleccionada?.id === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s)}
              className={[
                'flex items-center gap-4 rounded-2xl border p-4 text-left transition',
                activa
                  ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-100'
                  : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/40',
              ].join(' ')}
            >
              <span className="text-3xl">{ICONO_TIPO[s.tipo] ?? '📍'}</span>
              <span className="flex-1">
                <span className="block font-semibold text-slate-800">{s.nombre}</span>
                {s.direccion && (
                  <span className="block text-xs text-slate-500">
                    {s.direccion}{s.ciudad ? `, ${s.ciudad}` : ''}
                  </span>
                )}
              </span>
              <span className="text-brand-700">›</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default StepSucursal
