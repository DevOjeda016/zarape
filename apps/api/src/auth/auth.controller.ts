import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { Publico, SesionActual } from './decoradores.js';
import { EmpleadoSesionDto, LoginDto, RespuestaLoginDto } from './dto.js';
import type { SesionEmpleado } from './sesion.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Publico()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login de empleado (RF01)' })
  @ApiOkResponse({ type: RespuestaLoginDto })
  @ApiUnauthorizedResponse({ description: 'Usuario o contraseña incorrectos.' })
  login(@Body() dto: LoginDto): Promise<RespuestaLoginDto> {
    return this.auth.login(dto.nombreUsuario, dto.contrasena);
  }

  @Get('yo')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Empleado de la sesión actual' })
  @ApiOkResponse({ type: EmpleadoSesionDto })
  yo(@SesionActual() sesion: SesionEmpleado): EmpleadoSesionDto {
    return { id: sesion.sub, nombreUsuario: sesion.nombreUsuario, rol: sesion.rol };
  }
}
