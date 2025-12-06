import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CreateMicroBatchDto } from './dto/create-micro-batch.dto';
import { UpdateMicroBatchDto } from './dto/update-micro-batch.dto';
import { MicroBatch } from './entities/micro-batch.entity';
import { Batch } from '../batches/entities/batch.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { InventoryMovement } from '../inventory/entities/inventory-movement.entity';
import { Product } from '../products/entities/product.entity';
import { ProductCatalog } from '../products/entities/product-catalog.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { ExpenseCategory } from 'src/common/enums/expense-category.enum';
import { MovementType } from 'src/common/enums/movement-type.enum';
import { BatchStatus } from 'src/common/enums/batch-status.enum';
import { PaymentMethod } from 'src/common/enums/payment-method.enum';
import { GrindType } from 'src/common/enums/grind-type.enum';
import { InventoryMovementReason } from 'src/common/enums/inventory-movement-reason.enum';

@Injectable()
export class MicroBatchesService {
  constructor(
    @InjectRepository(MicroBatch)
    private microBatchesRepository: Repository<MicroBatch>,
    @InjectRepository(Batch)
    private batchesRepository: Repository<Batch>,
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    @InjectRepository(InventoryMovement)
    private inventoryMovementsRepository: Repository<InventoryMovement>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductCatalog)
    private productCatalogRepository: Repository<ProductCatalog>,
  ) {}

  async create(createMicroBatchDto: CreateMicroBatchDto, currentUser: User): Promise<MicroBatch> {
    const {
      batchId,
      green_kg_used,
      roasted_kg_obtained,
      production_cost,
      roast_type,
      ...microBatchData
    } = createMicroBatchDto;

    const parentBatch = await this.batchesRepository.findOneBy({ id: batchId });
    if (!parentBatch) {
      throw new NotFoundException(`Batch with ID "${batchId}" not found`);
    }

    if (parentBatch.green_kg_available < green_kg_used) {
      throw new BadRequestException('Not enough green coffee available in the batch');
    }

    // Calculate shrinkage
    const loss_kg = green_kg_used - roasted_kg_obtained;
    const loss_percentage = (loss_kg / green_kg_used) * 100;

    const newMicroBatch = this.microBatchesRepository.create({
      ...microBatchData,
      batch: parentBatch,
      green_kg_used,
      roasted_kg_obtained,
      loss_kg,
      loss_percentage,
      roast_type,
    });

    const savedMicroBatch = await this.microBatchesRepository.save(newMicroBatch);

    // Update parent Batch's available green_kg and status
    parentBatch.green_kg_available -= green_kg_used;
    if (parentBatch.green_kg_available <= 0) {
      parentBatch.status = BatchStatus.FINISHED;
    } else {
      parentBatch.status = BatchStatus.IN_PROCESS; // Assume it's in process if some used
    }
    await this.batchesRepository.save(parentBatch);

    // Create associated Expense record if production_cost is provided
    if (production_cost) {
      const expense = this.expensesRepository.create({
        amount: production_cost,
        category: ExpenseCategory.PRODUCTION,
        description: `Production cost for micro-batch ${savedMicroBatch.code}`,
        batch: parentBatch, // Link expense to the parent batch
      });
      await this.expensesRepository.save(expense);
    }

    // Auto-generate Product Stock
    // Find a generic ProductCatalog for roasted coffee (e.g., based on name or type)
    const roastedCoffeeProductCatalog = await this.productCatalogRepository.findOneBy({
      name: 'Roasted Coffee', // This would ideally be more specific, e.g., 'Roasted Coffee - {roast_type}'
    });

    if (!roastedCoffeeProductCatalog) {
      throw new NotFoundException('Generic "Roasted Coffee" product catalog entry not found. Please create one.');
    }

    const newProduct = this.productsRepository.create({
      product_catalog: roastedCoffeeProductCatalog,
      microbatch: savedMicroBatch,
      sku: `${savedMicroBatch.code}-${roast_type}-PROD`, // Example SKU generation
      grind_type: GrindType.WHOLE_BEAN, // Default for initial stock, can be updated later
      stock_current: roasted_kg_obtained,
      stock_reserved: 0,
      stock_minimum: 0,
      sale_price: roastedCoffeeProductCatalog.base_price * 1.5, // Example calculation
      unit_cost: parentBatch.cost_per_kg,
      active: true,
    });
    await this.productsRepository.save(newProduct);

    // Create InventoryMovement for Product Stock
    const productInventoryMovement = this.inventoryMovementsRepository.create({
      quantity: roasted_kg_obtained,
      movement_type: MovementType.INBOUND,
      product_stock: newProduct,
      user: currentUser,
      unit: 'kg', // Assuming roasted_kg_obtained is in kg
      movement_date: new Date(),
      reason: InventoryMovementReason.MICROBATCH_PRODUCTION, // Use a specific reason
    });
    await this.inventoryMovementsRepository.save(productInventoryMovement);


    return savedMicroBatch;
  }

  // Generic CRUD for MicroBatches
  async findAll(): Promise<MicroBatch[]> {
    return this.microBatchesRepository.find();
  }

  async findOne(id: string): Promise<MicroBatch> {
    const microBatch = await this.microBatchesRepository.findOneBy({ id });
    if (!microBatch) {
      throw new NotFoundException(`MicroBatch with ID "${id}" not found`);
    }
    return microBatch;
  }

  async update(id: string, updateMicroBatchDto: UpdateMicroBatchDto): Promise<MicroBatch> {
    const updateResult = await this.microBatchesRepository.update(id, updateMicroBatchDto);
    if (updateResult.affected === 0) {
      throw new NotFoundException(`MicroBatch with ID "${id}" not found`);
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const deleteResult = await this.microBatchesRepository.softDelete(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`MicroBatch with ID "${id}" not found`);
    }
  }
}
