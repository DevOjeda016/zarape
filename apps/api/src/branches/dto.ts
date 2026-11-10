import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { PhotoField } from '../common/photo.js';
import { StatusQuery, Trim } from '../common/query.js';
import { Status } from '../generated/prisma/enums.js';

/** RF02 / RDF0201: todos los campos son obligatorios. */
export class CreateBranchDto {
  @ApiProperty({ example: 'Centro' })
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Escribe el nombre.' })
  @MaxLength(80)
  name: string;

  @ApiProperty({ example: 'Calle Madero 120, Zona Centro, León, Gto.' })
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Escribe la dirección.' })
  @MaxLength(200)
  address: string;

  @ApiProperty({ example: 21.122_1 })
  @Type(() => Number)
  @IsLatitude({ message: 'La latitud va de -90 a 90.' })
  latitude: number;

  @ApiProperty({ example: -101.684_2 })
  @Type(() => Number)
  @IsLongitude({ message: 'La longitud va de -180 a 180.' })
  longitude: number;

  @PhotoField('/photos/samples/branch.svg')
  photoUrl: string;

  @ApiProperty({ example: 'https://elzarape.example/sucursales/centro' })
  @Trim()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: 'Escribe una URL completa (https://…).' })
  @MaxLength(300)
  url: string;

  @ApiProperty({ example: 'Lunes a domingo, 7:00 a 15:00' })
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Escribe los horarios.' })
  @MaxLength(200)
  hours: string;
}

/** RDF0203: se modifica todo excepto el ID (también el estatus, para reactivar). */
export class UpdateBranchDto extends PartialType(CreateBranchDto) {
  @ApiPropertyOptional({ enum: Status })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}

/** RDF0204: todos, o filtrados por nombre o por ubicación (texto de la dirección). */
export class BranchQueryDto extends StatusQuery {
  @ApiPropertyOptional({ description: 'Parte del nombre.' })
  @IsOptional()
  @Trim()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Parte de la dirección: calle, colonia o ciudad.' })
  @IsOptional()
  @Trim()
  @IsString()
  location?: string;
}

export class BranchDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() address: string;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
  @ApiProperty() photoUrl: string;
  @ApiProperty() url: string;
  @ApiProperty() hours: string;
  @ApiProperty({ enum: Status }) status: Status;
}
