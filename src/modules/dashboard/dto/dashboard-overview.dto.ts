import { ApiProperty } from '@nestjs/swagger';

export class DashboardOverviewDto {
  @ApiProperty({ description: 'Total sales within the specified date range' })
  totalSales: number;

  @ApiProperty({ description: 'Total expenses within the specified date range' })
  totalExpenses: number;

  @ApiProperty({ description: 'Net profit (Total Sales - Total Expenses) within the specified date range' })
  netProfit: number;
}
