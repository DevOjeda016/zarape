import { describe, expect, it } from 'vitest';
import { greeting } from './greeting.js';

describe('saludo por horario', () => {
  it('es "Buenos días" de medianoche a las 11:59', () => {
    expect(greeting(0)).toBe('Buenos días');
    expect(greeting(11)).toBe('Buenos días');
  });

  it('es "Buenas tardes" de 12:00 a 18:59', () => {
    expect(greeting(12)).toBe('Buenas tardes');
    expect(greeting(18)).toBe('Buenas tardes');
  });

  it('es "Buenas noches" desde las 19:00', () => {
    expect(greeting(19)).toBe('Buenas noches');
    expect(greeting(23)).toBe('Buenas noches');
  });
});
