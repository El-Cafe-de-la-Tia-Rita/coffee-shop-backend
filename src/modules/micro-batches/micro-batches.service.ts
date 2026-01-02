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
      roasted_kg_obtained,
      roast_type,
      productOutputs,
      expenses,
      ...microBatchData
    } = createMicroBatchDto;

    const parentBatch = await this.batchesRepository.findOneBy({ id: batchId });
    if (!parentBatch) {
      throw new NotFoundException(`Batch with ID "${batchId}" not found`);
    }

    if (parentBatch.green_kg_available < green_kg_used) {
      throw new BadRequestException('Not enough green coffee available in the batch');
    }

    let total_weight_of_products = 0;
    const productsToCreate: Product[] = [];
    const inventoryMovementsToCreate: InventoryMovement[] = [];

    // Temporary storage for product catalogs to avoid re-fetching
    const productCatalogsMap = new Map<string, ProductCatalog>();

    for (const output of productOutputs) {
      let productCatalog = productCatalogsMap.get(output.productCatalogId);
      if (!productCatalog) {
        productCatalog = await this.productCatalogRepository.findOneBy({ id: output.productCatalogId });
        if (!productCatalog) {
          throw new NotFoundException(`ProductCatalog with ID "${output.productCatalogId}" not found`);
        }
        productCatalogsMap.set(output.productCatalogId, productCatalog);
      }

      total_weight_of_products += (productCatalog.weight_grams / 1000) * output.count;

      const newProduct = this.productsRepository.create({
        product_catalog: productCatalog,
        grind_type: output.grindType,
        stock_current: output.count,
        stock_reserved: 0,
        stock_minimum: 0,
        sale_price: productCatalog.base_price,
        unit_cost: 0, // Temporary, will be updated after microbatch is saved with expenses
        active: true,
      });
      productsToCreate.push(newProduct);

      const productInventoryMovement = this.inventoryMovementsRepository.create({
        quantity: output.count,
        movement_type: MovementType.INBOUND,
        product_stock: newProduct,
        user: currentUser,
        unit: productCatalog.package_type,
        movement_date: new Date(),
        reason: InventoryMovementReason.MICROBATCH_PRODUCTION,
      });
      inventoryMovementsToCreate.push(productInventoryMovement);
    }

    if (total_weight_of_products > roasted_kg_obtained) {
      throw new BadRequestException('Total weight of products cannot exceed the roasted coffee obtained.');
    }

    const loss_kg = green_kg_used - roasted_kg_obtained;
    if (loss_kg < 0) {
      throw new BadRequestException('Roasted weight obtained cannot exceed green coffee used');
    }
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

    parentBatch.green_kg_available -= green_kg_used;
    if (parentBatch.green_kg_available <= 0) {
      parentBatch.status = BatchStatus.FINISHED;
    } else {
      parentBatch.status = BatchStatus.IN_PROCESS;
    }
    await this.batchesRepository.save(parentBatch);

    if (expenses && expenses.length > 0) {
      for (const expenseDto of expenses) {
        const expense = this.expensesRepository.create({
          ...expenseDto,
          microbatch: savedMicroBatch, // Link to the newly created microbatch
          date: new Date().toISOString().split('T')[0],
          responsible: currentUser.name,
          receipt_url: 'N/A', // Default value
        });
        await this.expensesRepository.save(expense);
      }
    }
    
    // After microbatch is saved and expenses are linked, fetch again to get all relations for unit_cost calculation
    const microBatchWithRelations = await this.microBatchesRepository.findOne({
      where: { id: savedMicroBatch.id },
      relations: ['batch', 'batch.expenses', 'expenses'],
    });

    if (!microBatchWithRelations) {
        throw new NotFoundException('MicroBatch with relations not found after creation.');
    }

    // Calculate Unit Cost for each product
    const batchExpenses = microBatchWithRelations.batch.expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0,
    );
    const totalBatchCost = Number(microBatchWithRelations.batch.total_cost) + batchExpenses;
    const proratedBatchCost =
      (Number(microBatchWithRelations.green_kg_used) / Number(microBatchWithRelations.batch.green_kg)) *
      totalBatchCost;

    const directMicroBatchExpenses = microBatchWithRelations.expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0,
    );

    const totalMicroBatchCost = proratedBatchCost + directMicroBatchExpenses;
    
    for (const product of productsToCreate) {
      const productCatalog = productCatalogsMap.get(product.product_catalog.id);
      const unitsProduced =
        Number(microBatchWithRelations.roasted_kg_obtained) /
        (productCatalog.weight_grams / 1000); // Total units from this microbatch
      
      const unitCost = unitsProduced > 0 ? totalMicroBatchCost / unitsProduced : 0;
      product.unit_cost = unitCost;
      product.microbatch = microBatchWithRelations;
      await this.productsRepository.save(product);

      // Save inventory movements here as well, since product now has its final unit_cost
      for (const movement of inventoryMovementsToCreate) {
        if (movement.product_stock.id === product.id) { // Match movement to product
            await this.inventoryMovementsRepository.save(movement);
        }
      }
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
