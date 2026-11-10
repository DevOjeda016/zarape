import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { pgAdapter } from './pg-adapter.js';

/**
 * Cliente de Prisma compartido por toda la API (una sola instancia = un solo pool).
 * Se conecta en la primera consulta, así la API arranca aunque la BD aún no esté lista.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService) {
    super({ adapter: pgAdapter(config.get<string>('DATABASE_URL')) });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
