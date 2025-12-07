import { IsString, IsNotEmpty, IsDateString, IsNumber, Min, IsOptional, IsEnum } from 'class-validator';
import { ExpenseCategory } from 'src/common/enums/expense-category.enum';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';

export class CreateExpenseDto {
  @IsString()
  @IsOptional()
  batchId?: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsEnum(ExpenseCategory)
  @IsNotEmpty()
  category: ExpenseCategory;

  @IsString()
  @IsNotEmpty()
  concept: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  @IsNotEmpty()
  receipt_url: string;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  payment_method: PaymentMethod;

  @IsString()
  @IsOptional()
  observations?: string;
}

