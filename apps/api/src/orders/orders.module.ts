import { Module } from '@nestjs/common';
import { RealtimeModule } from '../realtime/realtime.module.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

/** Comandas: crear al pagar, cambio de estatus, búsqueda, detalle y QR (RF09–RF11, RF15, RF19, RF20). */
@Module({
  imports: [RealtimeModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
