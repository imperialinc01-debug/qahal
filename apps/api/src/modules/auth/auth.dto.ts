import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../types/prisma-enums';

export class RegisterDto {
  @ApiProperty({ example: 'Grace Community Church' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  churchName: string;

  @ApiProperty({ example: 'grace' })
  @IsString()
  @MinLength(3)
  @MaxLength(63)
  @Matches(/^[a-z0-9-]+$/, { message: 'Subdomain must be lowercase alphanumeric with hyphens only' })
  subdomain: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Pastor' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'john@gracechurch.org' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'john@gracechurch.org' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'john@gracechurch.org' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewSecurePass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}

export class InviteUserDto {
  @ApiProperty({ example: 'sarah@gracechurch.org' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: UserRole, example: 'ADMIN' })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: 'Sarah' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Admin' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({ example: '+233501234567' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  newPassword: string;
}
