import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength } from 'class-validator';
import { Recortar } from './consulta.js';

/** Foto: ruta que regresa POST /api/archivos/fotos (`/fotos/...`) o una URL https completa. */
export const PATRON_FOTO = /^(\/fotos\/[\w./-]+|https:\/\/\S+)$/;

/** Campo de foto obligatorio (RF02, RF04, RF05). La BD guarda solo la URL. */
export const CampoFoto = (ejemplo: string) =>
  applyDecorators(
    ApiProperty({ example: ejemplo, description: 'Ruta /fotos/… (de /api/archivos/fotos) o URL https.' }),
    Recortar(),
    IsString(),
    MaxLength(500),
    Matches(PATRON_FOTO, { message: 'Sube una foto o pega una URL https.' }),
  );
