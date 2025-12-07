import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { FilterInventoryMovementDto } from './dto/filter-inventory-movement.dto';
import { ResponseInventoryMovementDto } from './dto/response-inventory-movement.dto';
import { InventorySummaryDto } from './dto/inventory-summary.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('movements')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get inventory movement history with filters' })
  @ApiResponse({
    status: 200,
    description: 'A paginated list of inventory movements.',
    type: [ResponseInventoryMovementDto],
    schema: {
      example: [
        {
          id: 'uuid-of-movement',
          product_stock: { id: 'uuid-of-product', sku: 'RC-250G-DRK-WB-001' },
          batch: { id: 'uuid-of-batch', code: 'BATCH-001' },
          movement_type: 'INBOUND',
          quantity: 1000,
          unit: 'kg',
          reason: 'BATCH_PURCHASE',
          reference: 'PO-123',
          user: { id: 'uuid-of-user', name: 'Admin User' },
          movement_date: '2025-12-06T10:00:00.000Z',
          created_at: '2025-12-06T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAllMovements(@Query() filterDto: FilterInventoryMovementDto) {
    return this.inventoryService.findAllMovements(filterDto);
  }

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get current inventory summary' })
  @ApiResponse({ status: 200, description: 'A summary of current inventory.', type: InventorySummaryDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getCurrentSummary() {
    return this.inventoryService.getCurrentInventorySummary();
  }
}
