import { IsString, IsNotEmpty, IsDateString, IsNumber, Min, IsOptional, IsEnum, ValidateNested, IsArray } from 'class-validator';
import { RoastType } from '@common/enums/roast-type.enum';
import { Type } from 'class-transformer';
import { ProductOutputDto } from './product-output.dto';

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

  @IsEnum(RoastType)
  @IsNotEmpty()
  roast_type: RoastType;

  @IsString()
  @IsNotEmpty()
  roast_responsible: string;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  production_cost?: number; // For associated expense

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOutputDto)
  productOutputs: ProductOutputDto[];
}

