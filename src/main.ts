import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { runMigrations } from './database/migration.runner';
import 'module-alias/register';

async function bootstrap() {
  // Ejecutar migraciones en producción
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Running migrations...');
    await runMigrations();
  }
  
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // CORS - Configuración robusta
  const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173', // Vite
      ];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      // Verificar contra lista de permitidos o wildcard
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // En desarrollo, ser más permisivo con localhost
        if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
          console.log(`⚠️  Allowing localhost origin in dev: ${origin}`);
          callback(null, true);
        } else {
          console.warn(`❌ CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Authorization'],
    maxAge: 3600, // Cache preflight requests por 1 hora
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