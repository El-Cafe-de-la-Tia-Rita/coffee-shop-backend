import { IsString, IsNotEmpty, IsDateString, IsNumber, Min, IsOptional, IsEnum, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderOrigin } from '@common/enums/order-origin.enum';
import { PaymentMethod } from '@common/enums/payment-method.enum';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  // Client identification (either existing client ID or new client details)
  @ApiProperty({ description: 'ID of an existing client, required if not creating a new client', required: false })
  @IsString()
  @IsOptional()
  clientId?: string;

  // New client details (for public form creation)
  @ApiProperty({ description: 'Name of the new client, required if clientId is not provided', required: false })
  @IsString()
  @IsOptional()
  clientName?: string;

  @ApiProperty({ description: 'Email of the new client, required if clientId is not provided', required: false })
  @IsString()
  @IsOptional()
  clientEmail?: string;

  @ApiProperty({ description: 'Phone of the new client, required if clientId is not provided', required: false })
  @IsString()
  @IsOptional()
  clientPhone?: string;

  // Order details
  @ApiProperty({ description: 'Estimated delivery date for the order' })
  @IsDateString()
  @IsNotEmpty()
  delivery_date_estimated: string;

  @ApiProperty({ description: 'Full delivery address for the order' })
  @IsString()
  @IsNotEmpty()
  delivery_address: string;

  @ApiProperty({ enum: OrderOrigin, description: 'Origin of the order (e.g., WEB, FORM, POS)' })
  @IsEnum(OrderOrigin)
  @IsNotEmpty()
  origin: OrderOrigin;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method used for the order' })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  payment_method: PaymentMethod;

  @ApiProperty({ description: 'Any additional notes for the order', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Discount applied to the order total', required: false, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number = 0;

  @ApiProperty({ description: 'Shipping cost for the order', required: false, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  shipping?: number = 0;

  // Order items
  @ApiProperty({ type: [CreateOrderItemDto], description: 'List of products included in the order' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];
}

