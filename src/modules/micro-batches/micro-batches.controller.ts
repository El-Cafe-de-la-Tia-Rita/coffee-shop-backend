import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MicroBatchesService } from './micro-batches.service';
import { CreateMicroBatchDto } from './dto/create-micro-batch.dto';
import { UpdateMicroBatchDto } from './dto/update-micro-batch.dto';

@Controller('micro-batches')
export class MicroBatchesController {
  constructor(private readonly microBatchesService: MicroBatchesService) {}

  @Post()
  create(@Body() createMicroBatchDto: CreateMicroBatchDto) {
    return this.microBatchesService.create(createMicroBatchDto);
  }

  @Get()
  findAll() {
    return this.microBatchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.microBatchesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMicroBatchDto: UpdateMicroBatchDto) {
    return this.microBatchesService.update(+id, updateMicroBatchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.microBatchesService.remove(+id);
  }
}
