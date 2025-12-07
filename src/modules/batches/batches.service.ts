import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, DataSource } from 'typeorm';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { Batch } from './entities/batch.entity';
import { FilterBatchDto } from './dto/filter-batch.dto';
import { PaginationResult } from '../../common/interfaces/pagination-result.interface';
import { Expense } from '../expenses/entities/expense.entity';
import { BatchStatus } from '../../common/enums/batch-status.enum';
import { InventoryMovement } from '../inventory/entities/inventory-movement.entity';
import { User } from '../../modules/users/entities/user.entity';
import { ExpenseCategory } from '../../common/enums/expense-category.enum';
import { MovementType } from '../../common/enums/movement-type.enum';
import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { InventoryMovementReason } from '../../common/enums/inventory-movement-reason.enum';

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(Batch)
    private batchesRepository: Repository<Batch>,
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    @InjectRepository(InventoryMovement)
    private inventoryMovementsRepository: Repository<InventoryMovement>,
    private dataSource: DataSource,
  ) {}

  async create(createBatchDto: CreateBatchDto, currentUser: User): Promise<Batch> {
    const { green_kg, total_cost } = createBatchDto;
    const cost_per_kg = total_cost / green_kg;

    return this.dataSource.transaction(async (manager) => {
      const batchRepository = manager.getRepository(Batch);
      const expenseRepository = manager.getRepository(Expense);
      const inventoryMovementRepository = manager.getRepository(InventoryMovement);

      const newBatch = batchRepository.create({
        ...createBatchDto,
        green_kg_available: green_kg,
        cost_per_kg,
        status: BatchStatus.RAW,
      });

      const savedBatch = await batchRepository.save(newBatch);

      // Create associated Expense record
      const expense = expenseRepository.create({
        amount: total_cost,
        category: ExpenseCategory.PURCHASE,
        description: `Purchase of batch ${savedBatch.code}`,
        batch: savedBatch,
        date: savedBatch.purchase_date,
        concept: `Batch ${savedBatch.code} purchase`,
        provider: savedBatch.producer,
        responsible: currentUser.name,
        payment_method: PaymentMethod.OTHER,
        receipt_url: 'N/A',
      });
      await expenseRepository.save(expense);

      // Create associated InventoryMovement record
      const inventoryMovement = inventoryMovementRepository.create({
        quantity: green_kg,
        movement_type: MovementType.INBOUND,
        batch: savedBatch,
        user: currentUser,
        unit: 'kg',
        movement_date: new Date(),
        reason: InventoryMovementReason.BATCH_PURCHASE,
      });
      await inventoryMovementRepository.save(inventoryMovement);

      return savedBatch;
    });
  }

  async findAll(filterDto: FilterBatchDto): Promise<PaginationResult<Batch>> {
    const { page = 1, limit = 10, code, producer, origin, status } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (code) where.code = ILike(`%${code}%`);
    if (producer) where.producer = ILike(`%${producer}%`);
    if (origin) where.origin = ILike(`%${origin}%`);
    if (status) where.status = status;

    const [data, total] = await this.batchesRepository.findAndCount({
      where,
      take: limit,
      skip,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Batch> {
    const batch = await this.batchesRepository.findOneBy({ id });
    if (!batch) {
      throw new NotFoundException(`Batch with ID "${id}" not found`);
    }
    return batch;
  }

  async update(id: string, updateBatchDto: UpdateBatchDto): Promise<Batch> {
    const batch = await this.findOne(id);

    const new_total_cost = updateBatchDto.total_cost ?? batch.total_cost;
    const new_green_kg = updateBatchDto.green_kg ?? batch.green_kg;
    const cost_per_kg = new_total_cost / new_green_kg;
    
    await this.batchesRepository.update(id, {...updateBatchDto, cost_per_kg});
    
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const deleteResult = await this.batchesRepository.softDelete(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Batch with ID "${id}" not found`);
    }
  }

  async getSummary(id: string) {
    const batch = await this.findOne(id);
    const expenses = await this.expensesRepository.find({
      where: { batch: { id } },
    });

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalCost = batch.total_cost + totalExpenses;
    const costPerKg = totalCost / batch.green_kg;

    return {
      ...batch,
      expenses,
      summary: {
        totalExpenses,
        totalCost,
        costPerKg,
      },
    };
  }
}
