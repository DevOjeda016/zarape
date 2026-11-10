import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { PhotoField } from '../common/photo.js';
import { PriceField } from '../common/product.dto.js';
import { StatusQuery, Trim } from '../common/query.js';
import { Status } from '../generated/prisma/enums.js';

export class ComboItemDto {
  @ApiProperty({ description: 'ID del alimento o de la bebida.' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id: number;

  @ApiProperty({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt({ message: 'La cantidad es un número entero.' })
  @IsPositive({ message: 'La cantidad debe ser 1 o más.' })
  @Max(20)
  quantity: number;
}

/** RF06: nombre, precio, descripción y varios alimentos y/o bebidas de sus catálogos. */
export class CreateComboDto {
  @ApiProperty({ example: 'Combo Zarape' })
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Escribe el nombre.' })
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Chilaquiles con pollo, jugo de naranja y café americano.' })
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Escribe la descripción.' })
  @MaxLength(500)
  description: string;

  @PhotoField('/photos/samples/combo.svg')
  photoUrl: string;

  @PriceField()
  price: number;

  @ApiProperty({ type: [ComboItemDto] })
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ComboItemDto)
  foods: ComboItemDto[];

  @ApiProperty({ type: [ComboItemDto] })
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ComboItemDto)
  drinks: ComboItemDto[];
}

/** RDF0603: todo excepto el ID. Si llegan `foods` o `drinks`, reemplazan la lista completa. */
export class UpdateComboDto extends PartialType(CreateComboDto) {
  @ApiPropertyOptional({ enum: Status })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}

/** RDF0604: por nombre, alimentos o bebidas. */
export class ComboQueryDto extends StatusQuery {
  @ApiPropertyOptional({ description: 'Parte del nombre del combo.' })
  @IsOptional()
  @Trim()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Parte del nombre de un alimento que incluya.' })
  @IsOptional()
  @Trim()
  @IsString()
  food?: string;

  @ApiPropertyOptional({ description: 'Parte del nombre de una bebida que incluya.' })
  @IsOptional()
  @Trim()
  @IsString()
  drink?: string;
}

export class ComboItemDetailDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() price: number;
  @ApiProperty() quantity: number;
  @ApiProperty({ enum: Status }) status: Status;
}

export class ComboDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() description: string;
  @ApiProperty() photoUrl: string;
  @ApiProperty() price: number;
  @ApiProperty({ enum: Status }) status: Status;
  @ApiProperty({ type: [ComboItemDetailDto] }) foods: ComboItemDetailDto[];
  @ApiProperty({ type: [ComboItemDetailDto] }) drinks: ComboItemDetailDto[];
  @ApiProperty({ description: 'Suma de los componentes a su precio actual.' }) separatePrice: number;
  @ApiProperty({ description: 'separatePrice − price.' }) savings: number;
}
