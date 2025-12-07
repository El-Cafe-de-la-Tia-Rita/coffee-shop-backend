import { ApiProperty } from '@nestjs/swagger';
import { ExpenseCategory } from '../../../common/enums/expense-category.enum';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';
import { ResponseBatchDto } from '../../../modules/batches/dto/response-batch.dto';

export class ResponseExpenseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => ResponseBatchDto, nullable: true })
  batch?: ResponseBatchDto;

  @ApiProperty()
  date: string;

  @ApiProperty({ enum: ExpenseCategory })
  category: ExpenseCategory;

  @ApiProperty()
  concept: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  receipt_url: string;

  @ApiProperty({ enum: PaymentMethod })
  payment_method: PaymentMethod;

  @ApiProperty()
  responsible: string;

  @ApiProperty()
  observations: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ nullable: true })
  deleted_at: Date;
}
