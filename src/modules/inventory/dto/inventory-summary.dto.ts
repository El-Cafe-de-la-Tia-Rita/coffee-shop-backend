import { ApiProperty } from '@nestjs/swagger';
import { GrindType } from '../../../common/enums/grind-type.enum';

export class InventorySummaryItemDto {
  @ApiProperty()
  productCatalogId: string;

  @ApiProperty()
  productCatalogName: string;

  @ApiProperty()
  productCatalogCode: string;

  @ApiProperty()
  packageType: string;

  @ApiProperty()
  weightGrams: number;

  @ApiProperty({ enum: GrindType })
  grindType: GrindType;

  @ApiProperty()
  totalStockCurrent: number;

  @ApiProperty()
  totalStockReserved: number;

  @ApiProperty()
  totalStockMinimum: number;

  @ApiProperty()
  lowStockAlert: boolean;
}

export class InventorySummaryDto {
  @ApiProperty({ type: [InventorySummaryItemDto] })
  summary: InventorySummaryItemDto[];

  @ApiProperty()
  totalProducts: number;

  @ApiProperty()
  totalLowStockProducts: number;
}
