import { ApiProperty } from '@nestjs/swagger';

export class DashboardInventoryMetricsDto {
  @ApiProperty({ description: 'Total available stock across all products' })
  totalAvailableStock: number;

  @ApiProperty({ description: 'Percentage of total stock sold within the specified date range' })
  percentageSold: number;
}
