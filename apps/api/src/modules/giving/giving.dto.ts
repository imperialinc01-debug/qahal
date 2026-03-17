import {
  IsString, IsOptional, IsUUID, IsNumber, IsEnum, IsDateString,
  IsPositive, IsInt, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { GivingCategory, PaymentMethod, CurrencyCode } from '../../types/prisma-enums';

export class RecordGivingDto {
  @ApiPropertyOptional({ description: 'Null for anonymous giving' })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiProperty({ example: 500.0 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ enum: CurrencyCode, default: 'GHS' })
  @IsOptional()
  @IsEnum(CurrencyCode)
  currency?: CurrencyCode;

  @ApiProperty({ enum: GivingCategory, example: 'TITHE' })
  @IsEnum(GivingCategory)
  category: GivingCategory;

  @ApiProperty({ enum: PaymentMethod, example: 'CASH' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: '2026-03-16' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: 'External payment reference (e.g., Paystack ref)' })
  @IsOptional()
  @IsString()
  transactionRef?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  pledgeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ListGivingQueryDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiPropertyOptional({ enum: GivingCategory })
  @IsOptional()
  @IsEnum(GivingCategory)
  category?: GivingCategory;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class GivingReportQueryDto {
  @ApiProperty()
  @IsDateString()
  from: string;

  @ApiProperty()
  @IsDateString()
  to: string;

  @ApiPropertyOptional({ enum: ['category', 'paymentMethod', 'month', 'week'] })
  @IsOptional()
  @IsString()
  groupBy?: string;
}
