import { describe, expect, it, vi } from 'vitest';
import { deleteOrDeactivate } from './deletion.js';

describe('deleteOrDeactivate (regla de eliminar)', () => {
  it('sin relacionados borra el registro', async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    const deactivate = vi.fn();
    const result = await deleteOrDeactivate(0, 'La sucursal Centro', remove, deactivate);
    expect(result).toEqual({ action: 'DELETED', message: 'La sucursal Centro se eliminó.' });
    expect(remove).toHaveBeenCalledOnce();
    expect(deactivate).not.toHaveBeenCalled();
  });

  it('con relacionados solo pasa a INACTIVE', async () => {
    const remove = vi.fn();
    const deactivate = vi.fn().mockResolvedValue(undefined);
    const result = await deleteOrDeactivate(3, 'El alimento Molletes', remove, deactivate);
    expect(result.action).toBe('DEACTIVATED');
    expect(result.message).toContain('El alimento Molletes');
    expect(deactivate).toHaveBeenCalledOnce();
    expect(remove).not.toHaveBeenCalled();
  });
});
