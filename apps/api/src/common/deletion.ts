import { ApiProperty } from '@nestjs/swagger';

/** Qué pasó al pedir eliminar un registro (regla de eliminar de todos los catálogos). */
export type DeletionAction = 'DELETED' | 'DEACTIVATED';

export class DeletionResult {
  @ApiProperty({
    enum: ['DELETED', 'DEACTIVATED'],
    description:
      'DELETED: no tenía registros relacionados y se borró. DEACTIVATED: tiene relacionados y solo pasó a INACTIVE.',
  })
  action: DeletionAction;

  @ApiProperty({ description: 'Mensaje listo para mostrar en la interfaz (español).' })
  message: string;
}

/**
 * Regla de eliminar (docs/arquitectura.md): con cero relacionados se borra; con alguno pasa a INACTIVE.
 * @param related cuántos registros dependen de este
 * @param label cómo se llama el registro en el mensaje ("La sucursal Centro")
 */
export async function deleteOrDeactivate(
  related: number,
  label: string,
  remove: () => Promise<unknown>,
  deactivate: () => Promise<unknown>,
): Promise<DeletionResult> {
  if (related === 0) {
    await remove();
    return { action: 'DELETED', message: `${label} se eliminó.` };
  }
  await deactivate();
  return { action: 'DEACTIVATED', message: `${label} tiene registros relacionados, así que solo se dio de baja.` };
}
