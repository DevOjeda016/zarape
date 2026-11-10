import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';
import { StatusQuery, Trim } from '../common/query.js';
import { Role, Status } from '../generated/prisma/enums.js';

/**
 * RF03 / RDF0301: nombre de usuario y rol. La contraseña no se captura:
 * el sistema la genera (12 caracteres aleatorios) y la muestra una sola vez.
 */
export class CreateEmployeeDto {
  @ApiProperty({ example: 'maria.cocina', description: 'Letras, números, punto, guion y guion bajo.' })
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Escribe el nombre de usuario.' })
  @MaxLength(40)
  @Matches(/^[\w.-]{3,40}$/, { message: 'Usa de 3 a 40 letras, números, punto, guion o guion bajo, sin espacios.' })
  username: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role, { message: 'Elige un rol.' })
  role: Role;

  @ApiPropertyOptional({ nullable: true, description: 'Sucursal donde trabaja; vacío = todas (oficina central).' })
  @IsOptional()
  @ValidateIf((_object, value) => value !== null)
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  branchId?: number | null;
}

/** RDF0303: se modifica todo excepto el ID. La contraseña se cambia regenerándola. */
export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @ApiPropertyOptional({ enum: Status })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}

/** RDF0304: todos o filtrados por nombre de usuario. */
export class EmployeeQueryDto extends StatusQuery {
  @ApiPropertyOptional({ description: 'Parte del nombre de usuario.' })
  @IsOptional()
  @Trim()
  @IsString()
  username?: string;
}

export class BranchSummaryDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
}

export class EmployeeDto {
  @ApiProperty() id: number;
  @ApiProperty() username: string;
  @ApiProperty({ enum: Role }) role: Role;
  @ApiProperty({ nullable: true, type: Number }) branchId: number | null;
  @ApiProperty({ nullable: true, type: BranchSummaryDto }) branch: BranchSummaryDto | null;
  @ApiProperty({ enum: Status }) status: Status;
}

/** Respuesta de alta y de regenerar: única vez que la contraseña viaja en claro. */
export class EmployeeWithPasswordDto extends EmployeeDto {
  @ApiProperty({ description: 'Contraseña aleatoria de 12 caracteres. Se muestra solo esta vez.' })
  password: string;
}
