import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { ConsultaConEstatus, Recortar } from '../comun/consulta.js';
import { CampoFoto } from '../comun/foto.js';
import { Estatus } from '../generated/prisma/enums.js';

/** RF02 / RDF0201: todos los campos son obligatorios. */
export class CrearSucursalDto {
  @ApiProperty({ example: 'Centro' })
  @Recortar()
  @IsString()
  @IsNotEmpty({ message: 'Escribe el nombre.' })
  @MaxLength(80)
  nombre: string;

  @ApiProperty({ example: 'Calle Madero 120, Zona Centro, León, Gto.' })
  @Recortar()
  @IsString()
  @IsNotEmpty({ message: 'Escribe la dirección.' })
  @MaxLength(200)
  direccion: string;

  @ApiProperty({ example: 21.122_1 })
  @Type(() => Number)
  @IsLatitude({ message: 'La latitud va de -90 a 90.' })
  latitud: number;

  @ApiProperty({ example: -101.684_2 })
  @Type(() => Number)
  @IsLongitude({ message: 'La longitud va de -180 a 180.' })
  longitud: number;

  @CampoFoto('/fotos/muestra/sucursal.svg')
  fotoUrl: string;

  @ApiProperty({ example: 'https://elzarape.example/sucursales/centro' })
  @Recortar()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: 'Escribe una URL completa (https://…).' })
  @MaxLength(300)
  url: string;

  @ApiProperty({ example: 'Lunes a domingo, 7:00 a 15:00' })
  @Recortar()
  @IsString()
  @IsNotEmpty({ message: 'Escribe los horarios.' })
  @MaxLength(200)
  horarios: string;
}

/** RDF0203: se modifica todo excepto el ID (también el estatus, para reactivar). */
export class ActualizarSucursalDto extends PartialType(CrearSucursalDto) {
  @ApiPropertyOptional({ enum: Estatus })
  @IsOptional()
  @IsEnum(Estatus)
  estatus?: Estatus;
}

/** RDF0204: todos, o filtrados por nombre o por ubicación (texto de la dirección). */
export class ConsultaSucursalesDto extends ConsultaConEstatus {
  @ApiPropertyOptional({ description: 'Parte del nombre.' })
  @IsOptional()
  @Recortar()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ description: 'Parte de la dirección: calle, colonia o ciudad.' })
  @IsOptional()
  @Recortar()
  @IsString()
  ubicacion?: string;
}

export class SucursalDto {
  @ApiProperty() id: number;
  @ApiProperty() nombre: string;
  @ApiProperty() direccion: string;
  @ApiProperty() latitud: number;
  @ApiProperty() longitud: number;
  @ApiProperty() fotoUrl: string;
  @ApiProperty() url: string;
  @ApiProperty() horarios: string;
  @ApiProperty({ enum: Estatus }) estatus: Estatus;
}
