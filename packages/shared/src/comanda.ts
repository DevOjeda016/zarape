/**
 * Comanda que arma el comensal antes de pagar (RF09): agregar, cantidad +/−, eliminar.
 * Es un reducer puro para `useReducer`; los totales salen de `calculateOrder`.
 */
import type { ProductType } from './status.js';

export interface ComandaLine {
  type: ProductType;
  productId: number;
  name: string;
  /** MXN con IVA incluido. Solo para mostrar: la API cobra con el precio de la BD. */
  unitPrice: number;
  quantity: number;
}

export type ComandaProduct = Omit<ComandaLine, 'quantity'>;
type LineRef = Pick<ComandaLine, 'type' | 'productId'>;

export type ComandaAction =
  | { type: 'add'; product: ComandaProduct }
  | { type: 'increase' | 'decrease' | 'remove'; line: LineRef }
  | { type: 'clear' };

/** Máximo de piezas por línea (el mismo que valida la API). */
export const MAX_QUANTITY = 99;

export function lineKey(line: LineRef): string {
  return `${line.type}:${line.productId}`;
}

function changeQuantity(lines: ComandaLine[], ref: LineRef, delta: number): ComandaLine[] {
  const key = lineKey(ref);
  return lines.map((line) => {
    if (lineKey(line) !== key) return line;
    const quantity = Math.min(MAX_QUANTITY, Math.max(1, line.quantity + delta));
    return quantity === line.quantity ? line : { ...line, quantity };
  });
}

export function comandaReducer(lines: ComandaLine[], action: ComandaAction): ComandaLine[] {
  switch (action.type) {
    case 'add': {
      const exists = lines.some((line) => lineKey(line) === lineKey(action.product));
      return exists ? changeQuantity(lines, action.product, 1) : [...lines, { ...action.product, quantity: 1 }];
    }
    case 'increase':
      return changeQuantity(lines, action.line, 1);
    case 'decrease':
      // En 1 se queda: para quitar la línea está "eliminar"
      return changeQuantity(lines, action.line, -1);
    case 'remove':
      return lines.filter((line) => lineKey(line) !== lineKey(action.line));
    case 'clear':
      return [];
  }
}
