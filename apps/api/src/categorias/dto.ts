import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ConsultaConEstatus, Recortar } from '../comun/consulta.js';
import { Estatus, TipoCategoria } from '../generated/prisma/enums.js';

export class CrearCategoriaDto {
  @ApiProperty({ example: 'Platillos' })
  @Recortar()
  @IsString()
  @IsNotEmpty({ message: 'Escribe el nombre.' })
  @MaxLength(60)
  nombre: string;

  @ApiProperty({ enum: TipoCategoria, description: 'Si agrupa alimentos o bebidas.' })
  @IsEnum(TipoCategoria, { message: 'Elige si es de alimentos o de bebidas.' })
  tipo: TipoCategoria;
}

export class ActualizarCategoriaDto extends PartialType(CrearCategoriaDto) {
  @ApiPropertyOptional({ enum: Estatus })
  @IsOptional()
  @IsEnum(Estatus)
  estatus?: Estatus;
}

export class ConsultaCategoriasDto extends ConsultaConEstatus {
  @ApiPropertyOptional({ enum: TipoCategoria })
  @IsOptional()
  @Recortar()
  @IsEnum(TipoCategoria)
  tipo?: TipoCategoria;

  @ApiPropertyOptional()
  @IsOptional()
  @Recortar()
  @IsString()
  nombre?: string;
}

export class CategoriaDto {
  @ApiProperty() id: number;
  @ApiProperty() nombre: string;
  @ApiProperty({ enum: TipoCategoria }) tipo: TipoCategoria;
  @ApiProperty({ enum: Estatus }) estatus: Estatus;
  @ApiProperty({ description: 'Alimentos o bebidas que la usan.' }) productos: number;
}
