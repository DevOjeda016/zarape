import { describe, expect, it } from 'vitest';
import { canChangeStatus, ORDER_TRANSITIONS, OrderStatus } from './status.js';

describe('flujo de la comanda', () => {
  it('sigue el camino PENDING → PAID → IN_KITCHEN → READY → DELIVERED', () => {
    expect(canChangeStatus('PENDING', 'PAID')).toBe(true);
    expect(canChangeStatus('PAID', 'IN_KITCHEN')).toBe(true);
    expect(canChangeStatus('IN_KITCHEN', 'READY')).toBe(true);
    expect(canChangeStatus('READY', 'DELIVERED')).toBe(true);
  });

  it('solo se cancela desde PENDING o PAID', () => {
    const cancellable = Object.values(OrderStatus).filter((s) => canChangeStatus(s, 'CANCELLED'));
    expect(cancellable).toEqual(['PENDING', 'PAID']);
  });

  it('no permite saltar ni regresar pasos', () => {
    expect(canChangeStatus('PENDING', 'READY')).toBe(false);
    expect(canChangeStatus('READY', 'IN_KITCHEN')).toBe(false);
    expect(canChangeStatus('DELIVERED', 'PAID')).toBe(false);
  });

  it('DELIVERED y CANCELLED son estados finales', () => {
    expect(ORDER_TRANSITIONS.DELIVERED).toEqual([]);
    expect(ORDER_TRANSITIONS.CANCELLED).toEqual([]);
  });

  it('cada estatus tiene sus transiciones definidas', () => {
    expect(Object.keys(ORDER_TRANSITIONS).sort()).toEqual(Object.values(OrderStatus).sort());
  });
});
