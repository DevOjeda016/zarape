import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import type { LoginResponseDto } from './dto.js';
import type { EmployeeSession } from './session.js';

/** Mismo mensaje para usuario inexistente, dado de baja o contraseña mal: no revela cuál falló. */
export const INVALID_CREDENTIALS = 'Usuario o contraseña incorrectos.';

/** Hash de relleno: se compara aunque el usuario no exista, así tarda lo mismo. */
const DUMMY_HASH = bcrypt.hashSync('dummy-unused', 10);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** RF01: login de empleado. Solo empleados ACTIVE. */
  async login(username: string, password: string): Promise<LoginResponseDto> {
    const employee = await this.prisma.employee.findUnique({ where: { username: username.trim() } });
    const matches = await bcrypt.compare(password, employee?.passwordHash ?? DUMMY_HASH);
    if (!employee || !matches || employee.status !== 'ACTIVE') {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    const session: EmployeeSession = {
      sub: employee.id,
      username: employee.username,
      role: employee.role,
      kind: 'EMPLOYEE',
    };
    return {
      token: await this.jwt.signAsync(session),
      employee: { id: employee.id, username: employee.username, role: employee.role },
    };
  }
}
