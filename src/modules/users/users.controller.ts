import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'A list of all users.',
    schema: {
      example: [
        {
          id: '12345678-1234-1234-1234-1234567890ab',
          email: 'user@example.com',
          name: 'John Doe',
          role: 'STAFF',
          active: true,
          created_at: '2025-12-06T10:00:00.000Z',
          updated_at: '2025-12-06T10:00:00.000Z',
        },
      ],
    },
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'The user.',
    schema: {
      example: {
        id: '12345678-1234-1234-1234-1234567890ab',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'STAFF',
        active: true,
        created_at: '2025-12-06T10:00:00.000Z',
        updated_at: '2025-12-06T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      a: {
        summary: 'Example update',
        value: {
          name: 'Jane Doe',
          active: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
    schema: {
      example: {
        id: '12345678-1234-1234-1234-1234567890ab',
        email: 'user@example.com',
        name: 'Jane Doe',
        role: 'STAFF',
        active: false,
        created_at: '2025-12-06T10:00:00.000Z',
        updated_at: '2025-12-06T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.update(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
    schema: { example: { message: 'User deleted successfully' } },
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
