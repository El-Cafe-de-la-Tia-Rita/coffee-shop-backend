import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ResponseOrderDto } from './dto/response-order.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { OrderOrigin } from 'src/common/enums/order-origin.enum';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';

@ApiTags('Public Form')
@Controller('orders/public')
export class PublicOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order (public form)' })
  @ApiBody({
    type: CreateOrderDto,
    examples: {
      publicOrder: {
        summary: 'Order for new client via public form',
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
  @ApiResponse({ status: 201, description: 'Order created successfully (public form).', type: ResponseOrderDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Client with provided email/phone already exists.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  createPublicOrder(@Body() createOrderDto: CreateOrderDto) {
    // For public orders, responsible user can be a generic system user or undefined
    return this.ordersService.create(createOrderDto, undefined);
  }
}
