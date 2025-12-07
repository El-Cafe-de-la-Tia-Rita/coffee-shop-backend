import { ApiProperty } from '@nestjs/swagger';
import { CreateProductCatalogDto } from './create-product-catalog.dto';

export class ResponseProductCatalogDto extends CreateProductCatalogDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ nullable: true })
  deleted_at: Date;
}
