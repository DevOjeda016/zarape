import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { Status } from '../generated/prisma/enums.js';

/** Quita espacios y convierte "" en undefined, para que un filtro vacío no filtre. */
export const Trim = () =>
  Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  });

/** Filtro de estatus común a todos los catálogos. Sin filtro se muestran todos. */
export class StatusQuery {
  @ApiPropertyOptional({ enum: Status, description: 'Sin valor: todos los registros.' })
  @IsOptional()
  @Trim()
  @IsEnum(Status)
  status?: Status;
}

/** Búsqueda de texto sin distinguir mayúsculas. */
export function containsText(text: string | undefined) {
  return text ? { contains: text, mode: 'insensitive' as const } : undefined;
}
