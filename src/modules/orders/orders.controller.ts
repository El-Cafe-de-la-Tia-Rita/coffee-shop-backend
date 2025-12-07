import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ResponseOrderDto } from './dto/response-order.dto';
import { OrderStatsDto } from './dto/order-stats.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { OrderOrigin } from 'src/common/enums/order-origin.enum';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Protected endpoint for admin/manager/staff to create orders
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Create a new order (staff/admin only)' })
  @ApiBody({
    type: CreateOrderDto,
    examples: {
      staffOrder: {
        summary: 'Order for existing client',
        value: {
          clientId: 'uuid-of-existing-client',
          delivery_date_estimated: '2025-12-10',
          delivery_address: '123 Main St, Anytown',
          origin: OrderOrigin.WEBSITE,
          payment_method: PaymentMethod.CASH,
          notes: 'Customer requested quick delivery.',
          discount: 5.00,
          shipping: 3.00,
          orderItems: [
            { productId: 'uuid-of-product-stock-1', quantity: 2 },
            { productId: 'uuid-of-product-stock-2', quantity: 1 },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Order created successfully.', type: ResponseOrderDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Client or Product not found.' })
  createOrder(@Body() createOrderDto: CreateOrderDto, @CurrentUser() currentUser: User) {
    return this.ordersService.create(createOrderDto, currentUser);
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
