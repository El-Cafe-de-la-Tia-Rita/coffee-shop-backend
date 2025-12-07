import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

export class StatsClientDto {
  @ApiProperty()
  first_purchase_date: Date | null;

  @ApiProperty()
  last_purchase_date: Date | null;

  @ApiProperty()
  number_of_orders: number;

  @ApiProperty()
  total_amount_paid: number;

  @ApiProperty()
  days_without_orders: number | null;

  @ApiProperty({ enum: PaymentMethod })
  favorite_payment_method: PaymentMethod | null;
}
