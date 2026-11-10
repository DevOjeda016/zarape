import { Module } from '@nestjs/common';
import { ArchivosController } from './archivos.controller.js';
import { ArchivosService } from './archivos.service.js';

/** Subida de fotos (RF02, RF04, RF05, RF06). Se sirven en /fotos (ver configurarApp). */
@Module({
  controllers: [ArchivosController],
  providers: [ArchivosService],
  exports: [ArchivosService],
})
export class ArchivosModule {}
