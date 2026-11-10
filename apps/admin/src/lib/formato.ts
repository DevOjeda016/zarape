const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });

/** "$95.00": siempre con $ y dos decimales (voz de la marca). */
export function formatoPrecio(valor: number): string {
  return moneda.format(valor);
}

const fechaHora = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' });

export function formatoFechaHora(fecha: Date): string {
  return fechaHora.format(fecha);
}

/** Saludo por horario (como RF16 en el drive thru). */
export function saludo(hora = new Date().getHours()): string {
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
