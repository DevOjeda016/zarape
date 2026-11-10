const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });

/** "$95.00": siempre con $ y dos decimales (voz de la marca). */
export function formatPrice(value: number): string {
  return currency.format(value);
}

const dateTime = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' });

export function formatDateTime(date: Date): string {
  return dateTime.format(date);
}

/** Saludo por horario (como RF16 en el drive thru). */
export function greeting(hour = new Date().getHours()): string {
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
