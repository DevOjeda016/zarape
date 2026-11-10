import { Module } from '@nestjs/common';
import { CategoriasController } from './categorias.controller.js';
import { CategoriasService } from './categorias.service.js';

/** Categorías de alimentos y bebidas (RF04, RF05). */
@Module({
  controllers: [CategoriasController],
  providers: [CategoriasService],
  exports: [CategoriasService],
})
export class CategoriasModule {}
