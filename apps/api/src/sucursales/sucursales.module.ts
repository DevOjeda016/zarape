import { Module } from '@nestjs/common';
import { SucursalesController } from './sucursales.controller.js';
import { SucursalesService } from './sucursales.service.js';

/** Sucursales: CRUD, búsqueda y cercanía por GPS (RF02, RF19). */
@Module({
  controllers: [SucursalesController],
  providers: [SucursalesService],
  exports: [SucursalesService],
})
export class SucursalesModule {}
