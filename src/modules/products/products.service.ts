import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { PaginationResult } from '@common/interfaces/pagination-result.interface';
import { ProductCatalog } from './entities/product-catalog.entity';
import { MicroBatch } from '../micro-batches/entities/micro-batch.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductCatalog)
    private productCatalogRepository: Repository<ProductCatalog>,
    @InjectRepository(MicroBatch)
    private microBatchRepository: Repository<MicroBatch>,
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createProductDto: CreateProductDto, currentUser: User): Promise<Product> {
    const { productCatalogId, microbatchId, expenses, ...productData } = createProductDto;

    const productCatalog = await this.productCatalogRepository.findOneBy({
      id: productCatalogId,
    });
    if (!productCatalog) {
      throw new NotFoundException(
        `ProductCatalog with ID "${productCatalogId}" not found`,
      );
    }

    const microBatch = await this.microBatchRepository.findOne({
      where: { id: microbatchId },
      relations: ['batch', 'batch.expenses', 'expenses'],
    });
    if (!microBatch) {
      throw new NotFoundException(
        `MicroBatch with ID "${microbatchId}" not found`,
      );
    }
    
    // Create associated Expense records if expenses are provided
    if (expenses && expenses.length > 0) {
      for (const expenseDto of expenses) {
        const expense = this.expensesRepository.create({
          ...expenseDto,
          microbatch: microBatch,
          date: new Date().toISOString().split('T')[0], // Today's date for expense
          responsible: currentUser.name,
          receipt_url: 'N/A', // Default value
        });
        await this.expensesRepository.save(expense);
      }
    }

    // Recalculate microbatch with new expenses
    const updatedMicroBatch = await this.microBatchRepository.findOne({
      where: { id: microbatchId },
      relations: ['batch', 'batch.expenses', 'expenses'],
    });

    // Calculate Unit Cost
    const batchExpenses = updatedMicroBatch.batch.expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0,
    );
    const totalBatchCost = Number(updatedMicroBatch.batch.total_cost) + batchExpenses;
    const proratedBatchCost =
      (Number(updatedMicroBatch.green_kg_used) / Number(updatedMicroBatch.batch.green_kg)) *
      totalBatchCost;

    const directMicroBatchExpenses = updatedMicroBatch.expenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0,
    );

    const totalMicroBatchCost = proratedBatchCost + directMicroBatchExpenses;
    const unitsProduced =
      Number(updatedMicroBatch.roasted_kg_obtained) /
      (productCatalog.weight_grams / 1000);
    const unitCost = totalMicroBatchCost / unitsProduced;

    const newProduct = this.productsRepository.create({
      ...productData,
      product_catalog: productCatalog,
      microbatch: updatedMicroBatch,
      unit_cost: unitCost,
    });
    return this.productsRepository.save(newProduct);
  }

  async findAll(
    filterDto: FilterProductDto,
  ): Promise<PaginationResult<Product>> {
    const {
      page = 1,
      limit = 10,
      sku,
      grind_type,
      active,
      isLowStock,
      productCatalogCode,
      productCatalogName,
    } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productsRepository.createQueryBuilder('product');
    queryBuilder.leftJoinAndSelect('product.product_catalog', 'productCatalog');
    queryBuilder.leftJoinAndSelect('product.microbatch', 'microbatch');

    if (sku) {
      queryBuilder.andWhere('product.sku ILIKE :sku', { sku: `%${sku}%` });
    }
    if (grind_type) {
      queryBuilder.andWhere('product.grind_type = :grind_type', { grind_type });
    }
    if (typeof active === 'boolean') {
      queryBuilder.andWhere('product.active = :active', { active });
    }
    if (isLowStock) {
      queryBuilder.andWhere('product.stock_current <= product.stock_minimum');
    }
    if (productCatalogCode) {
      queryBuilder.andWhere('productCatalog.code ILIKE :productCatalogCode', {
        productCatalogCode: `%${productCatalogCode}%`,
      });
    }
    if (productCatalogName) {
      queryBuilder.andWhere('productCatalog.name ILIKE :productCatalogName', {
        productCatalogName: `%${productCatalogName}%`,
      });
    }

    const [data, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['product_catalog', 'microbatch'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  // ...
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { sale_price, active, productCatalogName, stock_minimum } = updateProductDto;
    const product = await this.findOne(id);

    // Update ProductCatalog name if provided
    if (productCatalogName !== undefined) {
      const productCatalog = product.product_catalog;
      if (!productCatalog) {
        throw new NotFoundException(
          `ProductCatalog for Product with ID "${id}" not found`,
        );
      }
      productCatalog.name = productCatalogName;
      await this.productCatalogRepository.save(productCatalog);
    }

    // Update Product fields
    await this.productsRepository.update(id, {
      sale_price,
      active,
      stock_minimum,
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const deleteResult = await this.productsRepository.softDelete(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
  }

  async checkLowStock(): Promise<Product[]> {
    return this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.product_catalog', 'productCatalog')
      .where('product.stock_current <= product.stock_minimum')
      .getMany();
  }
}
