import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, MaxLength } from 'class-validator';
import { Status } from '../generated/prisma/enums.js';
import { PhotoField } from './photo.js';
import { StatusQuery, Trim } from './query.js';

/** Precio en MXN con IVA incluido, dos decimales. */
export const PriceField = () =>
  applyDecorators(
    ApiProperty({ example: 95, description: 'MXN con IVA incluido.' }),
    Type(() => Number),
    IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio lleva máximo dos decimales.' }),
    IsPositive({ message: 'El precio debe ser mayor a cero.' }),
    Max(99_999.99, { message: 'El precio es demasiado alto.' }),
  );

/** Campos comunes de alimento (RF04) y bebida (RF05). Todos obligatorios. */
export class CreateProductDto {
  @ApiProperty({ example: 'Chilaquiles rojos con pollo' })
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Escribe el nombre.' })
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Totopos bañados en salsa roja, pollo deshebrado, crema, queso y cebolla.' })
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Escribe la descripción.' })
  @MaxLength(500)
  description: string;

  @PhotoField('/photos/samples/dish.svg')
  photoUrl: string;

  @PriceField()
  price: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'Elige una categoría.' })
  @IsPositive({ message: 'Elige una categoría.' })
  categoryId: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({ enum: Status })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}

/** RDF0404 / RDF0504: por nombre, precio (rango) o categoría. */
export class ProductQueryDto extends StatusQuery {
  @ApiPropertyOptional({ description: 'Parte del nombre.' })
  @IsOptional()
  @Trim()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Precio mínimo (incluido).' })
  @IsOptional()
  @Trim()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Precio máximo (incluido).' })
  @IsOptional()
  @Trim()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Trim()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}

export class CategorySummaryDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
}

export class ProductDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() description: string;
  @ApiProperty() photoUrl: string;
  @ApiProperty() price: number;
  @ApiProperty() categoryId: number;
  @ApiProperty({ type: CategorySummaryDto }) category: CategorySummaryDto;
  @ApiProperty({ enum: Status }) status: Status;
}

/** Filtro de Prisma para la consulta de alimentos o bebidas. */
export function productWhere(query: ProductQueryDto) {
  return {
    name: query.name ? { contains: query.name, mode: 'insensitive' as const } : undefined,
    price:
      query.minPrice !== undefined || query.maxPrice !== undefined
        ? { gte: query.minPrice, lte: query.maxPrice }
        : undefined,
    categoryId: query.categoryId,
    status: query.status,
  };
}

export const PRODUCT_SELECT = {
  id: true,
  name: true,
  description: true,
  photoUrl: true,
  price: true,
  categoryId: true,
  status: true,
  category: { select: { id: true, name: true } },
} as const;
