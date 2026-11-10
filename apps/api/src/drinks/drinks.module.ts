import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module.js';
import { DrinksController } from './drinks.controller.js';
import { DrinksService } from './drinks.service.js';

/** Bebidas: CRUD y búsqueda por nombre, precio o categoría (RF05). */
@Module({
  imports: [CategoriesModule],
  controllers: [DrinksController],
  providers: [DrinksService],
})
export class DrinksModule {}
