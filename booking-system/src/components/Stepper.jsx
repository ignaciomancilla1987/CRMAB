import { PASOS } from '@/data/constants'

export function Stepper({ pasoActual }) {
  return (
    <ol className="mb-8 flex items-center justify-between gap-1">
      {PASOS.map((p, idx) => {
        const completado = p.id < pasoActual
        const activo = p.id === pasoActual
        return (
          <li key={p.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <span
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition',
                  completado ? 'bg-brand-700 text-white' : '',
                  activo ? 'bg-brand-700 text-white ring-4 ring-brand-100' : '',
                  !completado && !activo ? 'bg-slate-200 text-slate-500' : '',
                ].join(' ')}
              >
                {completado ? '✓' : p.id}
              </span>
              <span
                className={`mt-1 hidden text-[11px] sm:block ${
                  activo ? 'font-semibold text-brand-800' : 'text-slate-400'
                }`}
              >
                {p.titulo}
              </span>
            </div>
            {idx < PASOS.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 rounded ${
                  completado ? 'bg-brand-700' : 'bg-slate-200'
                }`}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default Stepper
