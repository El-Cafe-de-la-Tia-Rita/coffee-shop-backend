import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { FilterInventoryMovementDto } from './dto/filter-inventory-movement.dto';
import { PaginationResult } from '@common/interfaces/pagination-result.interface';
import { Product } from '../products/entities/product.entity';
import { ProductCatalog } from '../products/entities/product-catalog.entity';
import { InventorySummaryDto, InventorySummaryItemDto } from './dto/inventory-summary.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryMovement)
    private inventoryMovementsRepository: Repository<InventoryMovement>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductCatalog)
    private productCatalogRepository: Repository<ProductCatalog>,
  ) {}

  async findAllMovements(filterDto: FilterInventoryMovementDto): Promise<PaginationResult<InventoryMovement>> {
    const { page = 1, limit = 10, productId, batchId, movementType, reason, startDate, endDate } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.inventoryMovementsRepository.createQueryBuilder('movement');
    queryBuilder.leftJoinAndSelect('movement.product_stock', 'product_stock');
    queryBuilder.leftJoinAndSelect('movement.batch', 'batch');
    queryBuilder.leftJoinAndSelect('movement.user', 'user');

    if (productId) {
      queryBuilder.andWhere('product_stock.id = :productId', { productId });
    }
    if (batchId) {
      queryBuilder.andWhere('batch.id = :batchId', { batchId });
    }
    if (movementType) {
      queryBuilder.andWhere('movement.movement_type = :movementType', { movementType });
    }
    if (reason) {
      queryBuilder.andWhere('movement.reason = :reason', { reason });
    }
    if (startDate && endDate) {
      queryBuilder.andWhere('movement.movement_date BETWEEN :startDate AND :endDate', { startDate, endDate });
    } else if (startDate) {
      queryBuilder.andWhere('movement.movement_date >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('movement.movement_date <= :endDate', { endDate });
    }

    const [data, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .orderBy('movement.movement_date', 'DESC')
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async getCurrentInventorySummary(): Promise<InventorySummaryDto> {
    const products = await this.productsRepository.find({
      relations: ['product_catalog'],
      where: { active: true },
    });

    const summaryItems: InventorySummaryItemDto[] = [];
    let totalProducts = 0;
    let totalLowStockProducts = 0;

    for (const product of products) {
      const productCatalog = product.product_catalog;
      if (!productCatalog) continue;

      const lowStockAlert = product.stock_current <= product.stock_minimum;
      if (lowStockAlert) {
        totalLowStockProducts++;
      }

      summaryItems.push({
        productCatalogId: productCatalog.id,
        productCatalogName: productCatalog.name,
        productCatalogCode: productCatalog.code,
        packageType: productCatalog.package_type,
        weightGrams: productCatalog.weight_grams,
        grindType: product.grind_type,
        totalStockCurrent: product.stock_current,
        totalStockReserved: product.stock_reserved,
        totalStockMinimum: product.stock_minimum,
        lowStockAlert: lowStockAlert,
      });
      totalProducts++;
    }

    // Group by product catalog and grind type to aggregate stock
    const aggregatedSummary = summaryItems.reduce((acc, item) => {
      const key = `${item.productCatalogId}-${item.grindType}`;
      if (!acc[key]) {
        acc[key] = {
          productCatalogId: item.productCatalogId,
          productCatalogName: item.productCatalogName,
          productCatalogCode: item.productCatalogCode,
          packageType: item.packageType,
          weightGrams: item.weightGrams,
          grindType: item.grindType,
          totalStockCurrent: 0,
          totalStockReserved: 0,
          totalStockMinimum: 0,
          lowStockAlert: false, // Will re-evaluate after aggregation
        };
      }
      acc[key].totalStockCurrent += item.totalStockCurrent;
      acc[key].totalStockReserved += item.totalStockReserved;
      acc[key].totalStockMinimum += item.totalStockMinimum; // This should be the max or sum of minimums across different Product entities of same catalog/grind
      return acc;
    }, {} as Record<string, InventorySummaryItemDto>);

    // Re-evaluate low stock for aggregated items
    const finalSummary = Object.values(aggregatedSummary).map(item => {
      item.lowStockAlert = item.totalStockCurrent <= item.totalStockMinimum;
      return item;
    });

    return {
      summary: finalSummary,
      totalProducts,
      totalLowStockProducts,
    };
  }
}
