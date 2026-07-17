// Utilidades de fecha en zona horaria local (America/Santiago en el navegador
// del usuario). Se trabaja con objetos Date "a medianoche local" para evitar
// desfases de UTC al construir el calendario.

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/** Date → 'YYYY-MM-DD' usando componentes locales (no UTC). */
export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Compara solo la parte de fecha (ignora hora). */
export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isPast(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1)
}

/**
 * Devuelve la matriz de semanas (6x7) para pintar el mes.
 * La semana empieza en Lunes.
 */
export function getMonthMatrix(monthDate) {
  const first = startOfMonth(monthDate)
  // getDay(): 0=Dom..6=Sab → convertir a Lun=0..Dom=6
  const offset = (first.getDay() + 6) % 7
  const start = new Date(first)
  start.setDate(first.getDate() - offset)

  const weeks = []
  const cursor = new Date(start)
  for (let w = 0; w < 6; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

export function formatLargo(date) {
  return `${DIAS[date.getDay()]} ${date.getDate()} de ${MESES[date.getMonth()]} de ${date.getFullYear()}`
}

export function nombreMes(date) {
  return `${MESES[date.getMonth()]} ${date.getFullYear()}`
}

export const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
