import { randomUUID } from 'node:crypto';
import { type CardBrand, cardBrand, cardDigits, type CardInput, fullYear, TEST_CARDS } from '@zarape/shared';

/** Lo único de la tarjeta que se guarda (RF13): nunca el número completo ni el CVV. */
export interface SimulatedPayment {
  status: 'APPROVED' | 'DECLINED';
  /** Mensaje para el comensal cuando el pago no pasa. */
  message: string | null;
  holderName: string;
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  reference: string;
}

const DECLINED: Record<string, string> = {
  [TEST_CARDS.DECLINED]: 'El banco rechazó la tarjeta. Prueba con otra.',
  [TEST_CARDS.INSUFFICIENT_FUNDS]: 'La tarjeta no tiene fondos suficientes.',
};

/**
 * Simulador de pago en línea (RF12). La tarjeta ya llegó validada (`cardError`).
 * Los números de la lista se rechazan; cualquier otro se aprueba.
 */
export function simulatePayment(card: CardInput): SimulatedPayment {
  const digits = cardDigits(card.number);
  const message = DECLINED[digits] ?? null;
  return {
    status: message ? 'DECLINED' : 'APPROVED',
    message,
    holderName: card.holderName.trim(),
    brand: cardBrand(digits),
    last4: digits.slice(-4),
    expMonth: card.expMonth,
    expYear: fullYear(card.expYear),
    reference: `SIM-${randomUUID().slice(0, 8).toUpperCase()}`,
  };
}
