import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

