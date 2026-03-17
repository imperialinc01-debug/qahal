import {
  IsString, IsOptional, IsUUID, IsEnum, IsBoolean, IsArray, IsDateString, IsInt, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CheckInMethod, EventType } from '../../types/prisma-enums';

export class CheckInDto {
  @ApiProperty()
  @IsUUID()
  eventId: string;

  @ApiProperty()
  @IsUUID()
  memberId: string;

  @ApiPropertyOptional({ enum: CheckInMethod, default: 'MANUAL' })
  @IsOptional()
  @IsEnum(CheckInMethod)
  checkInMethod?: CheckInMethod;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFirstTime?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BatchCheckInDto {
  @ApiProperty()
  @IsUUID()
  eventId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  memberIds: string[];

  @ApiPropertyOptional({ enum: CheckInMethod, default: 'MANUAL' })
  @IsOptional()
  @IsEnum(CheckInMethod)
  checkInMethod?: CheckInMethod;
}

export class AttendanceReportQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ enum: EventType })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  groupId?: string;
}

export class AbsenteesQueryDto {
  @ApiPropertyOptional({ default: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(52)
  missedCount?: number = 2;

  @ApiPropertyOptional({ enum: EventType, default: 'SUNDAY_SERVICE' })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;
}
