import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { CreateAssetDto, UpdateAssetDto, ListAssetsQueryDto } from './assets.dto';

@ApiTags('Assets')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('assets')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Get()
  @Roles('PASTOR', 'ADMIN')
  async findAll(@CurrentTenant() tenant: any, @Query() query: ListAssetsQueryDto) {
    const result = await this.assetsService.findAll(tenant.id, query);
    return { success: true, ...result };
  }

  @Get('summary')
  @Roles('PASTOR', 'ADMIN')
  async getSummary(@CurrentTenant() tenant: any) {
    const data = await this.assetsService.getSummary(tenant.id);
    return { success: true, data };
  }

  @Get(':id')
  @Roles('PASTOR', 'ADMIN')
  async findOne(@CurrentTenant() tenant: any, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.assetsService.findOne(tenant.id, id);
    return { success: true, data };
  }

  @Post()
  @Roles('PASTOR', 'ADMIN')
  async create(@CurrentTenant() tenant: any, @Body() dto: CreateAssetDto) {
    const data = await this.assetsService.create(tenant.id, dto);
    return { success: true, data };
  }

  @Patch(':id')
  @Roles('PASTOR', 'ADMIN')
  async update(@CurrentTenant() tenant: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAssetDto) {
    const data = await this.assetsService.update(tenant.id, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles('PASTOR', 'ADMIN')
  async remove(@CurrentTenant() tenant: any, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.assetsService.remove(tenant.id, id);
    return { success: true, data };
  }
}
