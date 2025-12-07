import { IsString, IsNotEmpty, IsNumber, Min, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GrindType } from '../../../common/enums/grind-type.enum';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productCatalogId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  microbatchId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ enum: GrindType })
  @IsEnum(GrindType)
  @IsNotEmpty()
  grind_type: GrindType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  stock_current: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock_reserved?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock_minimum?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  sale_price: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  unit_cost: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

