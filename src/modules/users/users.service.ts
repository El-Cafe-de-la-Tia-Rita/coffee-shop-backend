import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: User,
  ): Promise<User> {
    const userToUpdate = await this.findOne(id);
    const isSelfUpdate = currentUser.id === userToUpdate.id;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    const allowedUpdates: Partial<UpdateUserDto> = {};
    const forbiddenFields: string[] = [];

    // Any user can update their own email and password
    if (isSelfUpdate) {
      if (updateUserDto.email) {
        allowedUpdates.email = updateUserDto.email;
      }
      if (updateUserDto.password) {
        allowedUpdates.password = updateUserDto.password;
      }
    }

    // Admin can update role and active status for any user
    if (isAdmin) {
      if (updateUserDto.role) {
        allowedUpdates.role = updateUserDto.role;
      }
      if (typeof updateUserDto.active !== 'undefined') {
        allowedUpdates.active = updateUserDto.active;
      }
    }

    // Check for any fields in the DTO that are not in the allowedUpdates
    for (const key in updateUserDto) {
      if (!(key in allowedUpdates)) {
        forbiddenFields.push(key);
      }
    }

    if (forbiddenFields.length > 0) {
      throw new ForbiddenException(
        `You do not have permission to update the following fields: ${forbiddenFields.join(
          ', ',
        )}`,
      );
    }
    
    if (Object.keys(allowedUpdates).length === 0) {
      // Nothing to update, or no permission to update the given fields.
      // The forbiddenFields check above handles the permission case.
      // So this means no valid fields were provided.
      return userToUpdate;
    }

    if (allowedUpdates.password) {
      allowedUpdates.password = await bcrypt.hash(allowedUpdates.password, 10);
    }

    await this.usersRepository.update(id, allowedUpdates);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const deleteResult = await this.usersRepository.softDelete(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }
}
