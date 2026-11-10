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
import { ConsultaConEstatus, Recortar } from '../comun/consulta.js';
import { CampoFoto } from '../comun/foto.js';
import { CampoPrecio } from '../comun/producto.dto.js';
import { Estatus } from '../generated/prisma/enums.js';

export class ComponenteDto {
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
  cantidad: number;
}

/** RF06: nombre, precio, descripción y varios alimentos y/o bebidas de sus catálogos. */
export class CrearComboDto {
  @ApiProperty({ example: 'Combo Zarape' })
  @Recortar()
  @IsString()
  @IsNotEmpty({ message: 'Escribe el nombre.' })
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'Chilaquiles con pollo, jugo de naranja y café americano.' })
  @Recortar()
  @IsString()
  @IsNotEmpty({ message: 'Escribe la descripción.' })
  @MaxLength(500)
  descripcion: string;

  @CampoFoto('/fotos/muestra/combo.svg')
  fotoUrl: string;

  @CampoPrecio()
  precio: number;

  @ApiProperty({ type: [ComponenteDto] })
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ComponenteDto)
  alimentos: ComponenteDto[];

  @ApiProperty({ type: [ComponenteDto] })
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ComponenteDto)
  bebidas: ComponenteDto[];
}

/** RDF0603: todo excepto el ID. Si llegan `alimentos` o `bebidas`, reemplazan la lista completa. */
export class ActualizarComboDto extends PartialType(CrearComboDto) {
  @ApiPropertyOptional({ enum: Estatus })
  @IsOptional()
  @IsEnum(Estatus)
  estatus?: Estatus;
}

/** RDF0604: por nombre, alimentos o bebidas. */
export class ConsultaCombosDto extends ConsultaConEstatus {
  @ApiPropertyOptional({ description: 'Parte del nombre del combo.' })
  @IsOptional()
  @Recortar()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ description: 'Parte del nombre de un alimento que incluya.' })
  @IsOptional()
  @Recortar()
  @IsString()
  alimento?: string;

  @ApiPropertyOptional({ description: 'Parte del nombre de una bebida que incluya.' })
  @IsOptional()
  @Recortar()
  @IsString()
  bebida?: string;
}

export class ComponenteDetalleDto {
  @ApiProperty() id: number;
  @ApiProperty() nombre: string;
  @ApiProperty() precio: number;
  @ApiProperty() cantidad: number;
  @ApiProperty({ enum: Estatus }) estatus: Estatus;
}

export class ComboDto {
  @ApiProperty() id: number;
  @ApiProperty() nombre: string;
  @ApiProperty() descripcion: string;
  @ApiProperty() fotoUrl: string;
  @ApiProperty() precio: number;
  @ApiProperty({ enum: Estatus }) estatus: Estatus;
  @ApiProperty({ type: [ComponenteDetalleDto] }) alimentos: ComponenteDetalleDto[];
  @ApiProperty({ type: [ComponenteDetalleDto] }) bebidas: ComponenteDetalleDto[];
  @ApiProperty({ description: 'Suma de los componentes a su precio actual.' }) precioPorSeparado: number;
  @ApiProperty({ description: 'precioPorSeparado − precio.' }) ahorro: number;
}
