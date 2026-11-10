import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { describe, expect, it } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { AuthService, INVALID_CREDENTIALS } from './auth.service.js';

const jwt = new JwtService({ secret: 'test-secret' });
const hash = bcrypt.hashSync('Zarape*2026a', 4);

function service(employee: object | null) {
  const prisma = { employee: { findUnique: async () => employee } } as unknown as PrismaService;
  return new AuthService(prisma, jwt);
}

const ana = { id: 7, username: 'ana', passwordHash: hash, role: 'ADMIN', status: 'ACTIVE' };

describe('AuthService.login (RF01)', () => {
  it('con datos correctos regresa token y empleado sin hash', async () => {
    const response = await service(ana).login('ana', 'Zarape*2026a');
    expect(response.employee).toEqual({ id: 7, username: 'ana', role: 'ADMIN' });
    const session = await jwt.verifyAsync(response.token);
    expect(session).toMatchObject({ sub: 7, role: 'ADMIN', kind: 'EMPLOYEE' });
  });

  it.each([
    ['contraseña mal', ana, 'otra'],
    ['usuario inexistente', null, 'Zarape*2026a'],
    ['usuario dado de baja', { ...ana, status: 'INACTIVE' }, 'Zarape*2026a'],
  ])('%s: mismo mensaje genérico', async (_case, employee, password) => {
    const attempt = service(employee).login('ana', password);
    await expect(attempt).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(attempt).rejects.toThrow(INVALID_CREDENTIALS);
  });
});
