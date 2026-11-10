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
 * - `sucursal:{id}:cocina`: exige el JWT de un empleado en el handshake.
 * - `sucursal:{id}:turnos` y `comanda:{token}`: solo lectura.
 */
@WebSocketGateway()
export class TiempoRealGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(TiempoRealGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(cliente: Socket): void {
    this.logger.debug(`Conectado: ${cliente.id}`);
  }

  handleDisconnect(cliente: Socket): void {
    this.logger.debug(`Desconectado: ${cliente.id}`);
  }

  /** Envía un aviso a todos los sockets de una sala. */
  avisar(sala: string, evento: string, datos: unknown): void {
    this.server.to(sala).emit(evento, datos);
  }
}
