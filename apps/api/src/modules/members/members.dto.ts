import {
  IsString, IsOptional, IsEmail, IsEnum, IsUUID, IsBoolean,
  MinLength, MaxLength, IsDateString, IsInt, Min, Max, IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { MemberStatus, Gender } from '../../types/prisma-enums';

export class CreateMemberDto {
  @ApiProperty({ example: 'Sarah' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Johnson' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional({ example: 'sarah@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+233501234567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: '+233509876543' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  altPhone?: string;

  @ApiPropertyOptional({ example: '1990-06-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: 'Married' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  maritalStatus?: string;

  @ApiPropertyOptional({ example: '15 Independence Ave, Accra' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Accra' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'Greater Accra' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ example: 'Ghana' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: 'GA-123' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ enum: MemberStatus, default: 'VISITOR' })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiPropertyOptional({ example: '2020-12-25' })
  @IsOptional()
  @IsDateString()
  salvationDate?: string;

  @ApiPropertyOptional({ example: '2021-03-15' })
  @IsOptional()
  @IsDateString()
  baptismDate?: string;

  @ApiPropertyOptional({ example: '2021-01-01' })
  @IsOptional()
  @IsDateString()
  joinedDate?: string;

  @ApiPropertyOptional({ example: '2015-08-20' })
  @IsOptional()
  @IsDateString()
  weddingAnniversary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  familyId?: string;

  @ApiPropertyOptional({ example: { waterBaptism: true, cellGroup: 'Zone A Cell 3' } })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMemberDto extends PartialType(CreateMemberDto) {}

export class ListMembersQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 25;

  @ApiPropertyOptional({ description: 'Search by name, email, or phone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: MemberStatus })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ageMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ageMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  joinedAfter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  joinedBefore?: string;

  @ApiPropertyOptional({ default: 'lastName' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'lastName';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}

export class BirthdaysQueryDto {
  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number = 30;
}
