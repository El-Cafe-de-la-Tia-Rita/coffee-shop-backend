import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { FilterClientDto } from './dto/filter-client.dto';
import { ResponseClientDto } from './dto/response-client.dto';
import { StatsClientDto } from './dto/stats-client.dto';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiBody({
    type: CreateClientDto,
    examples: {
      a: {
        summary: 'New Client',
        value: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+14155552671',
          address: '123 Main St',
          district: 'Downtown',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The client has been successfully created.', type: ResponseClientDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all clients with pagination and filters' })
  @ApiResponse({ status: 200, description: 'A paginated list of clients.', type: [ResponseClientDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@Query() filterDto: FilterClientDto) {
    return this.clientsService.findAll(filterDto);
  }

  @Get(':id/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get statistics for a single client' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({ status: 200, description: 'Client statistics.', type: StatsClientDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Client not found.' })
  getStatsForClient(@Param('id') id: string) {
    return this.clientsService.getStatsForClient(id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a client by ID' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({ status: 200, description: 'The client.', type: ResponseClientDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Client not found.' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a client' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiBody({
    type: UpdateClientDto,
    examples: {
      a: {
        summary: 'Update Client Name',
        value: { name: 'Jane Doe' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'The client has been successfully updated.', type: ResponseClientDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Client not found.' })
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a client (soft delete)' })
  @ApiParam({ name: 'id', description: 'Client ID' })
  @ApiResponse({ status: 200, description: 'The client has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Client not found.' })
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}
