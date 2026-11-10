/**
 * Cálculo del ticket de la comanda (RF09, RF10).
 *
 * Los precios del catálogo están en MXN **con IVA incluido**. Del total sale el desglose:
 *   subtotal = total / 1.16
 *   IVA      = total − subtotal
 * Todo a dos decimales. Internamente se trabaja en centavos enteros para no arrastrar
 * errores de punto flotante.
 *
 * El front lo usa para mostrar totales al instante; la API lo usa para recalcular con
 * los precios de la BD (nunca confía en los totales que manda el cliente).
 */

/** Tasa de IVA en México. */
export const TAX_RATE = 0.16;

/** Lo mínimo que necesita una línea para calcularse. */
export interface LineInput {
  /** Piezas; entero mayor o igual a 1. */
  quantity: number;
  /** Precio unitario en MXN con IVA incluido, máximo dos decimales. */
  unitPrice: number;
}

/** Desglose del ticket: subtotal, IVA (`tax`) y total a pagar. */
export interface TaxBreakdown {
  subtotal: number;
  tax: number;
  total: number;
}

export type CalculatedLine<T extends LineInput> = T & { lineTotal: number };

export interface CalculatedOrder<T extends LineInput> extends TaxBreakdown {
  lines: CalculatedLine<T>[];
}

function toCents(pesos: number): number {
  return Math.round(pesos * 100);
}

function toPesos(cents: number): number {
  return cents / 100;
}

function validateLine(line: LineInput): void {
  if (!Number.isInteger(line.quantity) || line.quantity < 1) {
    throw new RangeError(`Cantidad inválida: ${line.quantity}. Debe ser un entero mayor o igual a 1.`);
  }
  if (!Number.isFinite(line.unitPrice) || line.unitPrice < 0) {
    throw new RangeError(`Precio unitario inválido: ${line.unitPrice}.`);
  }
}

function splitCents(totalCents: number): TaxBreakdown {
  // total * 100 / 116 en enteros: equivale a total / 1.16 sin el error de representar 1.16.
  const subtotalCents = Math.round((totalCents * 100) / 116);
  return {
    subtotal: toPesos(subtotalCents),
    tax: toPesos(totalCents - subtotalCents),
    total: toPesos(totalCents),
  };
}

/** Desglosa un total con IVA incluido en subtotal e IVA. */
export function splitTax(total: number): TaxBreakdown {
  if (!Number.isFinite(total) || total < 0) {
    throw new RangeError(`Total inválido: ${total}.`);
  }
  return splitCents(toCents(total));
}

/** Total de una línea: precio unitario × cantidad, a dos decimales. */
export function calculateLineTotal(line: LineInput): number {
  validateLine(line);
  return toPesos(toCents(line.unitPrice) * line.quantity);
}

/**
 * Calcula el ticket completo: total por línea, subtotal, IVA y total a pagar.
 * Conserva los demás campos de cada línea (id, nombre, tipo…).
 */
export function calculateOrder<T extends LineInput>(lines: readonly T[]): CalculatedOrder<T> {
  let totalCents = 0;
  const calculated = lines.map((line) => {
    validateLine(line);
    const lineTotalCents = toCents(line.unitPrice) * line.quantity;
    totalCents += lineTotalCents;
    return { ...line, lineTotal: toPesos(lineTotalCents) };
  });

  return { lines: calculated, ...splitCents(totalCents) };
}
