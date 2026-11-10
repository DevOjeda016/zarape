import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { SaludController } from './salud.controller.js';

describe('SaludController', () => {
  it('responde que la API está arriba', async () => {
    const modulo = await Test.createTestingModule({ controllers: [SaludController] }).compile();
    expect(modulo.get(SaludController).estado()).toEqual({ estado: 'ok' });
  });
});
