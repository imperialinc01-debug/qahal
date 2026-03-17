import {
  IsString, IsOptional, IsEnum, IsUUID, IsDateString, IsBoolean, IsInt, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EventType, RecurrenceRule } from '../../types/prisma-enums';

export class CreateEventDto {
  @ApiProperty({ example: 'Sunday Service' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: EventType, example: 'SUNDAY_SERVICE' })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ example: '2026-03-22T09:00:00Z' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: '2026-03-22T11:30:00Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: RecurrenceRule, default: 'NONE' })
  @IsOptional()
  @IsEnum(RecurrenceRule)
  recurrence?: RecurrenceRule;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  recurrenceEndDate?: string;

  @ApiPropertyOptional({ example: 'Main Auditorium' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  groupId?: string;
}

export class UpdateEventDto extends PartialType(CreateEventDto) {}

export class ListEventsQueryDto {
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

  @ApiPropertyOptional({ enum: EventType })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
