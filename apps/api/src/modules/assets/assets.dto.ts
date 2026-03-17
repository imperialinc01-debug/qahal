import {
  IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsInt, Min, Max, IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum AssetCategory {
  EQUIPMENT = 'EQUIPMENT',
  FURNITURE = 'FURNITURE',
  VEHICLE = 'VEHICLE',
  PROPERTY = 'PROPERTY',
  INSTRUMENT = 'INSTRUMENT',
  ELECTRONICS = 'ELECTRONICS',
  OTHER = 'OTHER',
}

export enum AssetCondition {
  NEW = 'NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  DAMAGED = 'DAMAGED',
  DISPOSED = 'DISPOSED',
}

export class CreateAssetDto {
  @ApiProperty({ example: 'Yamaha Keyboard' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Yamaha PSR-E373, 61-key portable keyboard' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AssetCategory })
  @IsEnum(AssetCategory)
  category: AssetCategory;

  @ApiPropertyOptional({ enum: AssetCondition, default: 'GOOD' })
  @IsOptional()
  @IsEnum(AssetCondition)
  condition?: AssetCondition;

  @ApiPropertyOptional({ example: 2500.00 })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ example: 'Donated by Bro. Kwame Asante' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  donorMemberId?: string;

  @ApiPropertyOptional({ example: '2026-01-15' })
  @IsOptional()
  @IsDateString()
  acquiredDate?: string;

  @ApiPropertyOptional({ example: 'Main Auditorium' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'SN-12345-ABC' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAssetDto extends PartialType(CreateAssetDto) {}

export class ListAssetsQueryDto {
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
  @Max(100)
  limit?: number = 25;

  @ApiPropertyOptional({ enum: AssetCategory })
  @IsOptional()
  @IsEnum(AssetCategory)
  category?: AssetCategory;

  @ApiPropertyOptional({ enum: AssetCondition })
  @IsOptional()
  @IsEnum(AssetCondition)
  condition?: AssetCondition;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
