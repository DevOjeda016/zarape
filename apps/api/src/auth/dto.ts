import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Role } from '../generated/prisma/enums.js';

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty({ message: 'Escribe tu usuario.' })
  @MaxLength(60)
  username: string;

  @ApiProperty({ example: 'Ab3*cdEf9_gH' })
  @IsString()
  @IsNotEmpty({ message: 'Escribe tu contraseña.' })
  @MaxLength(100)
  password: string;
}

export class SessionEmployeeDto {
  @ApiProperty() id: number;
  @ApiProperty() username: string;
  @ApiProperty({ enum: Role }) role: Role;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT para el encabezado Authorization: Bearer.' })
  token: string;

  @ApiProperty({ type: SessionEmployeeDto })
  employee: SessionEmployeeDto;
}
