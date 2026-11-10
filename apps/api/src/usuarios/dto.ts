import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';
import { ConsultaConEstatus, Recortar } from '../comun/consulta.js';
import { Estatus, Rol } from '../generated/prisma/enums.js';

/**
 * RF03 / RDF0301: nombre de usuario y rol. La contraseña no se captura:
 * el sistema la genera (12 caracteres aleatorios) y la muestra una sola vez.
 */
export class CrearUsuarioDto {
  @ApiProperty({ example: 'maria.cocina', description: 'Letras, números, punto, guion y guion bajo.' })
  @Recortar()
  @IsString()
  @IsNotEmpty({ message: 'Escribe el nombre de usuario.' })
  @MaxLength(40)
  @Matches(/^[\w.-]{3,40}$/, { message: 'Usa de 3 a 40 letras, números, punto, guion o guion bajo, sin espacios.' })
  nombreUsuario: string;

  @ApiProperty({ enum: Rol })
  @IsEnum(Rol, { message: 'Elige un rol.' })
  rol: Rol;

  @ApiPropertyOptional({ nullable: true, description: 'Sucursal donde trabaja; vacío = todas (administración central).' })
  @IsOptional()
  @ValidateIf((_objeto, valor) => valor !== null)
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  sucursalId?: number | null;
}

/** RDF0303: se modifica todo excepto el ID. La contraseña se cambia regenerándola. */
export class ActualizarUsuarioDto extends PartialType(CrearUsuarioDto) {
  @ApiPropertyOptional({ enum: Estatus })
  @IsOptional()
  @IsEnum(Estatus)
  estatus?: Estatus;
}

/** RDF0304: todos o filtrados por nombre de usuario. */
export class ConsultaUsuariosDto extends ConsultaConEstatus {
  @ApiPropertyOptional({ description: 'Parte del nombre de usuario.' })
  @IsOptional()
  @Recortar()
  @IsString()
  nombreUsuario?: string;
}

export class SucursalResumenDto {
  @ApiProperty() id: number;
  @ApiProperty() nombre: string;
}

export class UsuarioDto {
  @ApiProperty() id: number;
  @ApiProperty() nombreUsuario: string;
  @ApiProperty({ enum: Rol }) rol: Rol;
  @ApiProperty({ nullable: true, type: Number }) sucursalId: number | null;
  @ApiProperty({ nullable: true, type: SucursalResumenDto }) sucursal: SucursalResumenDto | null;
  @ApiProperty({ enum: Estatus }) estatus: Estatus;
}

/** Respuesta de alta y de regenerar: única vez que la contraseña viaja en claro. */
export class UsuarioConContrasenaDto extends UsuarioDto {
  @ApiProperty({ description: 'Contraseña aleatoria de 12 caracteres. Se muestra solo esta vez.' })
  contrasena: string;
}
