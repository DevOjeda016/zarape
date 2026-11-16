/**
 * Validación de tarjeta para el simulador de pago (RF12, RF13, RF17).
 *
 * El número completo y el CVV se validan pero **nunca se guardan**: solo titular, marca,
 * últimos 4 y vencimiento. El front usa esto para avisar al capturar; la API vuelve a validar.
 */

export const CardBrand = {
  VISA: 'VISA',
  MASTERCARD: 'MASTERCARD',
  AMEX: 'AMEX',
  OTHER: 'OTHER',
} as const;
export type CardBrand = (typeof CardBrand)[keyof typeof CardBrand];

/** Tarjetas de prueba del simulador. Cualquier otro número válido también se aprueba. */
export const TEST_CARDS = {
  APPROVED: '4242424242424242',
  DECLINED: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
} as const;

export interface CardInput {
  number: string;
  holderName: string;
  expMonth: number;
  /** Año con 2 dígitos (YY) o con 4. */
  expYear: number;
  cvv: string;
}

/** Deja solo los dígitos (quita espacios y guiones). */
export function cardDigits(input: string): string {
  return input.replace(/[\s-]/g, '');
}

/** Algoritmo de Luhn. */
export function passesLuhn(digits: string): boolean {
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export function cardBrand(digits: string): CardBrand {
  if (digits.startsWith('4')) return CardBrand.VISA;
  if (/^3[47]/.test(digits)) return CardBrand.AMEX;
  const prefix2 = Number(digits.slice(0, 2));
  const prefix4 = Number(digits.slice(0, 4));
  if ((prefix2 >= 51 && prefix2 <= 55) || (prefix4 >= 2221 && prefix4 <= 2720)) return CardBrand.MASTERCARD;
  return CardBrand.OTHER;
}

/** Año completo: 26 → 2026. */
export function fullYear(year: number): number {
  return year < 100 ? 2000 + year : year;
}

/** La tarjeta vence al terminar su mes. */
export function isCardExpired(expMonth: number, expYear: number, now: Date = new Date()): boolean {
  const year = fullYear(expYear);
  const currentYear = now.getFullYear();
  return year < currentYear || (year === currentYear && expMonth < now.getMonth() + 1);
}

/** Regresa el mensaje del primer dato inválido, o `null` si la tarjeta se puede cobrar. */
export function cardError(card: CardInput, now: Date = new Date()): string | null {
  const digits = cardDigits(card.number);
  if (!passesLuhn(digits)) return 'Revisa el número de la tarjeta.';
  if (card.holderName.trim().length < 2) return 'Escribe el nombre del titular.';
  if (!Number.isInteger(card.expMonth) || card.expMonth < 1 || card.expMonth > 12) return 'Revisa el mes de vencimiento.';
  if (!Number.isInteger(card.expYear) || card.expYear < 0) return 'Revisa el año de vencimiento.';
  if (isCardExpired(card.expMonth, card.expYear, now)) return 'La tarjeta está vencida.';
  const cvvLength = cardBrand(digits) === CardBrand.AMEX ? 4 : 3;
  if (!/^\d+$/.test(card.cvv) || card.cvv.length !== cvvLength) return `El CVV lleva ${cvvLength} dígitos.`;
  return null;
}
