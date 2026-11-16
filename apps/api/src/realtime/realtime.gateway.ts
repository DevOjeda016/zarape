import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { EmployeeSession } from '../auth/session.js';
import type { OrderStatus } from '../generated/prisma/enums.js';

/** Lo que el cliente manda en `join` para entrar a una sala. */
interface JoinRequest {
  room?: 'kitchen' | 'tickets' | 'order';
  branchId?: number;
  qrToken?: string;
}

/** Aviso de que una comanda cambió. Sin datos sensibles: cada pantalla vuelve a pedir por REST. */
export interface OrderChangedEvent {
  id: number;
  ticketNumber: number | null;
  status: OrderStatus;
}

export const ORDER_CHANGED = 'order:changed';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Gateway de Socket.IO (RF14, RF15). El socket solo avisa: la fuente de verdad es REST.
 *
 * Salas (docs/arquitectura.md):
 * - `branch:{id}:kitchen`: exige el JWT de un empleado en el handshake (`auth.token`).
 * - `branch:{id}:tickets` y `order:{qrToken}`: solo lectura.
 */
@WebSocketGateway()
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly jwt: JwtService) {}

  handleConnection(client: Socket): void {
    this.logger.debug(`Conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Desconectado: ${client.id}`);
  }

  /** El cliente pide entrar a una sala. Responde `{ ok }` como acuse. */
  @SubscribeMessage('join')
  async join(@ConnectedSocket() client: Socket, @MessageBody() body: JoinRequest): Promise<{ ok: boolean }> {
    const room = await this.roomFor(client, body ?? {});
    if (!room) return { ok: false };
    await client.join(room);
    return { ok: true };
  }

  /** Avisa a cocina, a la pantalla de turnos y a quien sigue ese QR. */
  orderChanged(order: OrderChangedEvent & { branchId: number; qrToken: string }): void {
    const event: OrderChangedEvent = { id: order.id, ticketNumber: order.ticketNumber, status: order.status };
    // Sin servidor (pruebas unitarias) no hay a quién avisar
    this.server
      ?.to([`branch:${order.branchId}:kitchen`, `branch:${order.branchId}:tickets`, `order:${order.qrToken}`])
      .emit(ORDER_CHANGED, event);
  }

  private async roomFor(client: Socket, { room, branchId, qrToken }: JoinRequest): Promise<string | null> {
    if (room === 'order') return typeof qrToken === 'string' && UUID.test(qrToken) ? `order:${qrToken}` : null;
    if (!Number.isInteger(branchId) || Number(branchId) < 1) return null;
    if (room === 'tickets') return `branch:${branchId}:tickets`;
    if (room === 'kitchen') return (await this.isEmployee(client)) ? `branch:${branchId}:kitchen` : null;
    return null;
  }

  private async isEmployee(client: Socket): Promise<boolean> {
    const token: unknown = client.handshake.auth?.['token'];
    if (typeof token !== 'string') return false;
    try {
      return (await this.jwt.verifyAsync<EmployeeSession>(token)).kind === 'EMPLOYEE';
    } catch {
      return false;
    }
  }
}
