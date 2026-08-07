import Button from '@/components/ui/Button'
import { formatLargo } from '@/utils/date'

export function StepConfirmacion({ sucursal, fecha, hora, cliente, onReset }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-3xl">
        ✅
      </div>
      <h2 className="mb-2 text-2xl font-bold text-slate-800">¡Visita confirmada!</h2>
      <p className="mb-6 text-sm text-slate-500">
        Enviamos un correo de confirmación a{' '}
        <span className="font-medium text-slate-700">{cliente.email}</span>.
      </p>

      <div className="mx-auto mb-8 max-w-sm rounded-2xl border border-slate-200 bg-white p-5 text-left text-sm">
        <div className="flex justify-between border-b border-slate-100 py-2">
          <span className="text-slate-500">Ubicación</span>
          <span className="font-medium text-slate-800">{sucursal?.nombre}</span>
        </div>
        <div className="flex justify-between border-b border-slate-100 py-2">
          <span className="text-slate-500">Fecha</span>
          <span className="font-medium capitalize text-slate-800">
            {fecha ? formatLargo(fecha) : ''}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-slate-500">Hora</span>
          <span className="font-medium text-slate-800">{hora} hrs</span>
        </div>
      </div>

      <Button variant="outline" onClick={onReset}>
        Agendar otra visita
      </Button>
    </div>
  )
}

export default StepConfirmacion
