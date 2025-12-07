import { ApiProperty } from '@nestjs/swagger';
import { BatchStatus } from '@common/enums/batch-status.enum';

export class ResponseBatchDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  purchase_date: string;

  @ApiProperty()
  green_kg: number;

  @ApiProperty()
  green_kg_available: number;

  @ApiProperty()
  producer: string;

  @ApiProperty()
  origin: string;

  @ApiProperty()
  variety: string;

  @ApiProperty()
  process: string;

  @ApiProperty()
  altitude_masl: number;

  @ApiProperty()
  total_cost: number;

  @ApiProperty()
  cost_per_kg: number;

  @ApiProperty({ enum: BatchStatus })
  status: BatchStatus;

  @ApiProperty()
  observations: string;
}
