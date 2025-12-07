import { ApiProperty } from '@nestjs/swagger';
import { ResponseBatchDto } from './response-batch.dto';
import { Expense } from '@modules/expenses/entities/expense.entity';

class BatchSummary {
  @ApiProperty()
  totalExpenses: number;

  @ApiProperty()
  totalCost: number;

  @ApiProperty()
  costPerKg: number;
}

export class SummaryBatchDto extends ResponseBatchDto {
  @ApiProperty({ type: () => [Expense] })
  expenses: Expense[];

  @ApiProperty()
  summary: BatchSummary;
}
