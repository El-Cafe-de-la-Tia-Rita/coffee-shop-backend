import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FilterExpenseDto } from './dto/filter-expense.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ResponseExpenseDto } from './dto/response-expense.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../modules/users/entities/user.entity';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiBody({
    type: CreateExpenseDto,
    examples: {
      a: {
        summary: 'Batch Purchase Expense',
        value: {
          batchId: 'uuid-of-batch',
          date: '2025-12-06',
          category: 'PURCHASE',
          concept: 'Purchase of Green Coffee Batch XYZ',
          description: '500 kg of green coffee from Supplier A',
          amount: 2500.00,
          provider: 'Supplier A',
          receipt_url: 'http://example.com/receipts/123.pdf',
          payment_method: 'BANK_TRANSFER',
          observations: 'Paid by bank transfer on 06/12/2025',
        },
      },
      b: {
        summary: 'Transport Expense',
        value: {
          date: '2025-12-05',
          category: 'TRANSPORT',
          concept: 'Delivery of green coffee',
          description: 'Transport cost for 500kg batch',
          amount: 50.00,
          provider: 'Transport Co.',
          receipt_url: 'http://example.com/receipts/456.pdf',
          payment_method: 'CASH',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The expense has been successfully created.',
    type: ResponseExpenseDto,
    schema: {
      example: {
        id: 'uuid-of-expense',
        batch: {
          id: 'uuid-of-batch',
          code: 'BATCH-001',
        },
        date: '2025-12-06',
        category: 'PURCHASE',
        concept: 'Purchase of Green Coffee Batch XYZ',
        description: '500 kg of green coffee from Supplier A',
        quantity: 500,
        unit: 'kg',
        amount: 2500.00,
        provider: 'Supplier A',
        receipt_url: 'http://example.com/receipts/123.pdf',
        payment_method: 'BANK_TRANSFER',
        responsible: 'John Doe',
        observations: 'Paid by bank transfer on 06/12/2025',
        created_at: '2025-12-06T10:00:00.000Z',
        updated_at: '2025-12-06T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Batch not found.' })
  create(@Body() createExpenseDto: CreateExpenseDto, @CurrentUser() currentUser: User) {
    return this.expensesService.create(createExpenseDto, currentUser);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get all expenses with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'A paginated list of expenses.',
    type: [ResponseExpenseDto],
    schema: {
      example: [
        {
          id: 'uuid-of-expense',
          batch: {
            id: 'uuid-of-batch',
            code: 'BATCH-001',
          },
          date: '2025-12-06',
          category: 'PURCHASE',
          concept: 'Purchase of Green Coffee Batch XYZ',
          description: '500 kg of green coffee from Supplier A',
          quantity: 500,
          unit: 'kg',
          amount: 2500.00,
          provider: 'Supplier A',
          receipt_url: 'http://example.com/receipts/123.pdf',
          payment_method: 'BANK_TRANSFER',
          responsible: 'John Doe',
          observations: 'Paid by bank transfer on 06/12/2025',
          created_at: '2025-12-06T10:00:00.000Z',
          updated_at: '2025-12-06T10:00:00.000Z',
          deleted_at: null,
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(@Query() filterDto: FilterExpenseDto) {
    return this.expensesService.findAll(filterDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Get an expense by ID' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({
    status: 200,
    description: 'The expense.',
    type: ResponseExpenseDto,
    schema: {
      example: {
        id: 'uuid-of-expense',
        batch: {
          id: 'uuid-of-batch',
          code: 'BATCH-001',
        },
        date: '2025-12-06',
        category: 'PURCHASE',
        concept: 'Purchase of Green Coffee Batch XYZ',
        description: '500 kg of green coffee from Supplier A',
        quantity: 500,
        unit: 'kg',
        amount: 2500.00,
        provider: 'Supplier A',
        receipt_url: 'http://example.com/receipts/123.pdf',
        payment_method: 'BANK_TRANSFER',
        responsible: 'John Doe',
        observations: 'Paid by bank transfer on 06/12/2025',
        created_at: '2025-12-06T10:00:00.000Z',
        updated_at: '2025-12-06T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update an expense' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiBody({
    type: UpdateExpenseDto,
    examples: {
      a: {
        summary: 'Update Expense Amount',
        value: { amount: 2600.00 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The expense has been successfully updated.',
    type: ResponseExpenseDto,
    schema: {
      example: {
        id: 'uuid-of-expense',
        batch: {
          id: 'uuid-of-batch',
          code: 'BATCH-001',
        },
        date: '2025-12-06',
        category: 'PURCHASE',
        concept: 'Purchase of Green Coffee Batch XYZ',
        description: '500 kg of green coffee from Supplier A',
        quantity: 500,
        unit: 'kg',
        amount: 2600.00,
        provider: 'Supplier A',
        receipt_url: 'http://example.com/receipts/123.pdf',
        payment_method: 'BANK_TRANSFER',
        responsible: 'John Doe',
        observations: 'Paid by bank transfer on 06/12/2025',
        created_at: '2025-12-06T10:00:00.000Z',
        updated_at: '2025-12-06T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete an expense (soft delete)' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({ status: 200, description: 'The expense has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
