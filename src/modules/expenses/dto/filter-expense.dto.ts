import { IsString, IsNotEmpty, IsDateString, IsNumber, Min, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer'; // Import Type
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ExpenseCategory } from 'src/common/enums/expense-category.enum';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';

export class FilterExpenseDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ExpenseCategory })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number) // Add Type decorator
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number) // Add Type decorator
  @IsNumber()
  @Min(0)
  maxAmount?: number;
}
