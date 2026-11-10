import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtGuard } from './jwt.guard.js';
import { RolesGuard } from './roles.guard.js';

/** Solo para desarrollo local; en producción JWT_SECRETO es obligatorio. */
const SECRETO_DESARROLLO = 'zarape-desarrollo-no-usar-en-produccion';

/**
 * Login de empleado y de cliente, JWT y guards de rol (RF01, RF16).
 * Los guards son globales: toda ruta pide sesión salvo @Publico(), y @Roles() limita por rol.
 */
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        let secret = config.get<string>('JWT_SECRETO');
        if (!secret) {
          if (config.get('NODE_ENV') === 'production') throw new Error('Falta JWT_SECRETO en el entorno.');
          Logger.warn('JWT_SECRETO no está definido; se usa un secreto de desarrollo.', 'Auth');
          secret = SECRETO_DESARROLLO;
        }
        return { secret, signOptions: { expiresIn: '10h' } };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: APP_GUARD, useClass: JwtGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
