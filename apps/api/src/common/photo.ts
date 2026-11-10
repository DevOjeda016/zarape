import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength } from 'class-validator';
import { Trim } from './query.js';

/** Foto: ruta que regresa POST /api/files/photos (`/photos/...`) o una URL https completa. */
export const PHOTO_PATTERN = /^(\/photos\/[\w./-]+|https:\/\/\S+)$/;

/** Campo de foto obligatorio (RF02, RF04, RF05, RF06). La BD guarda solo la URL. */
export const PhotoField = (example: string) =>
  applyDecorators(
    ApiProperty({ example, description: 'Ruta /photos/… (de /api/files/photos) o URL https.' }),
    Trim(),
    IsString(),
    MaxLength(500),
    Matches(PHOTO_PATTERN, { message: 'Sube una foto o pega una URL https.' }),
  );
