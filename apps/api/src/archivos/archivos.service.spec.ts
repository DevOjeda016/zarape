import { describe, expect, it } from 'vitest';
import { detectarImagen } from './archivos.service.js';

describe('detectarImagen', () => {
  it('reconoce JPG, PNG y WebP por sus primeros bytes', () => {
    expect(detectarImagen(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('jpg');
    expect(detectarImagen(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe('png');
    expect(detectarImagen(Buffer.from('RIFF\0\0\0\0WEBPVP8 ', 'ascii'))).toBe('webp');
  });

  it('rechaza lo demás aunque diga ser imagen', () => {
    expect(detectarImagen(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBeNull();
    expect(detectarImagen(Buffer.from('GIF89a'))).toBeNull();
    expect(detectarImagen(Buffer.alloc(0))).toBeNull();
  });
});
