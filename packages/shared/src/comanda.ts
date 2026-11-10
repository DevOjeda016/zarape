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
export const TASA_IVA = 0.16;

/** Lo mínimo que necesita una línea para calcularse. */
export interface LineaParaCalcular {
  /** Piezas; entero mayor o igual a 1. */
  cantidad: number;
  /** Precio unitario en MXN con IVA incluido, máximo dos decimales. */
  precioUnitario: number;
}

export interface DesgloseIva {
  subtotal: number;
  iva: number;
  total: number;
}

export type LineaCalculada<T extends LineaParaCalcular> = T & { totalLinea: number };

export interface ComandaCalculada<T extends LineaParaCalcular> extends DesgloseIva {
  lineas: LineaCalculada<T>[];
}

function aCentavos(pesos: number): number {
  return Math.round(pesos * 100);
}

function aPesos(centavos: number): number {
  return centavos / 100;
}

function validarLinea(linea: LineaParaCalcular): void {
  if (!Number.isInteger(linea.cantidad) || linea.cantidad < 1) {
    throw new RangeError(`Cantidad inválida: ${linea.cantidad}. Debe ser un entero mayor o igual a 1.`);
  }
  if (!Number.isFinite(linea.precioUnitario) || linea.precioUnitario < 0) {
    throw new RangeError(`Precio unitario inválido: ${linea.precioUnitario}.`);
  }
}

function desglosarCentavos(totalCentavos: number): DesgloseIva {
  // total * 100 / 116 en enteros: equivale a total / 1.16 sin el error de representar 1.16.
  const subtotalCentavos = Math.round((totalCentavos * 100) / 116);
  return {
    subtotal: aPesos(subtotalCentavos),
    iva: aPesos(totalCentavos - subtotalCentavos),
    total: aPesos(totalCentavos),
  };
}

/** Desglosa un total con IVA incluido en subtotal e IVA. */
export function desglosarIva(total: number): DesgloseIva {
  if (!Number.isFinite(total) || total < 0) {
    throw new RangeError(`Total inválido: ${total}.`);
  }
  return desglosarCentavos(aCentavos(total));
}

/** Total de una línea: precio unitario × cantidad, a dos decimales. */
export function calcularTotalLinea(linea: LineaParaCalcular): number {
  validarLinea(linea);
  return aPesos(aCentavos(linea.precioUnitario) * linea.cantidad);
}

/**
 * Calcula el ticket completo: total por línea, subtotal, IVA y total a pagar.
 * Conserva los demás campos de cada línea (id, nombre, tipo…).
 */
export function calcularComanda<T extends LineaParaCalcular>(lineas: readonly T[]): ComandaCalculada<T> {
  let totalCentavos = 0;
  const calculadas = lineas.map((linea) => {
    validarLinea(linea);
    const totalLineaCentavos = aCentavos(linea.precioUnitario) * linea.cantidad;
    totalCentavos += totalLineaCentavos;
    return { ...linea, totalLinea: aPesos(totalLineaCentavos) };
  });

  return { lineas: calculadas, ...desglosarCentavos(totalCentavos) };
}
