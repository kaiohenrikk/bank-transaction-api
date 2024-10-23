import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('bank-transaction-api');

  const config = new DocumentBuilder()
    .setTitle('Bank Transaction API')
    .setDescription('API documentation for the Bank Transaction service')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  writeFileSync('./swagger.json', JSON.stringify(document, null, 2));

  SwaggerModule.setup('api-docs', app, document);

  console.log('Application is running on: http://localhost:3000');

  await app.listen(3000);
};
bootstrap();
