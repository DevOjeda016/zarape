import { describe, expect, it, vi } from 'vitest';
import { eliminarOBaja } from './eliminacion.js';

describe('eliminarOBaja (regla de eliminar)', () => {
  it('sin relacionados borra el registro', async () => {
    const borrar = vi.fn().mockResolvedValue(undefined);
    const baja = vi.fn();
    const resultado = await eliminarOBaja(0, 'La sucursal Centro', borrar, baja);
    expect(resultado).toEqual({ accion: 'ELIMINADO', mensaje: 'La sucursal Centro se eliminó.' });
    expect(borrar).toHaveBeenCalledOnce();
    expect(baja).not.toHaveBeenCalled();
  });

  it('con relacionados solo cambia el estatus a BAJA', async () => {
    const borrar = vi.fn();
    const baja = vi.fn().mockResolvedValue(undefined);
    const resultado = await eliminarOBaja(3, 'El alimento Molletes', borrar, baja);
    expect(resultado.accion).toBe('BAJA');
    expect(resultado.mensaje).toContain('El alimento Molletes');
    expect(baja).toHaveBeenCalledOnce();
    expect(borrar).not.toHaveBeenCalled();
  });
});
