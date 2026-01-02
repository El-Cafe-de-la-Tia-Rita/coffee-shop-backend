import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductCatalog } from './entities/product-catalog.entity';
import { ProductCatalogService } from './product-catalog.service';
import { ProductCatalogController } from './product-catalog.controller';
import { Product } from './entities/product.entity';
import { MicroBatch } from '../micro-batches/entities/micro-batch.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductCatalog, Product, MicroBatch, Expense, User])],
  controllers: [ProductsController, ProductCatalogController],
  providers: [ProductsService, ProductCatalogService],
})
export class ProductsModule {}
