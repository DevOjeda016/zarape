import { describe, expect, it } from 'vitest';
import { calculateLineTotal, calculateOrder, splitTax } from './order.js';

describe('splitTax', () => {
  it('saca subtotal e IVA de un total con IVA incluido', () => {
    expect(splitTax(145)).toEqual({ subtotal: 125, tax: 20, total: 145 });
    expect(splitTax(116)).toEqual({ subtotal: 100, tax: 16, total: 116 });
  });

  it('redondea el subtotal a dos decimales y el IVA es la diferencia', () => {
    // 99 / 1.16 = 85.3448…
    expect(splitTax(99)).toEqual({ subtotal: 85.34, tax: 13.66, total: 99 });
  });

  it('subtotal = total / 1.16 a dos decimales y subtotal + IVA = total, centavo por centavo', () => {
    for (let cents = 0; cents <= 100_000; cents += 7) {
      const total = cents / 100;
      const { subtotal, tax } = splitTax(total);
      expect(subtotal).toBe(Number((total / 1.16).toFixed(2)));
      expect(Math.round(subtotal * 100) + Math.round(tax * 100)).toBe(cents);
    }
  });

  it('rechaza totales inválidos', () => {
    expect(() => splitTax(-1)).toThrow(RangeError);
    expect(() => splitTax(Number.NaN)).toThrow(RangeError);
  });
});

describe('calculateLineTotal', () => {
  it('multiplica precio por cantidad sin errores de punto flotante', () => {
    expect(calculateLineTotal({ quantity: 3, unitPrice: 19.99 })).toBe(59.97);
    expect(calculateLineTotal({ quantity: 3, unitPrice: 0.1 })).toBe(0.3);
  });

  it('rechaza cantidades que no son enteros positivos', () => {
    expect(() => calculateLineTotal({ quantity: 0, unitPrice: 10 })).toThrow(RangeError);
    expect(() => calculateLineTotal({ quantity: -1, unitPrice: 10 })).toThrow(RangeError);
    expect(() => calculateLineTotal({ quantity: 1.5, unitPrice: 10 })).toThrow(RangeError);
  });

  it('rechaza precios negativos o que no son números', () => {
    expect(() => calculateLineTotal({ quantity: 1, unitPrice: -5 })).toThrow(RangeError);
    expect(() => calculateLineTotal({ quantity: 1, unitPrice: Number.NaN })).toThrow(RangeError);
  });
});

describe('calculateOrder', () => {
  it('una comanda vacía da todo en cero', () => {
    expect(calculateOrder([])).toEqual({ lines: [], subtotal: 0, tax: 0, total: 0 });
  });

  it('calcula total por línea, total, subtotal e IVA', () => {
    const order = calculateOrder([
      { quantity: 2, unitPrice: 145 },
      { quantity: 3, unitPrice: 38.5 },
    ]);

    expect(order.lines.map((l) => l.lineTotal)).toEqual([290, 115.5]);
    expect(order.total).toBe(405.5);
    // 405.50 / 1.16 = 349.5689…
    expect(order.subtotal).toBe(349.57);
    expect(order.tax).toBe(55.93);
  });

  it('conserva los demás campos de cada línea', () => {
    const order = calculateOrder([{ id: 7, type: 'COMBO', name: 'Combo chilaquiles', quantity: 1, unitPrice: 159 }]);

    expect(order.lines[0]).toEqual({
      id: 7,
      type: 'COMBO',
      name: 'Combo chilaquiles',
      quantity: 1,
      unitPrice: 159,
      lineTotal: 159,
    });
  });

  it('no modifica las líneas que recibe', () => {
    const lines = [{ quantity: 1, unitPrice: 50 }];
    calculateOrder(lines);
    expect(lines).toEqual([{ quantity: 1, unitPrice: 50 }]);
  });

  it('rechaza la comanda si alguna línea es inválida', () => {
    expect(() =>
      calculateOrder([
        { quantity: 1, unitPrice: 50 },
        { quantity: 0, unitPrice: 50 },
      ]),
    ).toThrow(RangeError);
  });
});
