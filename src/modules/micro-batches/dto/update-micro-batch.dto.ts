import { PartialType } from '@nestjs/swagger';
import { CreateMicroBatchDto } from './create-micro-batch.dto';

export class UpdateMicroBatchDto extends PartialType(CreateMicroBatchDto) {}
