import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MicroBatchesService } from './micro-batches.service';
import { MicroBatchesController } from './micro-batches.controller';
import { MicroBatch } from './entities/micro-batch.entity';
import { Batch } from '../batches/entities/batch.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { InventoryMovement } from '../inventory/entities/inventory-movement.entity';
import { Product } from '../products/entities/product.entity';
import { ProductCatalog } from '../products/entities/product-catalog.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MicroBatch, Batch, Expense, InventoryMovement, Product, ProductCatalog]),
  ],
  controllers: [MicroBatchesController],
  providers: [MicroBatchesService],
})
export class MicroBatchesModule {}
