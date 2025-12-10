import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderGeneralDto {
  @ApiProperty({ 
    example: 'Updated delivery instructions: call before arrival.', 
    description: 'Any additional notes for the order.', 
    required: false 
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ 
    example: '123 Main St, Anytown, USA', 
    description: 'The delivery address for the order.', 
    required: false 
  })
  @IsOptional()
  @IsString()
  delivery_address?: string;

  @ApiProperty({ 
    example: '2025-12-25', 
    description: 'Estimated delivery date for the order.', 
    required: false 
  })
  @IsOptional()
  @IsDateString()
  delivery_date_estimated?: string;
}
