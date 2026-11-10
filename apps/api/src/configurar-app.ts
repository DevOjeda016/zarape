import { join } from 'node:path';
import { BadRequestException, ValidationPipe, type ValidationError } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ArchivosService } from './archivos/archivos.service.js';
import { PrismaErroresFilter } from './comun/prisma-errores.filter.js';

/** Fotos de muestra del seed, versionadas en el repo. */
export const CARPETA_FOTOS_MUESTRA = join(import.meta.dirname, '..', 'public', 'fotos');

/**
 * Mensajes de validación en español. Los campos que no existen en el DTO (p. ej. `id`)
 * se rechazan con un mensaje claro: el ID nunca se modifica (RF02–RF06).
 */
export function mensajesValidacion(errores: ValidationError[], padre = ''): string[] {
  return errores.flatMap((error) => {
    const campo = padre ? `${padre}.${error.property}` : error.property;
    const propios = Object.entries(error.constraints ?? {}).map(([regla, mensaje]) => {
      if (regla !== 'whitelistValidation') return mensaje;
      return error.property === 'id' ? 'El ID no se puede modificar.' : `El campo ${campo} no se acepta.`;
    });
    return [...propios, ...mensajesValidacion(error.children ?? [], campo)];
  });
}

/**
 * Configuración HTTP común a `main.ts` y a las pruebas e2e, para probar la app tal cual arranca.
 * Prefijo /api, validación de DTOs, errores de Prisma traducidos y fotos en /fotos.
 */
export function configurarApp(app: NestExpressApplication): void {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errores) => new BadRequestException(mensajesValidacion(errores)),
    }),
  );
  app.useGlobalFilters(new PrismaErroresFilter());

  // Fotos subidas y fotos de muestra. Sin listado de carpeta ni archivos ocultos.
  const opciones = { prefix: '/fotos/', index: false, dotfiles: 'deny', maxAge: '7d' } as const;
  app.useStaticAssets(app.get(ArchivosService).carpeta, opciones);
  app.useStaticAssets(CARPETA_FOTOS_MUESTRA, opciones);
}
