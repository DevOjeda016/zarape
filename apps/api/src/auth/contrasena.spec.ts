import { describe, expect, it } from 'vitest';
import { generarContrasena, LARGO_CONTRASENA } from './contrasena.js';

describe('generarContrasena (RF03)', () => {
  const muestras = Array.from({ length: 200 }, generarContrasena);

  it('siempre mide 12 caracteres', () => {
    expect(LARGO_CONTRASENA).toBe(12);
    for (const c of muestras) expect(c).toHaveLength(12);
  });

  it('empieza con letra y trae mayúscula, minúscula, número y símbolo * $ _', () => {
    for (const c of muestras) {
      expect(c).toMatch(/^[A-Za-z]/);
      expect(c).toMatch(/[A-Z]/);
      expect(c).toMatch(/[a-z]/);
      expect(c).toMatch(/\d/);
      expect(c).toMatch(/[*$_]/);
      expect(c).toMatch(/^[A-Za-z0-9*$_]+$/);
    }
  });

  it('no usa caracteres que se confunden', () => {
    for (const c of muestras) expect(c).not.toMatch(/[0O1lI]/);
  });

  it('no se repite', () => {
    expect(new Set(muestras).size).toBe(muestras.length);
  });
});
