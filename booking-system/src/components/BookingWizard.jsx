import { useBookingFlow } from '@/hooks/useBookingFlow'
import Stepper from '@/components/Stepper'
import StepSucursal from '@/components/steps/StepSucursal'
import StepFecha from '@/components/steps/StepFecha'
import StepHora from '@/components/steps/StepHora'
import StepDatos from '@/components/steps/StepDatos'
import StepConfirmacion from '@/components/steps/StepConfirmacion'

export function BookingWizard() {
  const f = useBookingFlow()

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-10">
        {f.paso < 5 && <Stepper pasoActual={f.paso} />}

        {f.paso === 1 && (
          <StepSucursal onSelect={f.elegirSucursal} seleccionada={f.sucursal} />
        )}

        {f.paso === 2 && (
          <StepFecha
            sucursal={f.sucursal}
            fecha={f.fecha}
            onSelect={f.elegirFecha}
            onBack={() => f.irA(1)}
            cargando={f.cargandoSlots}
          />
        )}

        {f.paso === 3 && (
          <StepHora
            fecha={f.fecha}
            slots={f.slots}
            horaSeleccionada={f.hora}
            onSelect={f.elegirHora}
            onBack={() => f.irA(2)}
          />
        )}

        {f.paso === 4 && (
          <StepDatos
            sucursal={f.sucursal}
            fecha={f.fecha}
            hora={f.hora}
            cliente={f.cliente}
            onChange={f.actualizarCliente}
            onConfirm={f.confirmar}
            onBack={() => f.irA(3)}
            enviando={f.enviando}
            error={f.error}
          />
        )}

        {f.paso === 5 && (
          <StepConfirmacion
            sucursal={f.sucursal}
            fecha={f.fecha}
            hora={f.hora}
            cliente={f.cliente}
            onReset={f.reiniciar}
          />
        )}
      </div>
    </div>
  )
}

export default BookingWizard
