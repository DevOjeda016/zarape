import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Publico } from './auth/decoradores.js';

/** Revisión rápida de que la API está arriba (no toca la BD). */
@Publico()
@ApiTags('salud')
@Controller('salud')
export class SaludController {
  @Get()
  estado(): { estado: 'ok' } {
    return { estado: 'ok' };
  }
}
