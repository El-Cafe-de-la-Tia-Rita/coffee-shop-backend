import { ApiProperty } from '@nestjs/swagger';
import { MovementType } from '@common/enums/movement-type.enum';
import { InventoryMovementReason } from '@common/enums/inventory-movement-reason.enum';
import { ResponseProductStockDto } from '@modules/products/dto/response-product.dto';
import { ResponseBatchDto } from '@modules/batches/dto/response-batch.dto';

export class ResponseInventoryMovementDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => ResponseProductStockDto, nullable: true })
  product_stock?: ResponseProductStockDto;

  @ApiProperty({ type: () => ResponseBatchDto, nullable: true })
  batch?: ResponseBatchDto;

  @ApiProperty({ enum: MovementType })
  movement_type: MovementType;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unit: string;

  @ApiProperty({ enum: InventoryMovementReason, nullable: true })
  reason?: InventoryMovementReason;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  user: { id: string; name: string }; // Simplified user response

  @ApiProperty()
  movement_date: Date;

  @ApiProperty()
  created_at: Date;
}
