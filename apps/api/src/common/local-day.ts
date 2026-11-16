/** Zona horaria de los restaurantes (León, Gto.). Sin horario de verano: siempre UTC−6. */
export const TIME_ZONE = 'America/Mexico_City';
const UTC_OFFSET = '-06:00';

/** Día local (AAAA-MM-DD) de un instante. */
export function localDayString(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now);
}

/** Día local como fecha para columnas `date` (medianoche UTC del mismo día). */
export function localDay(now: Date = new Date()): Date {
  return new Date(`${localDayString(now)}T00:00:00.000Z`);
}

/**
 * Rango de instantes para buscar por días locales, ambos incluidos.
 * `from` y `to` vienen como AAAA-MM-DD.
 */
export function dayRange(from?: string, to?: string): { gte?: Date; lt?: Date } | undefined {
  if (!from && !to) return undefined;
  const range: { gte?: Date; lt?: Date } = {};
  if (from) range.gte = new Date(`${from}T00:00:00.000${UTC_OFFSET}`);
  if (to) {
    const end = new Date(`${to}T00:00:00.000${UTC_OFFSET}`);
    end.setUTCDate(end.getUTCDate() + 1);
    range.lt = end;
  }
  return range;
}

/** Rango numérico con extremos incluidos; `undefined` si no hay ninguno. */
export function numberRange(min?: number, max?: number): { gte?: number; lte?: number } | undefined {
  return min !== undefined || max !== undefined ? { gte: min, lte: max } : undefined;
}
