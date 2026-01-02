import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsEnum } from 'class-validator';
import { ExpenseCategory } from '@common/enums/expense-category.enum';
import { PaymentMethod } from '@common/enums/payment-method.enum';

export class ProductExpenseDto {
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

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  payment_method: PaymentMethod;
}
