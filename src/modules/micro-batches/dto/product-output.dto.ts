import { IsString, IsNotEmpty, IsNumber, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GrindType } from 'src/common/enums/grind-type.enum';

export class ProductOutputDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productCatalogId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  count: number; // Number of units (e.g., bags, samples)

  @ApiProperty({ enum: GrindType })
  @IsEnum(GrindType)
  @IsNotEmpty()
  grindType: GrindType;
}
