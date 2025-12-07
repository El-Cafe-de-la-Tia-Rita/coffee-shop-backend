import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ResponseOrderDto } from './dto/response-order.dto';
import { OrderStatsDto } from './dto/order-stats.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';
import { OrderStatus } from '@common/enums/order-status.enum';
import { OrderOrigin } from '@common/enums/order-origin.enum';
import { PaymentMethod } from '@common/enums/payment-method.enum';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

@Public()
@Post('public')
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ 
  summary: 'Create a new order (public form)',
  description: 'Creates an order from a public form. If a client with the provided email or phone exists, their information will be updated and the order will be linked to them. Otherwise, a new client will be created.'
})
@ApiBody({
  type: CreateOrderDto,
  examples: {
    publicOrder: {
      summary: 'Order for new or existing client via public form',
      value: {
        clientName: 'New Client',
        clientEmail: 'new.client@example.com',
        clientPhone: '+1234567890',
        delivery_date_estimated: '2025-12-11',
        delivery_address: '456 Oak Ave, Otherville',
        origin: OrderOrigin.WEBSITE,
        payment_method: PaymentMethod.PLIN,
        orderItems: [
          { productId: 'uuid-of-product-stock-3', quantity: 1 },
        ],
      },
    },
  },
})
@ApiResponse({ status: 201, description: 'Order created successfully. Client information updated if already exists, or new client created.' })
@ApiResponse({ status: 400, description: 'Bad Request.' })
@ApiResponse({ status: 404, description: 'Product not found.' })
createPublicOrder(@Body() createOrderDto: CreateOrderDto) {
  return this.ordersService.createPublicOrder(createOrderDto);
}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get all orders with pagination and filters' })
  @ApiResponse({ status: 200, description: 'A paginated list of orders.', type: [ResponseOrderDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(@Query() filterDto: FilterOrderDto) {
    return this.ordersService.findAll(filterDto);
  }

  @Get('client/:clientId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get orders by client ID with pagination and filters' })
  @ApiParam({ name: 'clientId', description: 'ID of the client to retrieve orders for.' })
  @ApiResponse({ status: 200, description: 'A paginated list of client orders.', type: [ResponseOrderDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Client not found.' })
  findByClient(@Param('clientId') clientId: string, @Query() filterDto: FilterOrderDto) {
    return this.ordersService.findByClient(clientId, filterDto);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get order statistics' })
  @ApiResponse({ status: 200, description: 'Order statistics.', type: OrderStatsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getStatistics() {
    return this.ordersService.getStatistics();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'The order.', type: ResponseOrderDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Update an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({
    type: UpdateOrderDto,
    examples: {
      updateNotes: {
        summary: 'Update order notes',
        value: { notes: 'Updated delivery instructions: call before arrival.' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'The order has been successfully updated.', type: ResponseOrderDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/status/:status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiParam({ name: 'status', description: 'New status for the order', enum: OrderStatus })
  @ApiResponse({ status: 200, description: 'Order status updated successfully.', type: ResponseOrderDto })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., invalid status transition).' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  updateStatus(
    @Param('id') id: string,
    @Param('status') status: OrderStatus,
    @CurrentUser() currentUser: User,
  ) {
    return this.ordersService.updateStatus(id, status, currentUser);
  }

  @Patch(':id/confirm-payment')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Confirm payment for an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully.', type: ResponseOrderDto })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., payment already confirmed).' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  confirmPayment(@Param('id') id: string) {
    return this.ordersService.confirmPayment(id);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Cancel an order and restore stock' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order cancelled and stock restored.', type: ResponseOrderDto })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., order already cancelled).' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  cancelOrder(@Param('id') id: string, @CurrentUser() currentUser: User) {
    return this.ordersService.cancelOrder(id, currentUser);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete an order (soft delete)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'The order has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
