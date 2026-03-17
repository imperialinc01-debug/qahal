import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { PledgeStatus } from '../../types/prisma-enums';
import { RecordGivingDto, ListGivingQueryDto, GivingReportQueryDto } from './giving.dto';

@Injectable()
export class GivingService {
  constructor(private db: DatabaseService) {}

  // ─── Record a giving entry ────────────────────────────────
  async record(tenantId: string, dto: RecordGivingDto) {
    // Verify member exists if not anonymous
    if (dto.memberId) {
      const member = await this.db.member.findFirst({
        where: { id: dto.memberId, tenantId, isArchived: false },
      });
      if (!member) throw new NotFoundException('Member not found');
    }

    // If it's a pledge payment, verify and update the pledge
    if (dto.pledgeId) {
      const pledge = await this.db.pledge.findFirst({
        where: { id: dto.pledgeId, tenantId, status: PledgeStatus.ACTIVE },
      });
      if (!pledge) throw new BadRequestException('Active pledge not found');
    }

    const giving = await this.db.giving.create({
      data: {
        tenantId,
        memberId: dto.memberId || null,
        amount: dto.amount,
        currency: dto.currency || 'GHS',
        category: dto.category,
        paymentMethod: dto.paymentMethod,
        date: new Date(dto.date),
        transactionRef: dto.transactionRef,
        pledgeId: dto.pledgeId,
        notes: dto.notes,
      },
      include: {
        member: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Update pledge paid amount if applicable
    if (dto.pledgeId) {
      await this.db.pledge.update({
        where: { id: dto.pledgeId },
        data: {
          paidAmount: { increment: dto.amount },
        },
      });

      // Check if pledge is now completed
      const updatedPledge = await this.db.pledge.findUnique({ where: { id: dto.pledgeId } });
      if (updatedPledge && Number(updatedPledge.paidAmount) >= Number(updatedPledge.targetAmount)) {
        await this.db.pledge.update({
          where: { id: dto.pledgeId },
          data: { status: PledgeStatus.COMPLETED },
        });
      }
    }

    return giving;
  }

  // ─── List giving records (paginated) ──────────────────────
  async findAll(tenantId: string, query: ListGivingQueryDto) {
    const { page = 1, limit = 25, memberId, category, paymentMethod, from, to } = query;

    const where: any = { tenantId };

    if (memberId) where.memberId = memberId;
    if (category) where.category = category;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (from || to) {
      where.date = {};
      if (from) (where.date as any).gte = new Date(from);
      if (to) (where.date as any).lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      this.db.giving.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          member: { select: { id: true, firstName: true, lastName: true } },
          pledge: { select: { id: true, name: true } },
        },
      }),
      this.db.giving.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ─── Get single record ────────────────────────────────────
  async findOne(tenantId: string, givingId: string) {
    const giving = await this.db.giving.findFirst({
      where: { id: givingId, tenantId },
      include: {
        member: { select: { id: true, firstName: true, lastName: true, email: true } },
        pledge: { select: { id: true, name: true, targetAmount: true, paidAmount: true } },
      },
    });
    if (!giving) throw new NotFoundException('Giving record not found');
    return giving;
  }

  // ─── Delete record ────────────────────────────────────────
  async remove(tenantId: string, givingId: string) {
    const giving = await this.db.giving.findFirst({ where: { id: givingId, tenantId } });
    if (!giving) throw new NotFoundException('Giving record not found');

    // If linked to a pledge, decrease the paid amount
    if (giving.pledgeId) {
      await this.db.pledge.update({
        where: { id: giving.pledgeId },
        data: { paidAmount: { decrement: Number(giving.amount) }, status: PledgeStatus.ACTIVE },
      });
    }

    await this.db.giving.delete({ where: { id: givingId } });
    return { message: 'Giving record deleted' };
  }

  // ─── Dashboard Summary ────────────────────────────────────
  async getSummary(tenantId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonth, lastMonth, ytd, byCategory] = await Promise.all([
      this.db.giving.aggregate({
        where: { tenantId, date: { gte: monthStart } },
        _sum: { amount: true },
        _count: true,
      }),
      this.db.giving.aggregate({
        where: { tenantId, date: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { amount: true },
      }),
      this.db.giving.aggregate({
        where: { tenantId, date: { gte: yearStart } },
        _sum: { amount: true },
        _count: true,
      }),
      this.db.giving.groupBy({
        by: ['category'],
        where: { tenantId, date: { gte: monthStart } },
        _sum: { amount: true },
      }),
    ]);

    const thisMonthTotal = Number(thisMonth._sum.amount) || 0;
    const lastMonthTotal = Number(lastMonth._sum.amount) || 0;
    const monthOverMonthChange = lastMonthTotal > 0
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      : 0;

    return {
      thisMonth: {
        total: thisMonthTotal,
        count: thisMonth._count,
        change: Math.round(monthOverMonthChange * 10) / 10,
      },
      ytd: {
        total: Number(ytd._sum.amount) || 0,
        count: ytd._count,
      },
      byCategory: byCategory.reduce((acc, g) => {
        acc[g.category] = Number(g._sum.amount) || 0;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // ─── Giving Report ────────────────────────────────────────
  async getReport(tenantId: string, query: GivingReportQueryDto) {
    const from = new Date(query.from);
    const to = new Date(query.to);

    const where: any = {
      tenantId,
      date: { gte: from, lte: to },
    };

    const [total, byCategory, byPaymentMethod, records] = await Promise.all([
      this.db.giving.aggregate({ where, _sum: { amount: true }, _count: true }),
      this.db.giving.groupBy({
        by: ['category'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
      this.db.giving.groupBy({
        by: ['paymentMethod'],
        where,
        _sum: { amount: true },
        _count: true,
      }),
      this.db.giving.findMany({
        where,
        orderBy: { date: 'desc' },
        include: {
          member: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    return {
      period: { from: query.from, to: query.to },
      summary: {
        total: Number(total._sum.amount) || 0,
        count: total._count,
      },
      byCategory: byCategory.map((g) => ({
        category: g.category,
        total: Number(g._sum.amount) || 0,
        count: g._count,
      })),
      byPaymentMethod: byPaymentMethod.map((g) => ({
        method: g.paymentMethod,
        total: Number(g._sum.amount) || 0,
        count: g._count,
      })),
    };
  }

  // ─── Member Giving Summary ────────────────────────────────
  async getMemberSummary(tenantId: string, memberId: string) {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);

    const [ytdTotal, byCategory, byMonth] = await Promise.all([
      this.db.giving.aggregate({
        where: { tenantId, memberId, date: { gte: yearStart } },
        _sum: { amount: true },
      }),
      this.db.giving.groupBy({
        by: ['category'],
        where: { tenantId, memberId, date: { gte: yearStart } },
        _sum: { amount: true },
      }),
      this.db.$queryRaw`
        SELECT
          TO_CHAR(date, 'YYYY-MM') as month,
          SUM(amount) as total
        FROM giving
        WHERE tenant_id = ${tenantId}::uuid
          AND member_id = ${memberId}::uuid
          AND date >= ${yearStart}
        GROUP BY TO_CHAR(date, 'YYYY-MM')
        ORDER BY month ASC
      ` as Promise<Array<{ month: string; total: number }>>,
    ]);

    return {
      ytdTotal: Number(ytdTotal._sum.amount) || 0,
      byCategory: byCategory.reduce((acc, g) => {
        acc[g.category] = Number(g._sum.amount) || 0;
        return acc;
      }, {} as Record<string, number>),
      byMonth: byMonth.map((m) => ({ month: m.month, total: Number(m.total) })),
    };
  }
}
