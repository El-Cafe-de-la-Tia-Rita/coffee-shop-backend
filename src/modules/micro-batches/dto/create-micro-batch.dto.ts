import { IsString, IsNotEmpty, IsDateString, IsNumber, Min, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { RoastType } from '../../../common/enums/roast-type.enum';

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

  @IsNumber()
  @Min(0)
  bags_obtained_250g: number;

  @IsNumber()
  @Min(0)
  samples_obtained_100g: number;

  @IsNumber()
  @Min(0)
  leftover_grams: number;

  @IsBoolean()
  extra_bag: boolean;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  production_cost?: number; // For associated expense
}

