import { ApiProperty } from '@nestjs/swagger';
import { ResponseProductStockDto } from '@modules/products/dto/response-product.dto';

export class ResponseOrderItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => ResponseProductStockDto })
  product_stock: ResponseProductStockDto;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unit_price: number;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  sold_kg: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
