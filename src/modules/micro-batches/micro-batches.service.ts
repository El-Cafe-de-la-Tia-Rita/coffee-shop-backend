import { Injectable } from '@nestjs/common';
import { CreateMicroBatchDto } from './dto/create-micro-batch.dto';
import { UpdateMicroBatchDto } from './dto/update-micro-batch.dto';

@Injectable()
export class MicroBatchesService {
  create(createMicroBatchDto: CreateMicroBatchDto) {
    return 'This action adds a new microBatch';
  }

  findAll() {
    return `This action returns all microBatches`;
  }

  findOne(id: number) {
    return `This action returns a #${id} microBatch`;
  }

  update(id: number, updateMicroBatchDto: UpdateMicroBatchDto) {
    return `This action updates a #${id} microBatch`;
  }

  remove(id: number) {
    return `This action removes a #${id} microBatch`;
  }
}
