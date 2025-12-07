import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { MicroBatchesService } from './micro-batches.service';
import { CreateMicroBatchDto } from './dto/create-micro-batch.dto';
import { UpdateMicroBatchDto } from './dto/update-micro-batch.dto';
import { ResponseMicroBatchDto } from './dto/response-micro-batch.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { RoastType } from 'src/common/enums/roast-type.enum';
import { GrindType } from 'src/common/enums/grind-type.enum'; // Import GrindType for examples

@ApiTags('Micro Batches')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('micro-batches')
export class MicroBatchesController {
  constructor(private readonly microBatchesService: MicroBatchesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new micro-batch' })
  @ApiBody({
    type: CreateMicroBatchDto,
    examples: {
      a: {
        summary: 'New Micro Batch with multiple product outputs',
        value: {
          batchId: 'uuid-of-parent-batch',
          code: 'MB001',
          roast_number: 1,
          roast_date: '2025-12-06',
          green_kg_used: 10,
          roast_type: RoastType.DARK,
          roast_responsible: 'Jane Doe',
          observations: 'First roast of the day, producing 250g bags and 100g samples',
          production_cost: 15.00,
          productOutputs: [
            {
              productCatalogId: 'uuid-of-roasted-250g-bag-catalog', // Example: Roasted Coffee 250g Bag
              count: 20, // 20 units of 250g bags
              grindType: GrindType.WHOLE_BEAN,
            },
            {
              productCatalogId: 'uuid-of-roasted-100g-sample-catalog', // Example: Roasted Coffee 100g Sample
              count: 5, // 5 units of 100g samples
              grindType: GrindType.COARSE,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The micro-batch has been successfully created.',
    type: ResponseMicroBatchDto,
    schema: {
      example: {
        id: 'uuid-of-microbatch',
        batch: {
          id: 'uuid-of-parent-batch',
          code: 'BATCH-001',
          // ... other batch details
        },
        code: 'MB001',
        roast_number: 1,
        roast_date: '2025-12-06',
        green_kg_used: 10,
        total_roasted_kg_obtained: 5.5, // Calculated from product outputs
        loss_kg: 4.5,
        loss_percentage: 45.00,
        roast_type: RoastType.DARK,
        roast_responsible: 'Jane Doe',
        observations: 'First roast of the day, producing 250g bags and 100g samples',
        created_at: '2025-12-06T10:00:00.000Z',
        updated_at: '2025-12-06T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Batch not found or product catalog entry not found.' })
  create(@Body() createMicroBatchDto: CreateMicroBatchDto, @CurrentUser() currentUser: User) {
    return this.microBatchesService.create(createMicroBatchDto, currentUser);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get all micro-batches' })
  @ApiResponse({
    status: 200,
    description: 'A list of micro-batches.',
    type: [ResponseMicroBatchDto],
    schema: {
      example: [
        {
          id: 'uuid-of-microbatch',
          batch: {
            id: 'uuid-of-parent-batch',
            code: 'BATCH-001',
            // ... other batch details
          },
          code: 'MB001',
          roast_number: 1,
          roast_date: '2025-12-06',
          green_kg_used: 10,
          total_roasted_kg_obtained: 5.5,
          loss_kg: 4.5,
          loss_percentage: 45.00,
          roast_type: RoastType.DARK,
          roast_responsible: 'Jane Doe',
          observations: 'First roast of the day, producing 250g bags and 100g samples',
          created_at: '2025-12-06T10:00:00.000Z',
          updated_at: '2025-12-06T10:00:00.000Z',
          deleted_at: null,
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll() {
    return this.microBatchesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get a micro-batch by ID' })
  @ApiParam({ name: 'id', description: 'Micro Batch ID' })
  @ApiResponse({
    status: 200,
    description: 'The micro-batch.',
    type: ResponseMicroBatchDto,
    schema: {
      example: {
        id: 'uuid-of-microbatch',
        batch: {
          id: 'uuid-of-parent-batch',
          code: 'BATCH-001',
          // ... other batch details
        },
        code: 'MB001',
        roast_number: 1,
        roast_date: '2025-12-06',
        green_kg_used: 10,
        total_roasted_kg_obtained: 5.5,
        loss_kg: 4.5,
        loss_percentage: 45.00,
        roast_type: RoastType.DARK,
        roast_responsible: 'Jane Doe',
        observations: 'First roast of the day, producing 250g bags and 100g samples',
        created_at: '2025-12-06T10:00:00.000Z',
        updated_at: '2025-12-06T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Micro Batch not found.' })
  findOne(@Param('id') id: string) {
    return this.microBatchesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Update a micro-batch' })
  @ApiParam({ name: 'id', description: 'Micro Batch ID' })
  @ApiBody({
    type: UpdateMicroBatchDto,
    examples: {
      a: {
        summary: 'Update Micro Batch Observations',
        value: {
          observations: 'Second roast of the day, improved',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The micro-batch has been successfully updated.',
    type: ResponseMicroBatchDto,
    schema: {
      example: {
        id: 'uuid-of-microbatch',
        batch: {
          id: 'uuid-of-parent-batch',
          code: 'BATCH-001',
          // ... other batch details
        },
        code: 'MB001',
        roast_number: 1,
        roast_date: '2025-12-06',
        green_kg_used: 10,
        total_roasted_kg_obtained: 5.5,
        loss_kg: 4.5,
        loss_percentage: 45.00,
        roast_type: RoastType.DARK,
        roast_responsible: 'Jane Doe',
        observations: 'Second roast of the day, improved',
        created_at: '2025-12-06T10:00:00.000Z',
        updated_at: '2025-12-06T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Micro Batch not found.' })
  update(@Param('id') id: string, @Body() updateMicroBatchDto: UpdateMicroBatchDto) {
    return this.microBatchesService.update(id, updateMicroBatchDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete a micro-batch (soft delete)' })
  @ApiParam({ name: 'id', description: 'Micro Batch ID' })
  @ApiResponse({ status: 200, description: 'The micro-batch has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Micro Batch not found.' })
  remove(@Param('id') id: string) {
    return this.microBatchesService.remove(id);
  }
}
