import { Module } from '@nestjs/common';
import { TiempoRealGateway } from './tiempo-real.gateway.js';

/** Tiempo real con Socket.IO: kiosko → cocina → turnos (RF14, RF15). */
@Module({
  providers: [TiempoRealGateway],
  exports: [TiempoRealGateway],
})
export class TiempoRealModule {}
