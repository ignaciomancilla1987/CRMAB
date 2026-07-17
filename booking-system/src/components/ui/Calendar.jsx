import { useState } from 'react'
import {
  addMonths, getMonthMatrix, isPast, isSameDay, nombreMes, DIAS_CORTOS,
} from '@/utils/date'
import { MAX_DIAS_FUTURO } from '@/data/constants'

/**
 * Calendario mensual. Deshabilita días pasados, fines de semana no
 * permitidos se controlan luego con los slots (aquí solo bloquea el pasado
 * y el rango máximo). Al hacer clic dispara onSelect(date).
 */
export function Calendar({ selected, onSelect }) {
  const [mes, setMes] = useState(() => new Date())

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const limite = new Date(hoy)
  limite.setDate(limite.getDate() + MAX_DIAS_FUTURO)

  const semanas = getMonthMatrix(mes)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      {/* Encabezado con navegación */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMes(addMonths(mes, -1))}
          className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100"
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <span className="text-sm font-semibold capitalize text-slate-700">
          {nombreMes(mes)}
        </span>
        <button
          type="button"
          onClick={() => setMes(addMonths(mes, 1))}
          className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100"
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      {/* Cabecera de días */}
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
        {DIAS_CORTOS.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Grilla */}
      <div className="grid grid-cols-7 gap-1">
        {semanas.flat().map((dia, i) => {
          const fueraMes = dia.getMonth() !== mes.getMonth()
          const deshabilitado = isPast(dia) || dia > limite
          const activo = selected && isSameDay(dia, selected)
          const esHoy = isSameDay(dia, hoy)

          return (
            <button
              key={i}
              type="button"
              disabled={deshabilitado}
              onClick={() => onSelect(dia)}
              className={[
                'aspect-square rounded-lg text-sm transition',
                fueraMes ? 'text-slate-300' : 'text-slate-700',
                deshabilitado
                  ? 'cursor-not-allowed text-slate-300 line-through'
                  : 'hover:bg-brand-50 hover:text-brand-800',
                activo ? '!bg-brand-700 !text-white font-semibold shadow' : '',
                esHoy && !activo ? 'ring-1 ring-brand-300' : '',
              ].join(' ')}
            >
              {dia.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar
