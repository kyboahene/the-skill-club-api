import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  
  // Trust proxy - important for correctly detecting IP addresses behind load balancers/proxies
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new PrismaClientExceptionFilter());

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('NestJS Starter Kit API')
    .setDescription('A robust NestJS API with authentication, Prisma, and Swagger documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API documentation: http://localhost:${port}/docs`);
}

bootstrap();
