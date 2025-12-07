import { ApiProperty } from '@nestjs/swagger';
import { ResponseClientDto } from '../../../modules/clients/dto/response-client.dto';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';
import { OrderOrigin } from '../../../common/enums/order-origin.enum';
import { ResponseOrderItemDto } from './response-order-item.dto';

export class ResponseOrderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  order_number: string;

  @ApiProperty({ type: () => ResponseClientDto })
  client: ResponseClientDto;

  @ApiProperty()
  order_date: Date;

  @ApiProperty()
  delivery_date_estimated: string;

  @ApiProperty({ nullable: true })
  delivery_date_real?: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  shipping: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ enum: PaymentMethod })
  payment_method: PaymentMethod;

  @ApiProperty()
  payment_confirmed: boolean;

  @ApiProperty({ nullable: true })
  payment_receipt_url?: string;

  @ApiProperty({ nullable: true })
  notes?: string;

  @ApiProperty()
  delivery_address: string;

  @ApiProperty({ enum: OrderOrigin })
  origin: OrderOrigin;

  @ApiProperty()
  created_by: { id: string; name: string };

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ nullable: true })
  deleted_at: Date;

  @ApiProperty({ type: () => [ResponseOrderItemDto] })
  items: ResponseOrderItemDto[];
}
