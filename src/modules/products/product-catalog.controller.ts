import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ProductCatalogService } from './product-catalog.service';
import { CreateProductCatalogDto } from './dto/create-product-catalog.dto';
import { UpdateProductCatalogDto } from './dto/update-product-catalog.dto';
import { FilterProductCatalogDto } from './dto/filter-product-catalog.dto';
import { ResponseProductCatalogDto } from './dto/response-product-catalog.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { RolesGuard } from '@common/guards/roles.guard';

@ApiTags('Product Catalog')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('product-catalog')
export class ProductCatalogController {
  constructor(private readonly productCatalogService: ProductCatalogService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new product catalog entry' })
  @ApiBody({
    type: CreateProductCatalogDto,
    examples: {
      a: {
        summary: 'Roasted Coffee 250g Bag',
        value: {
          code: 'RC-250G',
          name: 'Roasted Coffee 250g',
          description: 'Standard 250g bag of freshly roasted coffee.',
          weight_grams: 250,
          package_type: 'Bag',
          base_price: 10.50,
          active: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The product catalog entry has been successfully created.',
    type: ResponseProductCatalogDto,
    schema: {
      example: {
        id: 'uuid-of-product-catalog',
        code: 'RC-250G',
        name: 'Roasted Coffee 250g',
        description: 'Standard 250g bag of freshly roasted coffee.',
        weight_grams: 250,
        package_type: 'Bag',
        base_price: 10.50,
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
  create(@Body() createProductCatalogDto: CreateProductCatalogDto) {
    return this.productCatalogService.create(createProductCatalogDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get all product catalog entries with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'A paginated list of product catalog entries.',
    type: [ResponseProductCatalogDto],
    schema: {
      example: [
        {
          id: 'uuid-of-product-catalog',
          code: 'RC-250G',
          name: 'Roasted Coffee 250g',
          description: 'Standard 250g bag of freshly roasted coffee.',
          weight_grams: 250,
          package_type: 'Bag',
          base_price: 10.50,
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
  findAll(@Query() filterDto: FilterProductCatalogDto) {
    return this.productCatalogService.findAll(filterDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get a product catalog entry by ID' })
  @ApiParam({ name: 'id', description: 'Product Catalog ID' })
  @ApiResponse({
    status: 200,
    description: 'The product catalog entry.',
    type: ResponseProductCatalogDto,
    schema: {
      example: {
        id: 'uuid-of-product-catalog',
        code: 'RC-250G',
        name: 'Roasted Coffee 250g',
        description: 'Standard 250g bag of freshly roasted coffee.',
        weight_grams: 250,
        package_type: 'Bag',
        base_price: 10.50,
        active: true,
        created_at: '2025-12-06T10:00:00.000Z',
        updated_at: '2025-12-06T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product Catalog not found.' })
  findOne(@Param('id') id: string) {
    return this.productCatalogService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a product catalog entry' })
  @ApiParam({ name: 'id', description: 'Product Catalog ID' })
  @ApiBody({
    type: UpdateProductCatalogDto,
    examples: {
      a: {
        summary: 'Update Product Catalog Price',
        value: { base_price: 11.00 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The product catalog entry has been successfully updated.',
    type: ResponseProductCatalogDto,
    schema: {
      example: {
        id: 'uuid-of-product-catalog',
        code: 'RC-250G',
        name: 'Roasted Coffee 250g',
        description: 'Standard 250g bag of freshly roasted coffee.',
        weight_grams: 250,
        package_type: 'Bag',
        base_price: 11.00,
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
  @ApiResponse({ status: 404, description: 'Product Catalog not found.' })
  update(@Param('id') id: string, @Body() updateProductCatalogDto: UpdateProductCatalogDto) {
    return this.productCatalogService.update(id, updateProductCatalogDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete a product catalog entry (soft delete)' })
  @ApiParam({ name: 'id', description: 'Product Catalog ID' })
  @ApiResponse({ status: 200, description: 'The product catalog entry has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product Catalog not found.' })
  remove(@Param('id') id: string) {
    return this.productCatalogService.remove(id);
  }
}
