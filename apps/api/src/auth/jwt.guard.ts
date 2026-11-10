import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { CLAVE_PUBLICO } from './decoradores.js';
import type { SesionEmpleado } from './sesion.js';

/** Guard global: toda ruta exige un JWT válido salvo las marcadas con @Publico(). */
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const publico = this.reflector.getAllAndOverride<boolean>(CLAVE_PUBLICO, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (publico) return true;

    const peticion = contexto.switchToHttp().getRequest<Request & { sesion?: SesionEmpleado }>();
    const [esquema, token] = peticion.headers.authorization?.split(' ') ?? [];
    if (esquema !== 'Bearer' || !token) throw new UnauthorizedException('Inicia sesión para continuar.');

    try {
      peticion.sesion = await this.jwt.verifyAsync<SesionEmpleado>(token);
    } catch {
      throw new UnauthorizedException('Tu sesión expiró. Vuelve a entrar.');
    }
    return true;
  }
}
