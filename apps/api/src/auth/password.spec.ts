import { describe, expect, it } from 'vitest';
import { generatePassword, PASSWORD_LENGTH } from './password.js';

describe('generatePassword (RF03)', () => {
  const samples = Array.from({ length: 200 }, generatePassword);

  it('siempre mide 12 caracteres', () => {
    expect(PASSWORD_LENGTH).toBe(12);
    for (const p of samples) expect(p).toHaveLength(12);
  });

  it('empieza con letra y trae mayúscula, minúscula, número y símbolo * $ _', () => {
    for (const p of samples) {
      expect(p).toMatch(/^[A-Za-z]/);
      expect(p).toMatch(/[A-Z]/);
      expect(p).toMatch(/[a-z]/);
      expect(p).toMatch(/\d/);
      expect(p).toMatch(/[*$_]/);
      expect(p).toMatch(/^[A-Za-z0-9*$_]+$/);
    }
  });

  it('no usa caracteres que se confunden', () => {
    for (const p of samples) expect(p).not.toMatch(/[0O1lI]/);
  });

  it('no se repite', () => {
    expect(new Set(samples).size).toBe(samples.length);
  });
});
