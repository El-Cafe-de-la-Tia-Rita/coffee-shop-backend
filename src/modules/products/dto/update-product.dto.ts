import { IsNumber, IsBoolean, IsOptional, Min, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@ApiProperty({ type: 'object', description: 'Update Product DTO' })
export class UpdateProductDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sale_price?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock_minimum?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({ required: false, description: 'Name of the associated Product Catalog' })
  @IsString()
  @IsOptional()
  productCatalogName?: string;
}
