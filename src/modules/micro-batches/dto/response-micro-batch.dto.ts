import { ApiProperty } from '@nestjs/swagger';
import { RoastType } from '../../../common/enums/roast-type.enum';
import { ResponseBatchDto } from '../../../modules/batches/dto/response-batch.dto';

export class ResponseMicroBatchDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => ResponseBatchDto })
  batch: ResponseBatchDto;

  @ApiProperty()
  code: string;

  @ApiProperty()
  roast_number: number;

  @ApiProperty()
  roast_date: string;

  @ApiProperty()
  green_kg_used: number;

  @ApiProperty()
  total_roasted_kg_obtained: number;

  @ApiProperty()
  loss_kg: number;

  @ApiProperty()
  loss_percentage: number;

  @ApiProperty({ enum: RoastType })
  roast_type: RoastType;

  @ApiProperty()
  roast_responsible: string;

  @ApiProperty()
  observations: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ nullable: true })
  deleted_at: Date;
}
