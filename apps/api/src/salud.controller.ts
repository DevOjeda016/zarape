import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

/** Revisión rápida de que la API está arriba (no toca la BD). */
@ApiTags('salud')
@Controller('salud')
export class SaludController {
  @Get()
  estado(): { estado: 'ok' } {
    return { estado: 'ok' };
  }
}
