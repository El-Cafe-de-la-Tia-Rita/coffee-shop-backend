import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { BatchesModule } from './modules/batches/batches.module';
import { MicroBatchesModule } from './modules/micro-batches/micro-batches.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [UsersModule, ClientsModule, BatchesModule, MicroBatchesModule, ExpensesModule, ProductsModule, InventoryModule, OrdersModule, AuthModule],
})
export class AppModule {}
