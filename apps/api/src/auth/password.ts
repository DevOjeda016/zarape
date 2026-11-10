import { randomInt } from 'node:crypto';

const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '*$_';
const ALL = UPPERCASE + LOWERCASE + DIGITS + SYMBOLS;

export const PASSWORD_LENGTH = 12;

/**
 * Contraseña aleatoria de 12 caracteres para empleados (RF03), con `crypto` y no con Math.random.
 * Empieza con letra y trae mayúscula, minúscula, número y uno de `* $ _`, igual que la regla del
 * cliente (RF17). Sin caracteres que se confunden al dictarla (0 y O, 1, l e I).
 */
export function generatePassword(): string {
  const pick = (set: string) => set[randomInt(set.length)]!;
  const rest = [pick(LOWERCASE), pick(DIGITS), pick(SYMBOLS)];
  while (rest.length < PASSWORD_LENGTH - 1) rest.push(pick(ALL));

  // Fisher-Yates para que las posiciones fijas no sean predecibles
  for (let i = rest.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [rest[i], rest[j]] = [rest[j]!, rest[i]!];
  }
  return pick(UPPERCASE) + rest.join('');
}
