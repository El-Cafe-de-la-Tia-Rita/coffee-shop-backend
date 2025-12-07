import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PublicOrdersController } from './public-orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Client } from '../clients/entities/client.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { InventoryMovement } from '../inventory/entities/inventory-movement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Client, Product, InventoryMovement, User])],
  controllers: [OrdersController, PublicOrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
