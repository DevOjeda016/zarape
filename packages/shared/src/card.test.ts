import { describe, expect, it } from 'vitest';
import { cardBrand, cardDigits, cardError, isCardExpired, passesLuhn, TEST_CARDS } from './card.js';

const NOW = new Date(2026, 10, 16); // 16 nov 2026
const card = { number: '4242 4242 4242 4242', holderName: 'John Doe', expMonth: 12, expYear: 28, cvv: '123' };

describe('tarjeta del simulador', () => {
  it('quita espacios y guiones', () => {
    expect(cardDigits('4242-4242 4242 4242')).toBe('4242424242424242');
  });

  it('Luhn: acepta las tarjetas de prueba y rechaza números mal escritos', () => {
    for (const number of Object.values(TEST_CARDS)) expect(passesLuhn(number)).toBe(true);
    expect(passesLuhn('4242424242424241')).toBe(false);
    expect(passesLuhn('1234')).toBe(false);
    expect(passesLuhn('4242a24242424242')).toBe(false);
  });

  it('reconoce la marca', () => {
    expect(cardBrand('4242424242424242')).toBe('VISA');
    expect(cardBrand('5555555555554444')).toBe('MASTERCARD');
    expect(cardBrand('2223003122003222')).toBe('MASTERCARD');
    expect(cardBrand('378282246310005')).toBe('AMEX');
    expect(cardBrand('6011111111111117')).toBe('OTHER');
  });

  it('vence al terminar su mes; acepta año de 2 o 4 dígitos', () => {
    expect(isCardExpired(11, 26, NOW)).toBe(false);
    expect(isCardExpired(10, 26, NOW)).toBe(true);
    expect(isCardExpired(1, 2027, NOW)).toBe(false);
    expect(isCardExpired(12, 2025, NOW)).toBe(true);
  });

  it('tarjeta completa y válida: sin error', () => {
    expect(cardError(card, NOW)).toBeNull();
  });

  it('dice qué dato está mal', () => {
    expect(cardError({ ...card, number: '4242 4242 4242 4241' }, NOW)).toBe('Revisa el número de la tarjeta.');
    expect(cardError({ ...card, holderName: ' ' }, NOW)).toBe('Escribe el nombre del titular.');
    expect(cardError({ ...card, expMonth: 13 }, NOW)).toBe('Revisa el mes de vencimiento.');
    expect(cardError({ ...card, expYear: 25 }, NOW)).toBe('La tarjeta está vencida.');
    expect(cardError({ ...card, cvv: '12' }, NOW)).toBe('El CVV lleva 3 dígitos.');
    expect(cardError({ ...card, number: '378282246310005', cvv: '123' }, NOW)).toBe('El CVV lleva 4 dígitos.');
  });
});
