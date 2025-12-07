import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { ResponseProductDto } from './dto/response-product.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new product (stock item)' })
  @ApiBody({
    type: CreateProductDto,
    examples: {
      a: {
        summary: 'New Product Stock Item',
        value: {
          productCatalogId: 'uuid-of-product-catalog',
          microbatchId: 'uuid-of-microbatch',
          sku: 'RC-250G-DRK-WB-001',
          grind_type: 'WHOLE_BEAN',
          stock_current: 200,
          stock_minimum: 50,
          sale_price: 12.00,
          unit_cost: 8.00,
          active: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The product stock item has been successfully created.',
    type: ResponseProductDto,
    schema: {
      example: {
        id: 'uuid-of-product',
        product_catalog: { id: 'uuid-of-product-catalog', name: 'Roasted Coffee 250g' },
        microbatch: { id: 'uuid-of-microbatch', code: 'MB001' },
        sku: 'RC-250G-DRK-WB-001',
        grind_type: 'WHOLE_BEAN',
        stock_current: 200,
        stock_reserved: 0,
        stock_minimum: 50,
        sale_price: 12.00,
        unit_cost: 8.00,
        active: true,
        created_at: '2025-12-06T10:00:00.000Z',
        updated_at: '2025-12-06T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product Catalog or MicroBatch not found.' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get('low-stock')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get products with low stock (current <= minimum)' })
  @ApiResponse({
    status: 200,
    description: 'A list of products with low stock.',
    type: [ResponseProductDto],
    schema: {
      example: [
        {
          id: 'uuid-of-product',
          product_catalog: { id: 'uuid-of-product-catalog', name: 'Roasted Coffee 250g' },
          microbatch: { id: 'uuid-of-microbatch', code: 'MB001' },
          sku: 'RC-250G-DRK-WB-001',
          grind_type: 'WHOLE_BEAN',
          stock_current: 40,
          stock_reserved: 0,
          stock_minimum: 50,
          sale_price: 12.00,
          unit_cost: 8.00,
          active: true,
          created_at: '2025-12-06T10:00:00.000Z',
          updated_at: '2025-12-06T10:00:00.000Z',
          deleted_at: null,
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  checkLowStock() {
    return this.productsService.checkLowStock();
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get all product stock items with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'A paginated list of product stock items.',
    type: [ResponseProductDto],
    schema: {
      example: [
        {
          id: 'uuid-of-product',
          product_catalog: { id: 'uuid-of-product-catalog', name: 'Roasted Coffee 250g' },
          microbatch: { id: 'uuid-of-microbatch', code: 'MB001' },
          sku: 'RC-250G-DRK-WB-001',
          grind_type: 'WHOLE_BEAN',
          stock_current: 200,
          stock_reserved: 0,
          stock_minimum: 50,
          sale_price: 12.00,
          unit_cost: 8.00,
          active: true,
          created_at: '2025-12-06T10:00:00.000Z',
          updated_at: '2025-12-06T10:00:00.000Z',
          deleted_at: null,
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(@Query() filterDto: FilterProductDto) {
    return this.productsService.findAll(filterDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get a product stock item by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'The product stock item.',
    type: ResponseProductDto,
    schema: {
      example: {
        id: 'uuid-of-product',
        product_catalog: { id: 'uuid-of-product-catalog', name: 'Roasted Coffee 250g' },
        microbatch: { id: 'uuid-of-microbatch', code: 'MB001' },
        sku: 'RC-250G-DRK-WB-001',
        grind_type: 'WHOLE_BEAN',
        stock_current: 200,
        stock_reserved: 0,
        stock_minimum: 50,
        sale_price: 12.00,
        unit_cost: 8.00,
        active: true,
        created_at: '2025-12-06T10:00:00.000Z',
        updated_at: '2025-12-06T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a product stock item' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({
    type: UpdateProductDto,
    examples: {
      a: {
        summary: 'Update Stock Current',
        value: { stock_current: 180 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The product stock item has been successfully updated.',
    type: ResponseProductDto,
    schema: {
      example: {
        id: 'uuid-of-product',
        product_catalog: { id: 'uuid-of-product-catalog', name: 'Roasted Coffee 250g' },
        microbatch: { id: 'uuid-of-microbatch', code: 'MB001' },
        sku: 'RC-250G-DRK-WB-001',
        grind_type: 'WHOLE_BEAN',
        stock_current: 180,
        stock_reserved: 0,
        stock_minimum: 50,
        sale_price: 12.00,
        unit_cost: 8.00,
        active: true,
        created_at: '2025-12-06T10:00:00.000Z',
        updated_at: '2025-12-06T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete a product stock item (soft delete)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'The product stock item has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
