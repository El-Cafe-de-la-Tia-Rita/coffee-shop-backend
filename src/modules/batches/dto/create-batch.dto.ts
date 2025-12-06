import { IsString, IsNotEmpty, IsDateString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateBatchDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsDateString()
  @IsNotEmpty()
  purchase_date: string;

  @IsNumber()
  @Min(0)
  green_kg: number;

  @IsString()
  @IsNotEmpty()
  producer: string;

  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  variety: string;

  @IsString()
  @IsNotEmpty()
  process: string;

  @IsNumber()
  @Min(0)
  altitude_masl: number;

  @IsNumber()
  @Min(0)
  total_cost: number;

  @IsString()
  @IsOptional()
  observations?: string;
}

