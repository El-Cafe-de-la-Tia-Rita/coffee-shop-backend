import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';
import { OrderOrigin } from '../../../common/enums/order-origin.enum';

export class FilterOrderDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ enum: OrderOrigin })
  @IsOptional()
  @IsEnum(OrderOrigin)
  origin?: OrderOrigin;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  paymentConfirmed?: boolean;
}
