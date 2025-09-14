import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';
import { LoggingInterceptor } from './common/interceptors/HTTP-logging.intercepto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.use((req, res, next) => {
    req.id = uuidv4();
    next();
  });

  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggingInterceptor(app.get(Logger)));

  const config = app.get(ConfigService);
  const corsOrigin = config.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',') : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(helmet());
  // If behind a proxy/load balancer (e.g., Heroku, Nginx), enable trust proxy
  if ('set' in (app as unknown as Record<string, unknown>)) {
    (app as unknown as { set: (key: string, value: unknown) => void }).set(
      'trust proxy',
      1,
    );
  }

  app.use('/payments/webhook', express.raw({ type: 'application/json' }));
  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Booking System API')
    .setDescription('API documentation for Booking System')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDoc);
  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
}
void bootstrap();
