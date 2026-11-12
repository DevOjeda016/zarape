const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });

/** "$95.00": siempre con $ y dos decimales (voz de la marca). */
export function formatPrice(value: number): string {
  return currency.format(value);
}

const dateTime = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' });

export function formatDateTime(date: Date): string {
  return dateTime.format(date);
}

