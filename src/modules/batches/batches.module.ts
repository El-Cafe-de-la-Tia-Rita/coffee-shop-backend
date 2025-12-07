import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchesService } from './batches.service';
import { BatchesController } from './batches.controller';
import { Batch } from './entities/batch.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { InventoryMovement } from '../inventory/entities/inventory-movement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Batch, Expense, InventoryMovement])],
  controllers: [BatchesController],
  providers: [BatchesService],
})
export class BatchesModule {}
