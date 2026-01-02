import { IsString, IsNotEmpty, IsNumber, Min, IsEnum, IsBoolean, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GrindType } from '@common/enums/grind-type.enum';
import { ProductExpenseDto } from './product-expense.dto';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productCatalogId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  microbatchId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sku?: string;

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

  @ApiProperty({
    type: [ProductExpenseDto],
    description: 'List of expenses associated with the product creation (e.g., bags).',
    required: false
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductExpenseDto)
  expenses?: ProductExpenseDto[];

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}


