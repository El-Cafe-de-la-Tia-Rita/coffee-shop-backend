import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
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
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { productCatalogId, microbatchId, ...productData } = createProductDto;

    const productCatalog = await this.productCatalogRepository.findOneBy({ id: productCatalogId });
    if (!productCatalog) {
      throw new NotFoundException(`ProductCatalog with ID "${productCatalogId}" not found`);
    }

    const microBatch = await this.microBatchRepository.findOneBy({ id: microbatchId });
    if (!microBatch) {
      throw new NotFoundException(`MicroBatch with ID "${microbatchId}" not found`);
    }

    const newProduct = this.productsRepository.create({
      ...productData,
      product_catalog: productCatalog,
      microbatch: microBatch,
    });
    return this.productsRepository.save(newProduct);
  }

  async findAll(filterDto: FilterProductDto): Promise<PaginationResult<Product>> {
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
      queryBuilder.andWhere('productCatalog.code ILIKE :productCatalogCode', { productCatalogCode: `%${productCatalogCode}%` });
    }
    if (productCatalogName) {
      queryBuilder.andWhere('productCatalog.name ILIKE :productCatalogName', { productCatalogName: `%${productCatalogName}%` });
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
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const { productCatalogId, microbatchId, ...productData } = updateProductDto;
    const product = await this.findOne(id);

    let productCatalog: ProductCatalog | null = product.product_catalog; // Corrected type
    if (productCatalogId) {
      productCatalog = await this.productCatalogRepository.findOneBy({ id: productCatalogId });
      if (!productCatalog) {
        throw new NotFoundException(`ProductCatalog with ID "${productCatalogId}" not found`);
      }
    }

    let microBatch: MicroBatch | null = product.microbatch; // Corrected type
    if (microbatchId) {
      microBatch = await this.microBatchRepository.findOneBy({ id: microbatchId });
      if (!microBatch) {
        throw new NotFoundException(`MicroBatch with ID "${microbatchId}" not found`);
      }
    }
    
    await this.productsRepository.update(id, {
      ...productData,
      product_catalog: productCatalog ?? undefined, // Handle nullability for update
      microbatch: microBatch ?? undefined, // Handle nullability for update
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
    return this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.product_catalog', 'productCatalog')
      .where('product.stock_current <= product.stock_minimum')
      .getMany();
  }
}
