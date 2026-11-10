import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway.js';

/** Tiempo real con Socket.IO: kiosko → cocina → turnos (RF14, RF15). */
@Module({
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}
