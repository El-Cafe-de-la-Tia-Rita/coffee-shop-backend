import { IsOptional, IsString, IsBoolean, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { GrindType } from '@common/enums/grind-type.enum';

export class FilterProductDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ enum: GrindType })
  @IsOptional()
  @IsEnum(GrindType)
  grind_type?: GrindType;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isLowStock?: boolean;

  // Filters from ProductCatalog
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productCatalogCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productCatalogName?: string;
}
