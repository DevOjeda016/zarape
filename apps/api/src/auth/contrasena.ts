import { randomInt } from 'node:crypto';

const MAYUSCULAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const MINUSCULAS = 'abcdefghijkmnopqrstuvwxyz';
const NUMEROS = '23456789';
const SIMBOLOS = '*$_';
const TODOS = MAYUSCULAS + MINUSCULAS + NUMEROS + SIMBOLOS;

export const LARGO_CONTRASENA = 12;

/**
 * Contraseña aleatoria de 12 caracteres para empleados (RF03), con `crypto` y no con Math.random.
 * Empieza con letra y trae mayúscula, minúscula, número y uno de `* $ _`, igual que la regla del
 * cliente (RF17). Sin caracteres que se confunden al dictarla (0 y O, 1, l e I).
 */
export function generarContrasena(): string {
  const elegir = (juego: string) => juego[randomInt(juego.length)]!;
  const resto = [elegir(MINUSCULAS), elegir(NUMEROS), elegir(SIMBOLOS)];
  while (resto.length < LARGO_CONTRASENA - 1) resto.push(elegir(TODOS));

  // Fisher-Yates para que las posiciones fijas no sean predecibles
  for (let i = resto.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [resto[i], resto[j]] = [resto[j]!, resto[i]!];
  }
  return elegir(MAYUSCULAS) + resto.join('');
}
