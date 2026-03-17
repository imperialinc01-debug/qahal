import {
  IsString, IsOptional, IsUUID, IsEnum, IsBoolean, IsInt, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { GroupType } from '../../types/prisma-enums';

export class CreateGroupDto {
  @ApiProperty({ example: 'Zone A - Cell 3' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: GroupType, default: 'CELL' })
  @IsEnum(GroupType)
  type: GroupType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentGroupId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  leaderId?: string;

  @ApiPropertyOptional({ example: 'Wednesday' })
  @IsOptional()
  @IsString()
  meetingDay?: string;

  @ApiPropertyOptional({ example: '6:30 PM' })
  @IsOptional()
  @IsString()
  meetingTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateGroupDto extends PartialType(CreateGroupDto) {}

export class AddGroupMemberDto {
  @ApiProperty()
  @IsUUID()
  memberId: string;

  @ApiPropertyOptional({ default: 'member' })
  @IsOptional()
  @IsString()
  role?: string;
}

export class TransferMemberDto {
  @ApiProperty()
  @IsUUID()
  memberId: string;

  @ApiProperty()
  @IsUUID()
  toGroupId: string;
}

export class ListGroupsQueryDto {
  @ApiPropertyOptional({ enum: GroupType })
  @IsOptional()
  @IsEnum(GroupType)
  type?: GroupType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentGroupId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
