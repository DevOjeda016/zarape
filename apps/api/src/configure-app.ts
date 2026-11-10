import { join } from 'node:path';
import { BadRequestException, ValidationPipe, type ValidationError } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { PrismaErrorsFilter } from './common/prisma-errors.filter.js';
import { FilesService } from './files/files.service.js';

/** Fotos de muestra del seed, versionadas en el repo. */
export const SAMPLE_PHOTOS_DIR = join(import.meta.dirname, '..', 'public', 'photos');

/**
 * Mensajes de validación en español. Los campos que no existen en el DTO (p. ej. `id`)
 * se rechazan con un mensaje claro: el ID nunca se modifica (RF02–RF06).
 */
export function validationMessages(errors: ValidationError[], parent = ''): string[] {
  return errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const own = Object.entries(error.constraints ?? {}).map(([rule, message]) => {
      if (rule !== 'whitelistValidation') return message;
      return error.property === 'id' ? 'El ID no se puede modificar.' : `El campo ${field} no se acepta.`;
    });
    return [...own, ...validationMessages(error.children ?? [], field)];
  });
}

/**
 * Configuración HTTP común a `main.ts` y a las pruebas e2e, para probar la app tal cual arranca.
 * Prefijo /api, validación de DTOs, errores de Prisma traducidos y fotos en /photos.
 */
export function configureApp(app: NestExpressApplication): void {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => new BadRequestException(validationMessages(errors)),
    }),
  );
  app.useGlobalFilters(new PrismaErrorsFilter());

  // Fotos subidas y fotos de muestra. Sin listado de carpeta ni archivos ocultos.
  const options = { prefix: '/photos/', index: false, dotfiles: 'deny', maxAge: '7d' } as const;
  app.useStaticAssets(app.get(FilesService).photosDir, options);
  app.useStaticAssets(SAMPLE_PHOTOS_DIR, options);
}
