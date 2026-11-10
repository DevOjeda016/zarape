import { ApiProperty } from '@nestjs/swagger';

/** Qué pasó al pedir eliminar un registro (regla de eliminar de todos los catálogos). */
export type AccionEliminacion = 'ELIMINADO' | 'BAJA';

export class ResultadoEliminacion {
  @ApiProperty({
    enum: ['ELIMINADO', 'BAJA'],
    description: 'ELIMINADO: no tenía registros relacionados y se borró. BAJA: tiene relacionados y solo cambió su estatus.',
  })
  accion: AccionEliminacion;

  @ApiProperty({ description: 'Mensaje listo para mostrar en la interfaz.' })
  mensaje: string;
}

/**
 * Regla de eliminar (docs/arquitectura.md): con cero relacionados se borra; con alguno pasa a BAJA.
 * @param relacionados cuántos registros dependen de este
 * @param nombre cómo se llama el registro en el mensaje ("La sucursal Centro")
 */
export async function eliminarOBaja(
  relacionados: number,
  nombre: string,
  borrar: () => Promise<unknown>,
  darDeBaja: () => Promise<unknown>,
): Promise<ResultadoEliminacion> {
  if (relacionados === 0) {
    await borrar();
    return { accion: 'ELIMINADO', mensaje: `${nombre} se eliminó.` };
  }
  await darDeBaja();
  return {
    accion: 'BAJA',
    mensaje: `${nombre} tiene registros relacionados, así que solo se dio de baja.`,
  };
}
