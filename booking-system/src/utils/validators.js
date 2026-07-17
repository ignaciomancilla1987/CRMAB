// Validaciones del formulario del cliente.

export function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
}

export function esTelefonoValido(tel) {
  // Acepta +56 9 XXXX XXXX y variantes; exige al menos 8 dígitos.
  const digitos = String(tel).replace(/\D/g, '')
  return digitos.length >= 8
}

/** Valida RUT chileno con dígito verificador (opcional). */
export function esRutValido(rut) {
  if (!rut) return true // el RUT es opcional
  const limpio = String(rut).replace(/[.\-\s]/g, '').toUpperCase()
  if (limpio.length < 2) return false
  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  if (!/^\d+$/.test(cuerpo)) return false

  let suma = 0
  let mul = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const resto = 11 - (suma % 11)
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto)
  return dv === dvEsperado
}

/** Devuelve un objeto de errores { campo: mensaje }. */
export function validarCliente(cliente) {
  const errores = {}
  if (!cliente.nombre?.trim()) errores.nombre = 'Ingresa tu nombre'
  if (!esEmailValido(cliente.email)) errores.email = 'Correo no válido'
  if (!esTelefonoValido(cliente.telefono)) errores.telefono = 'Teléfono no válido'
  if (!esRutValido(cliente.rut)) errores.rut = 'RUT no válido'
  return errores
}
