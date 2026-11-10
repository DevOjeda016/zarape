import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { configureApp } from './configure-app.js';
import { SocketIoAdapter } from './realtime/socket-io.adapter.js';

/** Apps de Vite en desarrollo: admin 5173, pos 5174, drive-thru 5175. */
const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const origins =
    config
      .get<string>('CORS_ORIGINS')
      ?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? DEV_ORIGINS;

  configureApp(app);
  app.enableCors({ origin: origins });
  app.useWebSocketAdapter(new SocketIoAdapter(app, origins));
  app.enableShutdownHooks();

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('El Zarape API')
      .setDescription('API del autoservicio de El Zarape: catálogos, comandas, pagos simulados y dashboard.')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(config.get('PORT') ?? 3000);
  await app.listen(port);
  Logger.log(`API en http://localhost:${port}/api · Swagger en http://localhost:${port}/api/docs`, 'Bootstrap');
}

await bootstrap();
