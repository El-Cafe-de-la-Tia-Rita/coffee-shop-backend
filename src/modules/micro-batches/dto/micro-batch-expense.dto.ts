import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsEnum } from 'class-validator';
import { ExpenseCategory } from '@common/enums/expense-category.enum';

export class MicroBatchExpenseDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(ExpenseCategory)
  @IsNotEmpty()
  category: ExpenseCategory;

  @IsString()
  @IsNotEmpty()
  concept: string;
  
  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  @IsOptional()
  description?: string;
}
