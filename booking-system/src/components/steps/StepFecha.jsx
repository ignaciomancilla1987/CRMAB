import Calendar from '@/components/ui/Calendar'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export function StepFecha({ sucursal, fecha, onSelect, onBack, cargando }) {
  return (
    <div>
      <button
        onClick={onBack}
        className="mb-3 text-sm text-slate-500 hover:text-brand-700"
        type="button"
      >
        ‹ Cambiar ubicación
      </button>

      <h2 className="mb-1 text-xl font-bold text-slate-800">Elige una fecha</h2>
      <p className="mb-6 text-sm text-slate-500">
        Visita en <span className="font-medium text-brand-700">{sucursal?.nombre}</span>.
      </p>

      <Calendar selected={fecha} onSelect={onSelect} />

      {cargando && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-brand-700">
          <Spinner className="h-4 w-4" /> Cargando horarios…
        </div>
      )}
    </div>
  )
}

export default StepFecha
