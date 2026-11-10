import { Logger } from '@nestjs/common';
import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

/**
 * Gateway de Socket.IO (RF14, RF15). El socket solo avisa: la fuente de verdad es REST.
 *
 * Salas planeadas (docs/arquitectura.md):
 * - `branch:{id}:kitchen`: exige el JWT de un empleado en el handshake.
 * - `branch:{id}:tickets` y `order:{qrToken}`: solo lectura.
 */
@WebSocketGateway()
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket): void {
    this.logger.debug(`Conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Desconectado: ${client.id}`);
  }

  /** Envía un aviso a todos los sockets de una sala. */
  notify(room: string, event: string, data: unknown): void {
    this.server.to(room).emit(event, data);
  }
}
