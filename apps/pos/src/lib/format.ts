const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });

/** "$95.00": siempre con $ y dos decimales (voz de la marca). */
export function formatPrice(value: number): string {
  return currency.format(value);
}

/** Precio en la carta: sin centavos si es cerrado ("$95"). */
export function formatCardPrice(value: number): string {
  return Number.isInteger(value) ? `$${value}` : formatPrice(value);
}

/** Turno con tres dígitos: "042". */
export function formatTicket(ticketNumber: number): string {
  return String(ticketNumber).padStart(3, '0');
}

const dateTime = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' });

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}
