import { useCallback, useState } from 'react'
import { bookingService } from '@/services/bookingService'

const CLIENTE_VACIO = {
  nombre: '', email: '', telefono: '', rut: '', proyecto: '', mensaje: '',
}

/**
 * Máquina de estados del asistente de reservas.
 * Centraliza selección, carga de slots y envío.
 */
export function useBookingFlow() {
  const [paso, setPaso] = useState(1)
  const [sucursal, setSucursal] = useState(null)
  const [fecha, setFecha] = useState(null)
  const [hora, setHora] = useState(null)
  const [cliente, setCliente] = useState(CLIENTE_VACIO)

  const [slots, setSlots] = useState([])
  const [cargandoSlots, setCargandoSlots] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [reserva, setReserva] = useState(null)
  const [error, setError] = useState(null)

  const irA = useCallback((n) => setPaso(n), [])
  const siguiente = useCallback(() => setPaso((p) => Math.min(p + 1, 5)), [])
  const anterior = useCallback(() => setPaso((p) => Math.max(p - 1, 1)), [])

  const elegirSucursal = useCallback((s) => {
    setSucursal(s)
    setFecha(null)
    setHora(null)
    setSlots([])
    setPaso(2)
  }, [])

  const elegirFecha = useCallback(async (d) => {
    setFecha(d)
    setHora(null)
    setError(null)
    setCargandoSlots(true)
    try {
      const libres = await bookingService.getSlots(sucursal.id, d)
      setSlots(libres)
      setPaso(3)
    } catch (e) {
      setError('No pudimos cargar los horarios. Intenta nuevamente.')
      setSlots([])
    } finally {
      setCargandoSlots(false)
    }
  }, [sucursal])

  const elegirHora = useCallback((h) => {
    setHora(h)
    setPaso(4)
  }, [])

  const actualizarCliente = useCallback((patch) => {
    setCliente((c) => ({ ...c, ...patch }))
  }, [])

  const confirmar = useCallback(async () => {
    setEnviando(true)
    setError(null)
    try {
      const creada = await bookingService.crearReserva({
        sucursalId: sucursal.id,
        fecha,
        hora,
        cliente,
      })
      setReserva(creada)
      setPaso(5)
      return true
    } catch (e) {
      setError(e.message || 'Ocurrió un error al agendar. Intenta nuevamente.')
      // Si el slot se tomó, vuelve a la selección de hora
      if (e.code === 'SLOT_NO_DISPONIBLE') {
        const libres = await bookingService.getSlots(sucursal.id, fecha).catch(() => [])
        setSlots(libres)
        setHora(null)
        setPaso(3)
      }
      return false
    } finally {
      setEnviando(false)
    }
  }, [sucursal, fecha, hora, cliente])

  const reiniciar = useCallback(() => {
    setPaso(1); setSucursal(null); setFecha(null); setHora(null)
    setCliente(CLIENTE_VACIO); setSlots([]); setReserva(null); setError(null)
  }, [])

  return {
    // estado
    paso, sucursal, fecha, hora, cliente, slots,
    cargandoSlots, enviando, reserva, error,
    // acciones
    irA, siguiente, anterior,
    elegirSucursal, elegirFecha, elegirHora,
    actualizarCliente, confirmar, reiniciar, setError,
  }
}

export default useBookingFlow
