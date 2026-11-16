import { TEST_CARDS } from '@zarape/shared';
import { describe, expect, it } from 'vitest';
import { simulatePayment } from './simulator.js';

const card = { number: '4242 4242 4242 4242', holderName: ' John Doe ', expMonth: 12, expYear: 28, cvv: '123' };

describe('simulador de pago', () => {
  it('aprueba la tarjeta de prueba y solo regresa lo que se puede guardar', () => {
    const payment = simulatePayment(card);
    expect(payment).toMatchObject({
      status: 'APPROVED',
      message: null,
      holderName: 'John Doe',
      brand: 'VISA',
      last4: '4242',
      expMonth: 12,
      expYear: 2028,
    });
    expect(payment.reference).toMatch(/^SIM-[0-9A-F]{8}$/);
    expect(JSON.stringify(payment)).not.toContain('4242424242424242');
    expect(payment).not.toHaveProperty('cvv');
  });

  it('rechaza las tarjetas de la lista con un mensaje claro', () => {
    expect(simulatePayment({ ...card, number: TEST_CARDS.DECLINED })).toMatchObject({
      status: 'DECLINED',
      message: 'El banco rechazó la tarjeta. Prueba con otra.',
    });
    expect(simulatePayment({ ...card, number: TEST_CARDS.INSUFFICIENT_FUNDS }).status).toBe('DECLINED');
  });
});
