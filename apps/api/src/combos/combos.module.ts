import { Module } from '@nestjs/common';
import { CombosController } from './combos.controller.js';
import { CombosService } from './combos.service.js';

/** Combos: CRUD con componentes de alimentos y bebidas (RF06). */
@Module({
  controllers: [CombosController],
  providers: [CombosService],
})
export class CombosModule {}
