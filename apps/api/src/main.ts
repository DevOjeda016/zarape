import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { configurarApp } from './configurar-app.js';
import { SocketIoAdapter } from './tiempo-real/socket-io.adapter.js';

/** Apps de Vite en desarrollo: admin 5173, pos 5174, drive-thru 5175. */
const ORIGENES_DESARROLLO = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const origenes =
    config
      .get<string>('CORS_ORIGENES')
      ?.split(',')
      .map((origen) => origen.trim())
      .filter(Boolean) ?? ORIGENES_DESARROLLO;

  configurarApp(app);
  app.enableCors({ origin: origenes });
  app.useWebSocketAdapter(new SocketIoAdapter(app, origenes));
  app.enableShutdownHooks();

  const documento = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('El Zarape API')
      .setDescription('API del autoservicio de El Zarape: catálogos, comandas, pagos simulados y dashboard.')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('api/docs', app, documento);

  const puerto = Number(config.get('PORT') ?? 3000);
  await app.listen(puerto);
  Logger.log(`API en http://localhost:${puerto}/api · Swagger en http://localhost:${puerto}/api/docs`, 'Arranque');
}

await bootstrap();
