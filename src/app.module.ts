import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, Reflector } from '@nestjs/core';
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
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
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
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/modules/**/*.entity{.ts,.js}', __dirname + '/common/entities/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: true,
      }),
    }),
    UsersModule,
    ClientsModule,
    BatchesModule,
    MicroBatchesModule,
    ExpensesModule,
    ProductsModule,
    InventoryModule,
    OrdersModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    Reflector,
  ],
})
export class AppModule {}