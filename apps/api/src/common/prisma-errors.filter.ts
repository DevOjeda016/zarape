import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';

/**
 * Traduce errores conocidos de Prisma a respuestas HTTP con mensaje en español,
 * para que el front no reciba un 500 por un valor repetido o un registro que ya no existe.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaErrorsFilter implements ExceptionFilter {
  catch(error: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const [status, message] = translate(error.code);
    response.status(status).json({ statusCode: status, message });
  }
}

function translate(code: string): [number, string] {
  switch (code) {
    case 'P2002':
      return [HttpStatus.CONFLICT, 'Ya existe un registro con ese valor.'];
    case 'P2003':
      return [HttpStatus.CONFLICT, 'El registro está relacionado con otros y no se puede cambiar así.'];
    case 'P2025':
      return [HttpStatus.NOT_FOUND, 'No encontramos ese registro.'];
    default:
      return [HttpStatus.INTERNAL_SERVER_ERROR, 'Algo salió mal en la base de datos.'];
  }
}
