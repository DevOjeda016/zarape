import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('responde que la API está arriba', async () => {
    const module = await Test.createTestingModule({ controllers: [HealthController] }).compile();
    expect(module.get(HealthController).check()).toEqual({ status: 'ok' });
  });
});
