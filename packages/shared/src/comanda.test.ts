import { describe, expect, it } from 'vitest';
import { type ComandaLine, comandaReducer, MAX_QUANTITY } from './comanda.js';

const chilaquiles = { type: 'FOOD', productId: 1, name: 'Chilaquiles', unitPrice: 95 } as const;
const cafe = { type: 'DRINK', productId: 1, name: 'Café', unitPrice: 35 } as const;

describe('comanda', () => {
  it('agregar: línea nueva con 1; si ya está, suma 1', () => {
    let lines = comandaReducer([], { type: 'add', product: chilaquiles });
    lines = comandaReducer(lines, { type: 'add', product: cafe });
    lines = comandaReducer(lines, { type: 'add', product: chilaquiles });
    expect(lines).toEqual([
      { ...chilaquiles, quantity: 2 },
      { ...cafe, quantity: 1 },
    ]);
  });

  it('alimento y bebida con el mismo ID son líneas distintas', () => {
    const lines = comandaReducer([{ ...chilaquiles, quantity: 1 }], { type: 'add', product: cafe });
    expect(lines).toHaveLength(2);
  });

  it('cantidad +/−: no baja de 1 ni pasa del máximo', () => {
    const one: ComandaLine[] = [{ ...chilaquiles, quantity: 1 }];
    expect(comandaReducer(one, { type: 'decrease', line: chilaquiles })[0]?.quantity).toBe(1);
    expect(comandaReducer(one, { type: 'increase', line: chilaquiles })[0]?.quantity).toBe(2);
    const full: ComandaLine[] = [{ ...chilaquiles, quantity: MAX_QUANTITY }];
    expect(comandaReducer(full, { type: 'increase', line: chilaquiles })[0]?.quantity).toBe(MAX_QUANTITY);
  });

  it('eliminar quita solo esa línea; vaciar quita todo', () => {
    const lines: ComandaLine[] = [
      { ...chilaquiles, quantity: 2 },
      { ...cafe, quantity: 1 },
    ];
    expect(comandaReducer(lines, { type: 'remove', line: chilaquiles })).toEqual([{ ...cafe, quantity: 1 }]);
    expect(comandaReducer(lines, { type: 'clear' })).toEqual([]);
  });
});
