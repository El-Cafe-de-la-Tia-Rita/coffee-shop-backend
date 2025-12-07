import { ApiProperty } from '@nestjs/swagger';

export class DashboardSalesMetricsDto {
  @ApiProperty({ description: 'Average revenue per order within the specified date range' })
  averageRevenuePerOrder: number;

  @ApiProperty({ description: 'Total bags/units sold within the specified date range' })
  totalUnitsSold: number;
}
