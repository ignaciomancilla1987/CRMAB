// Constantes de UI del asistente de reservas.

export const PASOS = [
  { id: 1, titulo: 'Ubicación' },
  { id: 2, titulo: 'Fecha' },
  { id: 3, titulo: 'Hora' },
  { id: 4, titulo: 'Tus datos' },
  { id: 5, titulo: 'Confirmación' },
]

// Íconos por tipo de sucursal (emoji para no depender de librerías externas).
export const ICONO_TIPO = {
  fabrica: '🏭',
  oficina: '🏢',
}

// Cuántos días hacia adelante se permite agendar.
export const MAX_DIAS_FUTURO = 60
