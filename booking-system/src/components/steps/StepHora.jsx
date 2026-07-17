import { formatLargo } from '@/utils/date'

export function StepHora({ fecha, slots, onSelect, horaSeleccionada, onBack }) {
  return (
    <div>
      <button
        onClick={onBack}
        className="mb-3 text-sm text-slate-500 hover:text-brand-700"
        type="button"
      >
        ‹ Cambiar fecha
      </button>

      <h2 className="mb-1 text-xl font-bold text-slate-800">Elige un horario</h2>
      <p className="mb-6 text-sm capitalize text-slate-500">
        {fecha ? formatLargo(fecha) : ''}
      </p>

      {slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">
            No hay horarios disponibles para este día.
            <br />Selecciona otra fecha.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {slots.map((h) => {
            const activa = horaSeleccionada === h
            return (
              <button
                key={h}
                type="button"
                onClick={() => onSelect(h)}
                className={[
                  'rounded-xl border py-3 text-sm font-semibold transition',
                  activa
                    ? 'border-brand-600 bg-brand-700 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand-400 hover:bg-brand-50',
                ].join(' ')}
              >
                {h}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default StepHora
