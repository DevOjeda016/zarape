import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { describe, expect, it } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { AuthService, CREDENCIALES_INVALIDAS } from './auth.service.js';

const jwt = new JwtService({ secret: 'secreto-de-prueba' });
const hash = bcrypt.hashSync('Zarape*2026a', 4);

function servicio(usuario: object | null) {
  const prisma = { usuario: { findUnique: async () => usuario } } as unknown as PrismaService;
  return new AuthService(prisma, jwt);
}

const ana = { id: 7, nombreUsuario: 'ana', passwordHash: hash, rol: 'ADMIN', estatus: 'ACTIVO' };

describe('AuthService.login (RF01)', () => {
  it('con datos correctos regresa token y usuario sin hash', async () => {
    const respuesta = await servicio(ana).login('ana', 'Zarape*2026a');
    expect(respuesta.usuario).toEqual({ id: 7, nombreUsuario: 'ana', rol: 'ADMIN' });
    const sesion = await jwt.verifyAsync(respuesta.token);
    expect(sesion).toMatchObject({ sub: 7, rol: 'ADMIN', tipo: 'EMPLEADO' });
  });

  it.each([
    ['contraseña mal', ana, 'otra'],
    ['usuario inexistente', null, 'Zarape*2026a'],
    ['usuario dado de baja', { ...ana, estatus: 'BAJA' }, 'Zarape*2026a'],
  ])('%s: mismo mensaje genérico', async (_caso, usuario, contrasena) => {
    const intento = servicio(usuario).login('ana', contrasena);
    await expect(intento).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(intento).rejects.toThrow(CREDENCIALES_INVALIDAS);
  });
});
