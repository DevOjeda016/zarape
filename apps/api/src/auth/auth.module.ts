import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtGuard } from './jwt.guard.js';
import { RolesGuard } from './roles.guard.js';

/** Solo para desarrollo local; en producción JWT_SECRET es obligatorio. */
const DEV_SECRET = 'zarape-dev-only-do-not-use-in-production';

/**
 * Login de empleado y de cliente, JWT y guards de rol (RF01, RF16).
 * Los guards son globales: toda ruta pide sesión salvo @Public(), y @Roles() limita por rol.
 */
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        let secret = config.get<string>('JWT_SECRET');
        if (!secret) {
          if (config.get('NODE_ENV') === 'production') throw new Error('Falta JWT_SECRET en el entorno.');
          Logger.warn('JWT_SECRET no está definido; se usa un secreto de desarrollo.', 'Auth');
          secret = DEV_SECRET;
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
