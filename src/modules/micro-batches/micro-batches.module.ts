import { Module } from '@nestjs/common';
import { MicroBatchesService } from './micro-batches.service';
import { MicroBatchesController } from './micro-batches.controller';

@Module({
  controllers: [MicroBatchesController],
  providers: [MicroBatchesService],
})
export class MicroBatchesModule {}
