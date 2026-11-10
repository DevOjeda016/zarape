import { type ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { describe, expect, it } from 'vitest';
import { CLAVE_PUBLICO, CLAVE_ROLES } from './decoradores.js';
import { JwtGuard } from './jwt.guard.js';
import { RolesGuard } from './roles.guard.js';
import type { SesionEmpleado } from './sesion.js';

const jwt = new JwtService({ secret: 'secreto-de-prueba' });

function contexto(peticion: object, metadatos: Record<string, unknown> = {}): [ExecutionContext, Reflector] {
  const handler = () => undefined;
  for (const [clave, valor] of Object.entries(metadatos)) Reflect.defineMetadata(clave, valor, handler);
  const ctx = {
    getHandler: () => handler,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => peticion }),
  } as unknown as ExecutionContext;
  return [ctx, new Reflector()];
}

const sesion = (rol: SesionEmpleado['rol']): SesionEmpleado => ({ sub: 1, nombreUsuario: 'ana', rol, tipo: 'EMPLEADO' });

describe('JwtGuard', () => {
  it('deja pasar rutas @Publico() sin token', async () => {
    const [ctx, reflector] = contexto({ headers: {} }, { [CLAVE_PUBLICO]: true });
    await expect(new JwtGuard(reflector, jwt).canActivate(ctx)).resolves.toBe(true);
  });

  it('pide token en las demás', async () => {
    const [ctx, reflector] = contexto({ headers: {} });
    await expect(new JwtGuard(reflector, jwt).canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rechaza un token falso', async () => {
    const [ctx, reflector] = contexto({ headers: { authorization: 'Bearer no.es.jwt' } });
    await expect(new JwtGuard(reflector, jwt).canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('con token válido pone la sesión en la petición', async () => {
    const peticion: { headers: object; sesion?: SesionEmpleado } = {
      headers: { authorization: `Bearer ${await jwt.signAsync(sesion('ADMIN'))}` },
    };
    const [ctx, reflector] = contexto(peticion);
    await expect(new JwtGuard(reflector, jwt).canActivate(ctx)).resolves.toBe(true);
    expect(peticion.sesion?.rol).toBe('ADMIN');
  });
});

describe('RolesGuard', () => {
  it('sin @Roles() deja pasar', () => {
    const [ctx, reflector] = contexto({ sesion: sesion('COCINA') });
    expect(new RolesGuard(reflector).canActivate(ctx)).toBe(true);
  });

  it('ADMIN entra a rutas de ADMIN', () => {
    const [ctx, reflector] = contexto({ sesion: sesion('ADMIN') }, { [CLAVE_ROLES]: ['ADMIN'] });
    expect(new RolesGuard(reflector).canActivate(ctx)).toBe(true);
  });

  it('COCINA no entra a los catálogos', () => {
    const [ctx, reflector] = contexto({ sesion: sesion('COCINA') }, { [CLAVE_ROLES]: ['ADMIN'] });
    expect(() => new RolesGuard(reflector).canActivate(ctx)).toThrow(ForbiddenException);
  });
});
