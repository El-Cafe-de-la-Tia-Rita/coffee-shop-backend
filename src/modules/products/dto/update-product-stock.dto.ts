import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateProductStockDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sale_price?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  productCatalogName?: string;
}
