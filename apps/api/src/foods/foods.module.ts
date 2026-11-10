import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module.js';
import { FoodsController } from './foods.controller.js';
import { FoodsService } from './foods.service.js';

/** Alimentos: CRUD y búsqueda por nombre, precio o categoría (RF04). */
@Module({
  imports: [CategoriesModule],
  controllers: [FoodsController],
  providers: [FoodsService],
})
export class FoodsModule {}
