import { IsString, IsNotEmpty, IsDateString, IsNumber, Min, IsOptional, IsEnum, ValidateNested, IsArray } from 'class-validator';
import { RoastType } from '@common/enums/roast-type.enum';
import { Type } from 'class-transformer';
import { ProductOutputDto } from './product-output.dto';
import { MicroBatchExpenseDto } from './micro-batch-expense.dto';

export class CreateMicroBatchDto {
  @IsString()
  @IsNotEmpty()
  batchId: string; // ID of the parent Batch

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @Min(0)
  roast_number: number;

  @IsDateString()
  @IsNotEmpty()
  roast_date: string;

  @IsNumber()
  @Min(0)
  green_kg_used: number;

  @IsNumber()
  @Min(0)
  roasted_kg_obtained: number;

  @IsEnum(RoastType)
  @IsNotEmpty()
  roast_type: RoastType;

  @IsString()
  @IsNotEmpty()
  roast_responsible: string;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MicroBatchExpenseDto)
  expenses?: MicroBatchExpenseDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOutputDto)
  productOutputs: ProductOutputDto[];
}

