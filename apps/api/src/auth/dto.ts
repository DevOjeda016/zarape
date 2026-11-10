import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Rol } from '../generated/prisma/enums.js';

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty({ message: 'Escribe tu usuario.' })
  @MaxLength(60)
  nombreUsuario: string;

  @ApiProperty({ example: 'Ab3*cdEf9_gH' })
  @IsString()
  @IsNotEmpty({ message: 'Escribe tu contraseña.' })
  @MaxLength(100)
  contrasena: string;
}

export class EmpleadoSesionDto {
  @ApiProperty() id: number;
  @ApiProperty() nombreUsuario: string;
  @ApiProperty({ enum: Rol }) rol: Rol;
}

export class RespuestaLoginDto {
  @ApiProperty({ description: 'JWT para el encabezado Authorization: Bearer.' })
  token: string;

  @ApiProperty({ type: EmpleadoSesionDto })
  usuario: EmpleadoSesionDto;
}
