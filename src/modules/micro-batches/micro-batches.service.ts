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
import { User } from '@modules/users/entities/user.entity';
import { ExpenseCategory } from '@common/enums/expense-category.enum';
import { MovementType } from '@common/enums/movement-type.enum';
import { BatchStatus } from '@common/enums/batch-status.enum';
import { PaymentMethod } from '@common/enums/payment-method.enum';
import { InventoryMovementReason } from '@common/enums/inventory-movement-reason.enum';


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
      production_cost,
      roast_type,
      productOutputs,
      provider,
      ...microBatchData
    } = createMicroBatchDto;

    const parentBatch = await this.batchesRepository.findOneBy({ id: batchId });
    if (!parentBatch) {
      throw new NotFoundException(`Batch with ID "${batchId}" not found`);
    }

    if (parentBatch.green_kg_available < green_kg_used) {
      throw new BadRequestException('Not enough green coffee available in the batch');
    }

    // Calculate total roasted_kg_obtained from productOutputs
    let total_roasted_kg_obtained = 0;
    const productsToCreate: Product[] = [];
    const inventoryMovementsToCreate: InventoryMovement[] = [];

    for (const output of productOutputs) {
      const productCatalog = await this.productCatalogRepository.findOneBy({ id: output.productCatalogId });
      if (!productCatalog) {
        throw new NotFoundException(`ProductCatalog with ID "${output.productCatalogId}" not found`);
      }

      const roasted_grams_per_unit = productCatalog.weight_grams * output.count;
      total_roasted_kg_obtained += roasted_grams_per_unit / 1000; // Convert to kg

      const newProduct = this.productsRepository.create({
        product_catalog: productCatalog,
        sku: `${microBatchData.code}-${output.grindType}-${productCatalog.code}`, // Example SKU generation
        grind_type: output.grindType,
        stock_current: output.count, // Stock is in units, not kg
        stock_reserved: 0,
        stock_minimum: 0, // Default for now
        sale_price: productCatalog.base_price, // Use base price from catalog
        unit_cost: parentBatch.cost_per_kg * (productCatalog.weight_grams / 1000), // Cost per unit
        active: true,
      });
      productsToCreate.push(newProduct);

      // InventoryMovement for Product Stock
      const productInventoryMovement = this.inventoryMovementsRepository.create({
        quantity: output.count, // Quantity is in units
        movement_type: MovementType.INBOUND,
        product_stock: newProduct,
        user: currentUser,
        unit: productCatalog.package_type, // Unit is from product catalog
        movement_date: new Date(),
        reason: InventoryMovementReason.MICROBATCH_PRODUCTION,
      });
      inventoryMovementsToCreate.push(productInventoryMovement);
    }

    // Calculate shrinkage
    const loss_kg = green_kg_used - total_roasted_kg_obtained;
    const loss_percentage = (loss_kg / green_kg_used) * 100;

    if (loss_kg < 0) {
      throw new BadRequestException('Roasted weight obtained cannot exceed green coffee used');
    }

    const newMicroBatch = this.microBatchesRepository.create({
      ...microBatchData,
      batch: parentBatch,
      green_kg_used,
      roasted_kg_obtained: total_roasted_kg_obtained, // Set total calculated
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
      parentBatch.status = BatchStatus.IN_PROCESS;
    }
    await this.batchesRepository.save(parentBatch);

    // Create associated Expense record if production_cost is provided
    if (production_cost) {
      const expense = this.expensesRepository.create({
        amount: production_cost,
        category: ExpenseCategory.PRODUCTION,
        description: `Production cost for micro-batch ${savedMicroBatch.code}`,
        batch: parentBatch,
        date: new Date().toISOString().split('T')[0], // Today's date for expense
        concept: `MicroBatch ${savedMicroBatch.code} production`,
        responsible: currentUser.name,
        payment_method: PaymentMethod.OTHER,
        receipt_url: 'N/A',
        provider: provider ?? createMicroBatchDto.roast_responsible,
      });
      await this.expensesRepository.save(expense);
    }
    
    // Link products to microbatch and save
    for (const product of productsToCreate) {
      product.microbatch = savedMicroBatch;
      await this.productsRepository.save(product);
    }

    // Link inventory movements to products and save
    for (const movement of inventoryMovementsToCreate) {
      movement.product_stock = movement.product_stock; // Ensure product_stock is linked
      await this.inventoryMovementsRepository.save(movement);
    }

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
