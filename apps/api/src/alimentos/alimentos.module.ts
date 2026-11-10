import { Module } from '@nestjs/common';
import { CategoriasModule } from '../categorias/categorias.module.js';
import { AlimentosController } from './alimentos.controller.js';
import { AlimentosService } from './alimentos.service.js';

/** Alimentos: CRUD y búsqueda por nombre, precio o categoría (RF04). */
@Module({
  imports: [CategoriasModule],
  controllers: [AlimentosController],
  providers: [AlimentosService],
})
export class AlimentosModule {}
