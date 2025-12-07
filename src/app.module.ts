import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_FILTER, Reflector } from '@nestjs/core';
import { join } from 'path';

import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { BatchesModule } from './modules/batches/batches.module';
import { MicroBatchesModule } from './modules/micro-batches/micro-batches.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TypeOrmExceptionFilter } from './common/filters/typeorm-exception.filter';
import jwtConfig from './config/jwt.config';

const envFile = process.env.NODE_ENV === 'production' 
  ? 'env/.env.prod' 
  : 'env/.env.dev';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', envFile),
      load: [jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = process.env.NODE_ENV === 'production';
        
        // En producción, usar DATABASE_URL de Render
        if (isProduction && process.env.DATABASE_URL) {
          return {
            type: 'postgres' as const,
            url: process.env.DATABASE_URL,
            entities: [__dirname + '/modules/**/*.entity.js', __dirname + '/common/entities/**/*.entity.js'],
            migrations: [__dirname + '/database/migrations/*.js'],
            synchronize: false,
            logging: false,
            ssl: {
              rejectUnauthorized: false,
            },
          };
        }
        
        // En desarrollo, usar variables individuales
        return {
          type: 'postgres' as const,
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [__dirname + '/modules/**/*.entity{.ts,.js}', __dirname + '/common/entities/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
          synchronize: false,
          logging: true,
          ssl: false,
        };
      },
    }),
    UsersModule,
    ClientsModule,
    BatchesModule,
    MicroBatchesModule,
    ExpensesModule,
    ProductsModule,
    InventoryModule,
    OrdersModule,
    DashboardModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: TypeOrmExceptionFilter,
    },
    Reflector,
  ],
})
export class AppModule {}