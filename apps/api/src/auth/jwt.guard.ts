import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from './decorators.js';
import type { EmployeeSession } from './session.js';

/** Guard global: toda ruta exige un JWT válido salvo las marcadas con @Public(). */
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request & { session?: EmployeeSession }>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException('Inicia sesión para continuar.');

    try {
      request.session = await this.jwt.verifyAsync<EmployeeSession>(token);
    } catch {
      throw new UnauthorizedException('Tu sesión expiró. Vuelve a entrar.');
    }
    return true;
  }
}
