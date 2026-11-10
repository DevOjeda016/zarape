import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions } from 'socket.io';

/** Adaptador de Socket.IO con los mismos orígenes de CORS que la API REST. */
export class SocketIoAdapter extends IoAdapter {
  private readonly origins: string[];

  constructor(app: INestApplicationContext, origins: string[]) {
    super(app);
    this.origins = origins;
  }

  override createIOServer(port: number, options?: ServerOptions) {
    // Nest pasa opciones parciales; socket.io completa el resto con sus valores por defecto
    return super.createIOServer(port, { ...options, cors: { origin: this.origins } } as ServerOptions);
  }
}
