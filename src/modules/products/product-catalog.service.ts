import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ProductCatalog } from './entities/product-catalog.entity';
import { CreateProductCatalogDto } from './dto/create-product-catalog.dto';
import { UpdateProductCatalogDto } from './dto/update-product-catalog.dto';
import { FilterProductCatalogDto } from './dto/filter-product-catalog.dto';
import { PaginationResult } from '@common/interfaces/pagination-result.interface';

@Injectable()
export class ProductCatalogService {
  constructor(
    @InjectRepository(ProductCatalog)
    private productCatalogRepository: Repository<ProductCatalog>,
  ) {}

  create(createProductCatalogDto: CreateProductCatalogDto): Promise<ProductCatalog> {
    const newProductCatalog = this.productCatalogRepository.create(createProductCatalogDto);
    return this.productCatalogRepository.save(newProductCatalog);
  }

  async findAll(filterDto: FilterProductCatalogDto): Promise<PaginationResult<ProductCatalog>> {
    const { page = 1, limit = 10, code, name, package_type, active } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (code) where.code = ILike(`%${code}%`);
    if (name) where.name = ILike(`%${name}%`);
    if (package_type) where.package_type = ILike(`%${package_type}%`);
    if (typeof active === 'boolean') where.active = active;

    const [data, total] = await this.productCatalogRepository.findAndCount({
      where,
      take: limit,
      skip,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<ProductCatalog> {
    const productCatalog = await this.productCatalogRepository.findOneBy({ id });
    if (!productCatalog) {
      throw new NotFoundException(`ProductCatalog with ID "${id}" not found`);
    }
    return productCatalog;
  }

  async update(id: string, updateProductCatalogDto: UpdateProductCatalogDto): Promise<ProductCatalog> {
    const updateResult = await this.productCatalogRepository.update(id, updateProductCatalogDto);
    if (updateResult.affected === 0) {
      throw new NotFoundException(`ProductCatalog with ID "${id}" not found`);
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const deleteResult = await this.productCatalogRepository.softDelete(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`ProductCatalog with ID "${id}" not found`);
    }
  }
}
