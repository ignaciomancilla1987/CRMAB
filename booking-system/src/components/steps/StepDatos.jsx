import { useState } from 'react'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { validarCliente } from '@/utils/validators'
import { formatLargo } from '@/utils/date'

function Campo({ label, error, children, requerido }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label} {requerido && <span className="text-red-500">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

const inputCls =
  'w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100'

export function StepDatos({
  sucursal, fecha, hora, cliente, onChange, onConfirm, onBack, enviando, error,
}) {
  const [errores, setErrores] = useState({})

  function submit(e) {
    e.preventDefault()
    const errs = validarCliente(cliente)
    setErrores(errs)
    if (Object.keys(errs).length === 0) onConfirm()
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-3 text-sm text-slate-500 hover:text-brand-700"
        type="button"
      >
        ‹ Cambiar horario
      </button>

      <h2 className="mb-1 text-xl font-bold text-slate-800">Tus datos</h2>

      {/* Resumen de la cita */}
      <div className="mb-6 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900">
        <p className="font-semibold">{sucursal?.nombre}</p>
        <p className="capitalize">{fecha ? formatLargo(fecha) : ''} · {hora} hrs</p>
      </div>

      <form onSubmit={submit} className="grid gap-4">
        <Campo label="Nombre completo" error={errores.nombre} requerido>
          <input
            className={inputCls}
            value={cliente.nombre}
            onChange={(e) => onChange({ nombre: e.target.value })}
            placeholder="Ej: Juan Pérez"
          />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Correo electrónico" error={errores.email} requerido>
            <input
              type="email"
              className={inputCls}
              value={cliente.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="tu@correo.cl"
            />
          </Campo>
          <Campo label="Teléfono" error={errores.telefono} requerido>
            <input
              className={inputCls}
              value={cliente.telefono}
              onChange={(e) => onChange({ telefono: e.target.value })}
              placeholder="+56 9 1234 5678"
            />
          </Campo>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="RUT (opcional)" error={errores.rut}>
            <input
              className={inputCls}
              value={cliente.rut}
              onChange={(e) => onChange({ rut: e.target.value })}
              placeholder="12.345.678-9"
            />
          </Campo>
          <Campo label="Proyecto de interés (opcional)">
            <input
              className={inputCls}
              value={cliente.proyecto}
              onChange={(e) => onChange({ proyecto: e.target.value })}
              placeholder="Ej: Casa 90 m²"
            />
          </Campo>
        </div>

        <Campo label="Mensaje (opcional)">
          <textarea
            rows={3}
            className={inputCls}
            value={cliente.mensaje}
            onChange={(e) => onChange({ mensaje: e.target.value })}
            placeholder="Cuéntanos brevemente qué necesitas…"
          />
        </Campo>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        )}

        <Button type="submit" disabled={enviando} className="w-full">
          {enviando ? <><Spinner className="h-4 w-4" /> Agendando…</> : 'Confirmar visita'}
        </Button>
      </form>
    </div>
  )
}

export default StepDatos
