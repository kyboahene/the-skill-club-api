import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { PrismaClientExceptionFilter } from '../src/prisma-client-exception/prisma-client-exception.filter';

let expressHandler: ((req: any, res: any) => any) | null = null;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new PrismaClientExceptionFilter());

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const config = new DocumentBuilder()
    .setTitle('NestJS Starter Kit API')
    .setDescription('A robust NestJS API with authentication, Prisma, and Swagger documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.init();

  return (req: any, res: any) => expressApp(req, res);
}

export default async function handler(req: any, res: any) {
  if (!expressHandler) {
    expressHandler = await bootstrap();
  }
  return expressHandler(req, res);
}

