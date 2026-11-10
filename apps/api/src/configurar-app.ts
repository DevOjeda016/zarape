import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ArchivosService } from './archivos/archivos.service.js';
import { PrismaErroresFilter } from './comun/prisma-errores.filter.js';

/** Fotos de muestra del seed, versionadas en el repo. */
export const CARPETA_FOTOS_MUESTRA = join(import.meta.dirname, '..', 'public', 'fotos');

/**
 * Configuración HTTP común a `main.ts` y a las pruebas e2e, para probar la app tal cual arranca.
 * Prefijo /api, validación de DTOs, errores de Prisma traducidos y fotos en /fotos.
 */
export function configurarApp(app: NestExpressApplication): void {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new PrismaErroresFilter());

  // Fotos subidas y fotos de muestra. Sin listado de carpeta ni archivos ocultos.
  const opciones = { prefix: '/fotos/', index: false, dotfiles: 'deny', maxAge: '7d' } as const;
  app.useStaticAssets(app.get(ArchivosService).carpeta, opciones);
  app.useStaticAssets(CARPETA_FOTOS_MUESTRA, opciones);
}
