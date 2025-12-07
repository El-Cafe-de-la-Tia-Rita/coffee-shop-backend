import { IsString, IsNotEmpty, IsNumber, Min, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductCatalogDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  weight_grams: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  package_type: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  base_price: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
