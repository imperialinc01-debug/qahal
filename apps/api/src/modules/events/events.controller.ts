import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { CreateEventDto, UpdateEventDto, ListEventsQueryDto } from './events.dto';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  @Roles('PASTOR', 'ADMIN', 'LEADER')
  @ApiOperation({ summary: 'List events' })
  async findAll(@CurrentTenant() tenant: any, @Query() query: ListEventsQueryDto) {
    const result = await this.eventsService.findAll(tenant.id, query);
    return { success: true, ...result };
  }

  @Get(':id')
  @Roles('PASTOR', 'ADMIN', 'LEADER')
  async findOne(@CurrentTenant() tenant: any, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.eventsService.findOne(tenant.id, id);
    return { success: true, data };
  }

  @Post()
  @Roles('PASTOR', 'ADMIN', 'LEADER')
  async create(@CurrentTenant() tenant: any, @Body() dto: CreateEventDto) {
    const data = await this.eventsService.create(tenant.id, dto);
    return { success: true, data };
  }

  @Patch(':id')
  @Roles('PASTOR', 'ADMIN')
  async update(@CurrentTenant() tenant: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEventDto) {
    const data = await this.eventsService.update(tenant.id, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles('PASTOR', 'ADMIN')
  async remove(@CurrentTenant() tenant: any, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.eventsService.remove(tenant.id, id);
    return { success: true, data };
  }
}
