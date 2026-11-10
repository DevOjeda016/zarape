import { Module } from '@nestjs/common';
import { CategoriasModule } from '../categorias/categorias.module.js';
import { BebidasController } from './bebidas.controller.js';
import { BebidasService } from './bebidas.service.js';

/** Bebidas: CRUD y búsqueda por nombre, precio o categoría (RF05). */
@Module({
  imports: [CategoriasModule],
  controllers: [BebidasController],
  providers: [BebidasService],
})
export class BebidasModule {}
