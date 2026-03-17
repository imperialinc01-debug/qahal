import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { CreateAssetDto, UpdateAssetDto, ListAssetsQueryDto } from './assets.dto';

@Injectable()
export class AssetsService {
  constructor(private db: DatabaseService) {}

  async findAll(tenantId: string, query: ListAssetsQueryDto) {
    const { page = 1, limit = 25, category, condition, search } = query;
    const where: any = { tenantId };
    if (category) where.category = category;
    if (condition) where.condition = condition;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.db.asset.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: { donorMember: { select: { id: true, firstName: true, lastName: true } } } }),
      this.db.asset.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(tenantId: string, id: string) {
    const asset = await this.db.asset.findFirst({ where: { id, tenantId },
      include: { donorMember: { select: { id: true, firstName: true, lastName: true } } } });
    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }

  async create(tenantId: string, dto: CreateAssetDto) {
    return this.db.asset.create({
      data: {
        tenantId, name: dto.name, description: dto.description, category: dto.category,
        condition: dto.condition || 'GOOD', value: dto.value, source: dto.source,
        donorMemberId: dto.donorMemberId, acquiredDate: dto.acquiredDate ? new Date(dto.acquiredDate) : new Date(),
        location: dto.location, serialNumber: dto.serialNumber, notes: dto.notes,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateAssetDto) {
    const existing = await this.db.asset.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Asset not found');
    const data: any = { ...dto };
    if (data.acquiredDate) data.acquiredDate = new Date(data.acquiredDate);
    return this.db.asset.update({ where: { id }, data });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.db.asset.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Asset not found');
    await this.db.asset.delete({ where: { id } });
    return { message: 'Asset deleted' };
  }

  async getSummary(tenantId: string) {
    const [total, byCategory, totalValue] = await Promise.all([
      this.db.asset.count({ where: { tenantId } }),
      this.db.asset.groupBy({ by: ['category'], where: { tenantId }, _count: true, _sum: { value: true } }),
      this.db.asset.aggregate({ where: { tenantId }, _sum: { value: true } }),
    ]);
    return {
      total, totalValue: Number(totalValue._sum.value) || 0,
      byCategory: byCategory.map(c => ({ category: c.category, count: c._count, value: Number(c._sum.value) || 0 })),
    };
  }
}
