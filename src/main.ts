import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  app.setGlobalPrefix('bank-transaction-api');

  const config = new DocumentBuilder()
    .setTitle('Bank Transaction API')
    .setDescription('API documentation for the Bank Transaction service')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const swaggerPath = join('/tmp', 'swagger.json');
  writeFileSync(swaggerPath, JSON.stringify(document, null, 2), 'utf-8');

  SwaggerModule.setup('api-docs', app, document);

  console.log('Application is running on: http://localhost:3000');

  await app.listen(3000);
};

bootstrap();
