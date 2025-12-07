import { ApiProperty } from '@nestjs/swagger';
import { GrindType } from 'src/common/enums/grind-type.enum';
import { ResponseMicroBatchDto } from 'src/modules/micro-batches/dto/response-micro-batch.dto';
import { ResponseProductCatalogDto } from './response-product-catalog.dto';

export class ResponseProductDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => ResponseProductCatalogDto })
  product_catalog: ResponseProductCatalogDto;

  @ApiProperty({ type: () => ResponseMicroBatchDto })
  microbatch: ResponseMicroBatchDto;

  @ApiProperty()
  sku: string;

  @ApiProperty({ enum: GrindType })
  grind_type: GrindType;

  @ApiProperty()
  stock_current: number;

  @ApiProperty()
  stock_reserved: number;

  @ApiProperty()
  stock_minimum: number;

  @ApiProperty()
  sale_price: number;

  @ApiProperty()
  unit_cost: number;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ nullable: true })
  deleted_at: Date;
}
