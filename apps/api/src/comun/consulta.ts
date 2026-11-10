import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { Estatus } from '../generated/prisma/enums.js';

/** Quita espacios y convierte "" en undefined, para que un filtro vacío no filtre. */
export const Recortar = () =>
  Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    const limpio = value.trim();
    return limpio === '' ? undefined : limpio;
  });

/** Filtro de estatus común a todos los catálogos. Sin filtro se muestran todos. */
export class ConsultaConEstatus {
  @ApiPropertyOptional({ enum: Estatus, description: 'Sin valor: todos los registros.' })
  @IsOptional()
  @Recortar()
  @IsEnum(Estatus)
  estatus?: Estatus;
}

/** Búsqueda de texto sin distinguir mayúsculas. */
export function contiene(texto: string | undefined) {
  return texto ? { contains: texto, mode: 'insensitive' as const } : undefined;
}
