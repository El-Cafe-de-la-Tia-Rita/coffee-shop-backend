import { IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardFilterDto {
  @ApiPropertyOptional({ description: 'Start date for the data range (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for the data range (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
