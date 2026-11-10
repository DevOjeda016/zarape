import { describe, expect, it } from 'vitest';
import { EstatusComanda, TRANSICIONES_COMANDA, puedeCambiarEstatus } from './estatus.js';

describe('flujo de la comanda', () => {
  it('sigue el camino PENDIENTE → PAGADA → EN_COCINA → LISTA → ENTREGADA', () => {
    expect(puedeCambiarEstatus('PENDIENTE', 'PAGADA')).toBe(true);
    expect(puedeCambiarEstatus('PAGADA', 'EN_COCINA')).toBe(true);
    expect(puedeCambiarEstatus('EN_COCINA', 'LISTA')).toBe(true);
    expect(puedeCambiarEstatus('LISTA', 'ENTREGADA')).toBe(true);
  });

  it('solo se cancela desde PENDIENTE o PAGADA', () => {
    const cancelables = Object.values(EstatusComanda).filter((e) => puedeCambiarEstatus(e, 'CANCELADA'));
    expect(cancelables).toEqual(['PENDIENTE', 'PAGADA']);
  });

  it('no permite saltar ni regresar pasos', () => {
    expect(puedeCambiarEstatus('PENDIENTE', 'LISTA')).toBe(false);
    expect(puedeCambiarEstatus('LISTA', 'EN_COCINA')).toBe(false);
    expect(puedeCambiarEstatus('ENTREGADA', 'PAGADA')).toBe(false);
  });

  it('ENTREGADA y CANCELADA son estados finales', () => {
    expect(TRANSICIONES_COMANDA.ENTREGADA).toEqual([]);
    expect(TRANSICIONES_COMANDA.CANCELADA).toEqual([]);
  });

  it('cada estatus tiene sus transiciones definidas', () => {
    expect(Object.keys(TRANSICIONES_COMANDA).sort()).toEqual(Object.values(EstatusComanda).sort());
  });
});
