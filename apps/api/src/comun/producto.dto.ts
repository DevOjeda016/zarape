import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, MaxLength } from 'class-validator';
import { Estatus } from '../generated/prisma/enums.js';
import { ConsultaConEstatus, Recortar } from './consulta.js';
import { CampoFoto } from './foto.js';

/** Precio en MXN con IVA incluido, dos decimales. */
export const CampoPrecio = () =>
  applyDecorators(
    ApiProperty({ example: 95, description: 'MXN con IVA incluido.' }),
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio lleva máximo dos decimales.' }),
    IsPositive({ message: 'El precio debe ser mayor a cero.' }),
    Max(99_999.99, { message: 'El precio es demasiado alto.' }),
  );

/** Campos comunes de alimento (RF04) y bebida (RF05). Todos obligatorios. */
export class CrearProductoDto {
  @ApiProperty({ example: 'Chilaquiles rojos con pollo' })
  @Recortar()
  @IsString()
  @IsNotEmpty({ message: 'Escribe el nombre.' })
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'Totopos bañados en salsa roja, pollo deshebrado, crema, queso y cebolla.' })
  @Recortar()
  @IsString()
  @IsNotEmpty({ message: 'Escribe la descripción.' })
  @MaxLength(500)
  descripcion: string;

  @CampoFoto('/fotos/muestra/platillo.svg')
  fotoUrl: string;

  @CampoPrecio()
  precio: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'Elige una categoría.' })
  @IsPositive({ message: 'Elige una categoría.' })
  categoriaId: number;
}

export class ActualizarProductoDto extends PartialType(CrearProductoDto) {
  @ApiPropertyOptional({ enum: Estatus })
  @IsOptional()
  @IsEnum(Estatus)
  estatus?: Estatus;
}

/** RDF0404 / RDF0504: por nombre, precio (rango) o categoría. */
export class ConsultaProductosDto extends ConsultaConEstatus {
  @ApiPropertyOptional({ description: 'Parte del nombre.' })
  @IsOptional()
  @Recortar()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ description: 'Precio mínimo (incluido).' })
  @IsOptional()
  @Recortar()
  @Type(() => Number)
  @IsNumber()
  precioMin?: number;

  @ApiPropertyOptional({ description: 'Precio máximo (incluido).' })
  @IsOptional()
  @Recortar()
  @Type(() => Number)
  @IsNumber()
  precioMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Recortar()
  @Type(() => Number)
  @IsInt()
  categoriaId?: number;
}

export class CategoriaResumenDto {
  @ApiProperty() id: number;
  @ApiProperty() nombre: string;
}

export class ProductoDto {
  @ApiProperty() id: number;
  @ApiProperty() nombre: string;
  @ApiProperty() descripcion: string;
  @ApiProperty() fotoUrl: string;
  @ApiProperty() precio: number;
  @ApiProperty() categoriaId: number;
  @ApiProperty({ type: CategoriaResumenDto }) categoria: CategoriaResumenDto;
  @ApiProperty({ enum: Estatus }) estatus: Estatus;
}

/** Filtro de Prisma para la consulta de alimentos o bebidas. */
export function filtroProductos(consulta: ConsultaProductosDto) {
  return {
    nombre: consulta.nombre ? { contains: consulta.nombre, mode: 'insensitive' as const } : undefined,
    precio:
      consulta.precioMin !== undefined || consulta.precioMax !== undefined
        ? { gte: consulta.precioMin, lte: consulta.precioMax }
        : undefined,
    categoriaId: consulta.categoriaId,
    estatus: consulta.estatus,
  };
}

export const CAMPOS_PRODUCTO = {
  id: true,
  nombre: true,
  descripcion: true,
  fotoUrl: true,
  precio: true,
  categoriaId: true,
  estatus: true,
  categoria: { select: { id: true, nombre: true } },
} as const;
