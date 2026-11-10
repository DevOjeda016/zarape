import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { CurrentSession, Public } from './decorators.js';
import { LoginDto, LoginResponseDto, SessionEmployeeDto } from './dto.js';
import type { EmployeeSession } from './session.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login de empleado (RF01)' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Usuario o contraseña incorrectos.' })
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.auth.login(dto.username, dto.password);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Empleado de la sesión actual' })
  @ApiOkResponse({ type: SessionEmployeeDto })
  me(@CurrentSession() session: EmployeeSession): SessionEmployeeDto {
    return { id: session.sub, username: session.username, role: session.role };
  }
}
