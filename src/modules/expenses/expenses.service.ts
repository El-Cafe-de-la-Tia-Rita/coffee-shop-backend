import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import { PaginationResult } from '../../common/interfaces/pagination-result.interface';
import { Batch } from '../batches/entities/batch.entity';
import { User } from '../../modules/users/entities/user.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    @InjectRepository(Batch)
    private batchesRepository: Repository<Batch>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, currentUser: User): Promise<Expense> {
    const { batchId, ...expenseData } = createExpenseDto;
    let batch: Batch | null = null;

    if (batchId) {
      batch = await this.batchesRepository.findOneBy({ id: batchId });
      if (!batch) {
        throw new NotFoundException(`Batch with ID "${batchId}" not found`);
      }
    }

    const newExpense = this.expensesRepository.create({
      ...expenseData,
      batch: batch ?? undefined,
      responsible: currentUser.name,
    });
    return this.expensesRepository.save(newExpense);
  }

  async findAll(filterDto: FilterExpenseDto): Promise<PaginationResult<Expense>> {
    const { page = 1, limit = 10, category, payment_method, startDate, endDate, minAmount, maxAmount } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (payment_method) where.payment_method = payment_method;
    if (minAmount !== undefined && maxAmount !== undefined) {
      where.amount = Between(minAmount, maxAmount);
    } else if (minAmount !== undefined) {
      where.amount = Between(minAmount, Infinity);
    } else if (maxAmount !== undefined) {
      where.amount = Between(-Infinity, maxAmount);
    }

    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    } else if (startDate) {
      where.date = Between(startDate, new Date().toISOString().split('T')[0]);
    } else if (endDate) {
      where.date = Between('1900-01-01', endDate);
    }

    const [data, total] = await this.expensesRepository.findAndCount({
      where,
      take: limit,
      skip,
      relations: ['batch'],
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({ where: { id }, relations: ['batch'] });
    if (!expense) {
      throw new NotFoundException(`Expense with ID "${id}" not found`);
    }
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const { batchId, ...expenseData } = updateExpenseDto;
    let batch: Batch | null = null;

    if (batchId) {
      batch = await this.batchesRepository.findOneBy({ id: batchId });
      if (!batch) {
        throw new NotFoundException(`Batch with ID "${batchId}" not found`);
      }
    }

    const updateResult = await this.expensesRepository.update(id, { ...expenseData, batch: batch ?? undefined });
    if (updateResult.affected === 0) {
      throw new NotFoundException(`Expense with ID "${id}" not found`);
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const deleteResult = await this.expensesRepository.softDelete(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Expense with ID "${id}" not found`);
    }
  }
}