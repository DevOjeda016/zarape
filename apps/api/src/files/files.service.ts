import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const MAX_PHOTO_SIZE = 2 * 1024 * 1024;

/** Tipo real por los primeros bytes (no por la extensión ni el Content-Type que manda el cliente). */
export function detectImage(bytes: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'png';
  }
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') {
    return 'webp';
  }
  return null;
}

/**
 * Fotos en disco local (desarrollo). En producción se cambia por almacenamiento de objetos;
 * la BD guarda solo la URL (docs/arquitectura.md).
 */
@Injectable()
export class FilesService {
  readonly photosDir: string;

  constructor(config: ConfigService) {
    this.photosDir = config.get<string>('PHOTOS_DIR') ?? join(process.cwd(), 'uploads', 'photos');
  }

  async savePhoto(bytes: Buffer | undefined): Promise<{ url: string }> {
    if (!bytes?.length) throw new BadRequestException('Elige una foto.');
    if (bytes.length > MAX_PHOTO_SIZE) throw new BadRequestException('La foto pesa más de 2 MB.');
    const extension = detectImage(bytes);
    if (!extension) throw new BadRequestException('Sube una foto JPG, PNG o WebP.');

    const fileName = `${randomUUID()}.${extension}`;
    await mkdir(this.photosDir, { recursive: true });
    await writeFile(join(this.photosDir, fileName), bytes);
    return { url: `/photos/${fileName}` };
  }
}
