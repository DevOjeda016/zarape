import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller.js';
import { MenuService } from './menu.service.js';

/** Menú y sucursales activas para el kiosko y el drive thru, sin sesión (RF07, RF08, RF19). */
@Module({
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
