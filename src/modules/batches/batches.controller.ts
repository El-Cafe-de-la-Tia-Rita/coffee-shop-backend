import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { FilterBatchDto } from './dto/filter-batch.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { RolesGuard } from '@common/guards/roles.guard';
import { ResponseBatchDto } from './dto/response-batch.dto';
import { SummaryBatchDto } from './dto/summary-batch.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '../../modules/users/entities/user.entity';
import { BatchStatus } from '@common/enums/batch-status.enum';

@ApiTags('Batches')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new batch' })
  @ApiBody({
    type: CreateBatchDto,
    examples: {
      a: {
        summary: 'Example Batch Creation',
        value: {
          code: 'BATCH-001',
          purchase_date: '2025-12-01',
          green_kg: 1000,
          producer: 'Finca La Esmeralda',
          origin: 'Colombia',
          variety: 'Castillo',
          process: 'Washed',
          altitude_masl: 1800,
          total_cost: 5000.00,
          observations: 'Initial batch purchase for the month',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The batch has been successfully created.',
    type: ResponseBatchDto,
    schema: {
      example: {
        id: 'uuid-of-batch',
        code: 'BATCH-001',
        purchase_date: '2025-12-01',
        green_kg: 1000,
        green_kg_available: 1000,
        producer: 'Finca La Esmeralda',
        origin: 'Colombia',
        variety: 'Castillo',
        process: 'Washed',
        altitude_masl: 1800,
        total_cost: 5000.00,
        cost_per_kg: 5.00,
        status: BatchStatus.RAW,
        observations: 'Initial batch purchase for the month',
        created_at: '2025-12-06T10:00:00.000Z',
        updated_at: '2025-12-06T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createBatchDto: CreateBatchDto, @CurrentUser() currentUser: User) {
    return this.batchesService.create(createBatchDto, currentUser);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get all batches with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'A paginated list of batches.',
    type: [ResponseBatchDto],
    schema: {
      example: [
        {
          id: 'uuid-of-batch',
          code: 'BATCH-001',
          purchase_date: '2025-12-01',
          green_kg: 1000,
          green_kg_available: 900,
          producer: 'Finca La Esmeralda',
          origin: 'Colombia',
          variety: 'Castillo',
          process: 'Washed',
          altitude_masl: 1800,
          total_cost: 5000.00,
          cost_per_kg: 5.00,
          status: BatchStatus.IN_PROCESS,
          observations: 'Initial batch purchase for the month',
          created_at: '2025-12-06T10:00:00.000Z',
          updated_at: '2025-12-06T10:00:00.000Z',
          deleted_at: null,
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(@Query() filterDto: FilterBatchDto) {
    return this.batchesService.findAll(filterDto);
  }

  @Get(':id/summary')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get a summary of a batch with its expenses' })
  @ApiParam({ name: 'id', description: 'Batch ID' })
  @ApiResponse({
    status: 200,
    description: 'The batch summary.',
    type: SummaryBatchDto,
    schema: {
      example: {
        id: 'uuid-of-batch',
        code: 'BATCH-001',
        purchase_date: '2025-12-01',
        green_kg: 1000,
        green_kg_available: 900,
        producer: 'Finca La Esmeralda',
        origin: 'Colombia',
        variety: 'Castillo',
        process: 'Washed',
        altitude_masl: 1800,
        total_cost: 5000.00,
        cost_per_kg: 5.00,
        status: BatchStatus.IN_PROCESS,
        observations: 'Initial batch purchase for the month',
        created_at: '2025-12-06T10:00:00.000Z',
        updated_at: '2025-12-06T10:00:00.000Z',
        deleted_at: null,
        expenses: [
          {
            id: 'uuid-of-expense',
            amount: 50.00,
            category: 'TRANSPORT',
            description: 'Shipping cost',
            created_at: '2025-12-06T10:00:00.000Z',
            updated_at: '2025-12-06T10:00:00.000Z',
          },
        ],
        summary: {
          totalExpenses: 50.00,
          totalCost: 5050.00,
          costPerKg: 5.05,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Batch not found.' })
  getSummary(@Param('id') id: string) {
    return this.batchesService.getSummary(id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get a batch by ID' })
  @ApiParam({ name: 'id', description: 'Batch ID' })
  @ApiResponse({
    status: 200,
    description: 'The batch.',
    type: ResponseBatchDto,
    schema: {
      example: {
        id: 'uuid-of-batch',
        code: 'BATCH-001',
        purchase_date: '2025-12-01',
        green_kg: 1000,
        green_kg_available: 900,
        producer: 'Finca La Esmeralda',
        origin: 'Colombia',
        variety: 'Castillo',
        process: 'Washed',
        altitude_masl: 1800,
        total_cost: 5000.00,
        cost_per_kg: 5.00,
        status: BatchStatus.IN_PROCESS,
        observations: 'Initial batch purchase for the month',
        created_at: '2025-12-06T10:00:00.000Z',
        updated_at: '2025-12-06T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Batch not found.' })
  findOne(@Param('id') id: string) {
    return this.batchesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a batch' })
  @ApiParam({ name: 'id', description: 'Batch ID' })
  @ApiBody({
    type: UpdateBatchDto,
    examples: {
      a: {
        summary: 'Update Batch Status',
        value: {
          status: BatchStatus.FINISHED,
          observations: 'Batch fully consumed',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The batch has been successfully updated.',
    type: ResponseBatchDto,
    schema: {
      example: {
        id: 'uuid-of-batch',
        code: 'BATCH-001',
        purchase_date: '2025-12-01',
        green_kg: 1000,
        green_kg_available: 0,
        producer: 'Finca La Esmeralda',
        origin: 'Colombia',
        variety: 'Castillo',
        process: 'Washed',
        altitude_masl: 1800,
        total_cost: 5000.00,
        cost_per_kg: 5.00,
        status: BatchStatus.FINISHED,
        observations: 'Batch fully consumed',
        created_at: '2025-12-06T10:00:00.000Z',
        updated_at: '2025-12-06T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Batch not found.' })
  update(@Param('id') id: string, @Body() updateBatchDto: UpdateBatchDto) {
    return this.batchesService.update(id, updateBatchDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete a batch (soft delete)' })
  @ApiParam({ name: 'id', description: 'Batch ID' })
  @ApiResponse({ status: 200, description: 'The batch has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Batch not found.' })
  remove(@Param('id') id: string) {
    return this.batchesService.remove(id);
  }
}
