import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';
import { DashboardSalesMetricsDto } from './dto/dashboard-sales-metrics.dto';
import { DashboardInventoryMetricsDto } from './dto/dashboard-inventory-metrics.dto';
import { DashboardTopClientsDto } from './dto/dashboard-top-clients.dto';
import { DashboardTopProductsDto } from './dto/dashboard-top-products.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get a financial overview (Total Sales, Expenses, Net Profit)' })
  @ApiResponse({ status: 200, type: DashboardOverviewDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getOverview(@Query() filter: DashboardFilterDto) {
    return this.dashboardService.getOverview(filter);
  }

  @Get('sales-metrics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get sales performance metrics (Avg Revenue per Order, Total Units Sold)' })
  @ApiResponse({ status: 200, type: DashboardSalesMetricsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getSalesMetrics(@Query() filter: DashboardFilterDto) {
    return this.dashboardService.getSalesMetrics(filter);
  }

  @Get('inventory-metrics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get inventory performance metrics (Total Available Stock, % Sold)' })
  @ApiResponse({ status: 200, type: DashboardInventoryMetricsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getInventoryMetrics(@Query() filter: DashboardFilterDto) {
    return this.dashboardService.getInventoryMetrics(filter);
  }

  @Get('top-clients')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get top clients by total amount purchased' })
  @ApiResponse({ status: 200, type: DashboardTopClientsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getTopClients() {
    return this.dashboardService.getTopClients();
  }

  @Get('top-products')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get top products by quantity sold' })
  @ApiResponse({ status: 200, type: DashboardTopProductsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getTopProducts() {
    return this.dashboardService.getTopProducts();
  }
}
