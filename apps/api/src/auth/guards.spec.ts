import { type ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { describe, expect, it } from 'vitest';
import { IS_PUBLIC_KEY, ROLES_KEY } from './decorators.js';
import { JwtGuard } from './jwt.guard.js';
import { RolesGuard } from './roles.guard.js';
import type { EmployeeSession } from './session.js';

const jwt = new JwtService({ secret: 'test-secret' });

function context(request: object, metadata: Record<string, unknown> = {}): [ExecutionContext, Reflector] {
  const handler = () => undefined;
  for (const [key, value] of Object.entries(metadata)) Reflect.defineMetadata(key, value, handler);
  const ctx = {
    getHandler: () => handler,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return [ctx, new Reflector()];
}

const session = (role: EmployeeSession['role']): EmployeeSession => ({ sub: 1, username: 'ana', role, kind: 'EMPLOYEE' });

describe('JwtGuard', () => {
  it('deja pasar rutas @Public() sin token', async () => {
    const [ctx, reflector] = context({ headers: {} }, { [IS_PUBLIC_KEY]: true });
    await expect(new JwtGuard(reflector, jwt).canActivate(ctx)).resolves.toBe(true);
  });

  it('pide token en las demás', async () => {
    const [ctx, reflector] = context({ headers: {} });
    await expect(new JwtGuard(reflector, jwt).canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza un token falso', async () => {
    const [ctx, reflector] = context({ headers: { authorization: 'Bearer not.a.jwt' } });
    await expect(new JwtGuard(reflector, jwt).canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('con token válido pone la sesión en la petición', async () => {
    const request: { headers: object; session?: EmployeeSession } = {
      headers: { authorization: `Bearer ${await jwt.signAsync(session('ADMIN'))}` },
    };
    const [ctx, reflector] = context(request);
    await expect(new JwtGuard(reflector, jwt).canActivate(ctx)).resolves.toBe(true);
    expect(request.session?.role).toBe('ADMIN');
  });
});

describe('RolesGuard', () => {
  it('sin @Roles() deja pasar', () => {
    const [ctx, reflector] = context({ session: session('KITCHEN') });
    expect(new RolesGuard(reflector).canActivate(ctx)).toBe(true);
  });

  it('ADMIN entra a rutas de ADMIN', () => {
    const [ctx, reflector] = context({ session: session('ADMIN') }, { [ROLES_KEY]: ['ADMIN'] });
    expect(new RolesGuard(reflector).canActivate(ctx)).toBe(true);
  });

  it('KITCHEN no entra a los catálogos', () => {
    const [ctx, reflector] = context({ session: session('KITCHEN') }, { [ROLES_KEY]: ['ADMIN'] });
    expect(() => new RolesGuard(reflector).canActivate(ctx)).toThrow(ForbiddenException);
  });
});
