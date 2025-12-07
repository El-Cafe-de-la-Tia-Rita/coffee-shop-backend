import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@common/enums/order-status.enum';

class OrderStatItem {
  @ApiProperty()
  label: string; // e.g., date, product name

  @ApiProperty()
  count: number;

  @ApiProperty()
  totalAmount: number;
}

export class OrderStatsDto {
  @ApiProperty({ type: [OrderStatItem] })
  ordersByDay: OrderStatItem[];

  @ApiProperty({ type: [OrderStatItem] })
  ordersByProduct: OrderStatItem[];

  @ApiProperty({ enum: OrderStatus })
  statusDistribution: Record<OrderStatus, number>;

  @ApiProperty()
  totalOrders: number;

  @ApiProperty()
  totalRevenue: number;
}
