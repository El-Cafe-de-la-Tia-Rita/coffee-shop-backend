import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Expense } from './entities/expense.entity';
import { Batch } from '../batches/entities/batch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, Batch])],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
