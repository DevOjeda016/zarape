import { describe, expect, it } from 'vitest';
import { calcularComanda, calcularTotalLinea, desglosarIva } from './comanda.js';

describe('desglosarIva', () => {
  it('saca subtotal e IVA de un total con IVA incluido', () => {
    expect(desglosarIva(145)).toEqual({ subtotal: 125, iva: 20, total: 145 });
    expect(desglosarIva(116)).toEqual({ subtotal: 100, iva: 16, total: 116 });
  });

  it('redondea el subtotal a dos decimales y el IVA es la diferencia', () => {
    // 99 / 1.16 = 85.3448…
    expect(desglosarIva(99)).toEqual({ subtotal: 85.34, iva: 13.66, total: 99 });
  });

  it('subtotal = total / 1.16 a dos decimales y subtotal + IVA = total, centavo por centavo', () => {
    for (let centavos = 0; centavos <= 100_000; centavos += 7) {
      const total = centavos / 100;
      const { subtotal, iva } = desglosarIva(total);
      expect(subtotal).toBe(Number((total / 1.16).toFixed(2)));
      expect(Math.round(subtotal * 100) + Math.round(iva * 100)).toBe(centavos);
    }
  });

  it('rechaza totales inválidos', () => {
    expect(() => desglosarIva(-1)).toThrow(RangeError);
    expect(() => desglosarIva(Number.NaN)).toThrow(RangeError);
  });
});

describe('calcularTotalLinea', () => {
  it('multiplica precio por cantidad sin errores de punto flotante', () => {
    expect(calcularTotalLinea({ cantidad: 3, precioUnitario: 19.99 })).toBe(59.97);
    expect(calcularTotalLinea({ cantidad: 3, precioUnitario: 0.1 })).toBe(0.3);
  });

  it('rechaza cantidades que no son enteros positivos', () => {
    expect(() => calcularTotalLinea({ cantidad: 0, precioUnitario: 10 })).toThrow(RangeError);
    expect(() => calcularTotalLinea({ cantidad: -1, precioUnitario: 10 })).toThrow(RangeError);
    expect(() => calcularTotalLinea({ cantidad: 1.5, precioUnitario: 10 })).toThrow(RangeError);
  });

  it('rechaza precios negativos o que no son números', () => {
    expect(() => calcularTotalLinea({ cantidad: 1, precioUnitario: -5 })).toThrow(RangeError);
    expect(() => calcularTotalLinea({ cantidad: 1, precioUnitario: Number.NaN })).toThrow(RangeError);
  });
});

describe('calcularComanda', () => {
  it('una comanda vacía da todo en cero', () => {
    expect(calcularComanda([])).toEqual({ lineas: [], subtotal: 0, iva: 0, total: 0 });
  });

  it('calcula total por línea, total, subtotal e IVA', () => {
    const comanda = calcularComanda([
      { cantidad: 2, precioUnitario: 145 },
      { cantidad: 3, precioUnitario: 38.5 },
    ]);

    expect(comanda.lineas.map((l) => l.totalLinea)).toEqual([290, 115.5]);
    expect(comanda.total).toBe(405.5);
    // 405.50 / 1.16 = 349.5689…
    expect(comanda.subtotal).toBe(349.57);
    expect(comanda.iva).toBe(55.93);
  });

  it('conserva los demás campos de cada línea', () => {
    const comanda = calcularComanda([
      { id: 7, tipo: 'COMBO', nombre: 'Combo chilaquiles', cantidad: 1, precioUnitario: 159 },
    ]);

    expect(comanda.lineas[0]).toEqual({
      id: 7,
      tipo: 'COMBO',
      nombre: 'Combo chilaquiles',
      cantidad: 1,
      precioUnitario: 159,
      totalLinea: 159,
    });
  });

  it('no modifica las líneas que recibe', () => {
    const lineas = [{ cantidad: 1, precioUnitario: 50 }];
    calcularComanda(lineas);
    expect(lineas).toEqual([{ cantidad: 1, precioUnitario: 50 }]);
  });

  it('rechaza la comanda si alguna línea es inválida', () => {
    expect(() =>
      calcularComanda([
        { cantidad: 1, precioUnitario: 50 },
        { cantidad: 0, precioUnitario: 50 },
      ]),
    ).toThrow(RangeError);
  });
});
