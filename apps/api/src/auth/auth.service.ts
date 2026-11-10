import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import type { RespuestaLoginDto } from './dto.js';
import type { SesionEmpleado } from './sesion.js';

/** Mismo mensaje para usuario inexistente, dado de baja o contraseña mal: no revela cuál falló. */
export const CREDENCIALES_INVALIDAS = 'Usuario o contraseña incorrectos.';

/** Hash de relleno: se compara aunque el usuario no exista, así tarda lo mismo. */
const HASH_RELLENO = bcrypt.hashSync('relleno-sin-uso', 10);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** RF01: login de empleado. Solo usuarios ACTIVO. */
  async login(nombreUsuario: string, contrasena: string): Promise<RespuestaLoginDto> {
    const usuario = await this.prisma.usuario.findUnique({ where: { nombreUsuario: nombreUsuario.trim() } });
    const coincide = await bcrypt.compare(contrasena, usuario?.passwordHash ?? HASH_RELLENO);
    if (!usuario || !coincide || usuario.estatus !== 'ACTIVO') {
      throw new UnauthorizedException(CREDENCIALES_INVALIDAS);
    }

    const sesion: SesionEmpleado = {
      sub: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      rol: usuario.rol,
      tipo: 'EMPLEADO',
    };
    return {
      token: await this.jwt.signAsync(sesion),
      usuario: { id: usuario.id, nombreUsuario: usuario.nombreUsuario, rol: usuario.rol },
    };
  }
}
