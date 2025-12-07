import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { runMigrations } from './database/migration.runner';

async function bootstrap() {
  // Ejecutar migraciones en producción
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Running migrations...');
    await runMigrations();
  }
  
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Coffee Shop API')
    .setDescription('El Café de la Tía Rita - API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth')
    .addTag('Batches')
    .addTag('Clients')
    .addTag('Dashboard')
    .addTag('Expenses')
    .addTag('Inventory')
    .addTag('Micro Batches')
    .addTag('Orders')
    .addTag('Products')
    .addTag('Public Form')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();