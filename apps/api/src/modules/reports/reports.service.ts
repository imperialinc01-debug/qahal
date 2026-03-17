import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class ReportsService {
  constructor(private db: DatabaseService) {}

  // ═══════════════════════════════════════════════════════════
  // ATTENDANCE ANALYTICS
  // ═══════════════════════════════════════════════════════════

  // Individual member attendance rates
  async getMemberAttendanceRates(tenantId: string, months: number = 3) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const events = await this.db.event.findMany({
      where: { tenantId, type: { in: ['SUNDAY_SERVICE', 'MIDWEEK_SERVICE', 'PRAYER_MEETING'] }, date: { gte: since, lte: new Date() }, isActive: true },
      select: { id: true },
    });
    const totalEvents = events.length;
    if (totalEvents === 0) return { members: [], totalEvents: 0, period: `Last ${months} months` };

    const eventIds = events.map(e => e.id);

    const members = await this.db.member.findMany({
      where: { tenantId, isArchived: false, status: { notIn: ['VISITOR', 'ARCHIVED'] } },
      select: { id: true, firstName: true, lastName: true, phone: true, email: true, status: true },
    });

    const attendanceCounts = await this.db.attendance.groupBy({
      by: ['memberId'],
      where: { tenantId, eventId: { in: eventIds } },
      _count: true,
    });
    const countMap = new Map(attendanceCounts.map(a => [a.memberId, a._count]));

    const result = members.map(m => ({
      ...m,
      attended: countMap.get(m.id) || 0,
      total: totalEvents,
      rate: totalEvents > 0 ? Math.round((Number(countMap.get(m.id) || 0) / totalEvents) * 100) : 0,
    })).sort((a, b) => b.rate - a.rate);

    return { members: result, totalEvents, period: `Last ${months} months` };
  }

  // First-timer conversion tracking
  async getFirstTimerConversions(tenantId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const firstTimers = await this.db.attendance.findMany({
      where: { tenantId, isFirstTime: true, createdAt: { gte: sixMonthsAgo } },
      include: { member: { select: { id: true, firstName: true, lastName: true, status: true, joinedDate: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const total = firstTimers.length;
    const converted = firstTimers.filter(f => f.member.status !== 'VISITOR').length;
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

    const byStatus: Record<string, number> = {};
    firstTimers.forEach(f => { byStatus[f.member.status] = (byStatus[f.member.status] || 0) + 1; });

    return {
      total, converted, conversionRate, byStatus,
      firstTimers: firstTimers.map(f => ({
        memberId: f.member.id, name: `${f.member.firstName} ${f.member.lastName}`,
        phone: f.member.phone, currentStatus: f.member.status,
        firstVisitDate: f.createdAt, converted: f.member.status !== 'VISITOR',
      })),
    };
  }

  // Seasonal attendance trends (monthly)
  async getSeasonalTrends(tenantId: string) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const events = await this.db.event.findMany({
      where: { tenantId, type: 'SUNDAY_SERVICE', date: { gte: oneYearAgo }, isActive: true },
      include: { _count: { select: { attendanceRecords: true } } },
      orderBy: { date: 'asc' },
    });

    const byMonth: Record<string, { total: number; count: number; events: number }> = {};
    events.forEach(e => {
      const key = new Date(e.date).toISOString().slice(0, 7); // YYYY-MM
      if (!byMonth[key]) byMonth[key] = { total: 0, count: 0, events: 0 };
      byMonth[key].total += (e as any)._count?.attendanceRecords || 0;
      byMonth[key].events += 1;
      byMonth[key].count = Math.round(byMonth[key].total / byMonth[key].events);
    });

    return Object.entries(byMonth).map(([month, data]) => ({
      month, averageAttendance: data.count, totalAttendance: data.total, services: data.events,
    }));
  }

  // Compare service types
  async getServiceComparison(tenantId: string) {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const types = ['SUNDAY_SERVICE', 'MIDWEEK_SERVICE', 'PRAYER_MEETING'];
    const results: any[] = [];

    for (const type of types) {
      const events = await this.db.event.findMany({
        where: { tenantId, type: type as any, date: { gte: threeMonthsAgo }, isActive: true },
        include: { _count: { select: { attendanceRecords: true } } },
      });
      const counts = events.map(e => (e as any)._count?.attendanceRecords || 0);
      const avg = counts.length > 0 ? Math.round(counts.reduce((a, b) => a + b, 0) / counts.length) : 0;
      const peak = counts.length > 0 ? Math.max(...counts) : 0;
      const lowest = counts.length > 0 ? Math.min(...counts) : 0;
      results.push({ type, totalEvents: events.length, averageAttendance: avg, peak, lowest });
    }
    return results;
  }

  // ═══════════════════════════════════════════════════════════
  // FINANCIAL REPORTS
  // ═══════════════════════════════════════════════════════════

  // Weekly giving summary (for board meetings)
  async getWeeklyGivingSummary(tenantId: string, weeks: number = 8) {
    const results: any[] = [];
    const now = new Date();

    for (let i = 0; i < weeks; i++) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 7);

      const [total, byCategory] = await Promise.all([
        this.db.giving.aggregate({
          where: { tenantId, date: { gte: weekStart, lte: weekEnd } },
          _sum: { amount: true }, _count: true,
        }),
        this.db.giving.groupBy({
          by: ['category'],
          where: { tenantId, date: { gte: weekStart, lte: weekEnd } },
          _sum: { amount: true },
        }),
      ]);

      results.push({
        weekStart: weekStart.toISOString().slice(0, 10),
        weekEnd: weekEnd.toISOString().slice(0, 10),
        total: Number(total._sum.amount) || 0,
        count: total._count,
        byCategory: byCategory.reduce((acc: any, g) => { acc[g.category] = Number(g._sum.amount) || 0; return acc; }, {}),
      });
    }
    return results.reverse();
  }

  // Monthly income report
  async getMonthlyIncomeReport(tenantId: string, year?: number) {
    const y = year || new Date().getFullYear();
    const results: any[] = [];

    for (let month = 0; month < 12; month++) {
      const start = new Date(y, month, 1);
      const end = new Date(y, month + 1, 0);
      if (start > new Date()) break;

      const [total, byCategory, byMethod] = await Promise.all([
        this.db.giving.aggregate({ where: { tenantId, date: { gte: start, lte: end } }, _sum: { amount: true }, _count: true }),
        this.db.giving.groupBy({ by: ['category'], where: { tenantId, date: { gte: start, lte: end } }, _sum: { amount: true } }),
        this.db.giving.groupBy({ by: ['paymentMethod'], where: { tenantId, date: { gte: start, lte: end } }, _sum: { amount: true } }),
      ]);

      results.push({
        month: start.toISOString().slice(0, 7),
        monthName: start.toLocaleString('en', { month: 'long' }),
        total: Number(total._sum.amount) || 0, count: total._count,
        byCategory: byCategory.reduce((acc: any, g) => { acc[g.category] = Number(g._sum.amount) || 0; return acc; }, {}),
        byMethod: byMethod.reduce((acc: any, g) => { acc[g.paymentMethod] = Number(g._sum.amount) || 0; return acc; }, {}),
      });
    }
    return { year: y, months: results, yearTotal: results.reduce((s, m) => s + m.total, 0) };
  }

  // Individual member giving statement
  async getMemberGivingStatement(tenantId: string, memberId: string, year?: number) {
    const y = year || new Date().getFullYear();
    const start = new Date(y, 0, 1);
    const end = new Date(y, 11, 31);

    const member = await this.db.member.findFirst({ where: { id: memberId, tenantId } });
    if (!member) return null;

    const records = await this.db.giving.findMany({
      where: { tenantId, memberId, date: { gte: start, lte: end } },
      orderBy: { date: 'asc' },
    });

    const byCategory: Record<string, number> = {};
    const byMonth: Record<string, number> = {};
    records.forEach(r => {
      byCategory[r.category] = (byCategory[r.category] || 0) + Number(r.amount);
      const m = new Date(r.date).toISOString().slice(0, 7);
      byMonth[m] = (byMonth[m] || 0) + Number(r.amount);
    });

    return {
      member: { id: member.id, name: `${member.firstName} ${member.lastName}`, email: member.email, phone: member.phone },
      year: y, totalGiven: records.reduce((s, r) => s + Number(r.amount), 0),
      totalTransactions: records.length, byCategory, byMonth, records,
    };
  }

  // Pledge tracking
  async getPledgeReport(tenantId: string) {
    const pledges = await this.db.pledge.findMany({
      where: { tenantId },
      include: { member: { select: { id: true, firstName: true, lastName: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const active = pledges.filter(p => p.status === 'ACTIVE');
    const completed = pledges.filter(p => p.status === 'COMPLETED');
    const overdue = active.filter(p => p.endDate && new Date(p.endDate) < new Date());
    const totalPledged = pledges.reduce((s, p) => s + Number(p.targetAmount), 0);
    const totalPaid = pledges.reduce((s, p) => s + Number(p.paidAmount), 0);

    return {
      summary: {
        totalPledges: pledges.length, active: active.length, completed: completed.length,
        overdue: overdue.length, totalPledged, totalPaid,
        fulfillmentRate: totalPledged > 0 ? Math.round((totalPaid / totalPledged) * 100) : 0,
      },
      pledges: pledges.map(p => ({
        id: p.id, name: p.name,
        member: `${p.member.firstName} ${p.member.lastName}`, memberPhone: p.member.phone,
        targetAmount: Number(p.targetAmount), paidAmount: Number(p.paidAmount),
        remaining: Number(p.targetAmount) - Number(p.paidAmount),
        progress: Number(p.targetAmount) > 0 ? Math.round((Number(p.paidAmount) / Number(p.targetAmount)) * 100) : 0,
        status: p.status, startDate: p.startDate, endDate: p.endDate,
      })),
    };
  }

  // ═══════════════════════════════════════════════════════════
  // OVERVIEW DASHBOARD
  // ═══════════════════════════════════════════════════════════

  async getOverviewReport(tenantId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [totalMembers, newThisMonth, membersByStatus, givingThisMonth, givingLastMonth, givingYtd,
           totalEvents, assetValue, activePledges] = await Promise.all([
      this.db.member.count({ where: { tenantId, isArchived: false } }),
      this.db.member.count({ where: { tenantId, isArchived: false, createdAt: { gte: monthStart } } }),
      this.db.member.groupBy({ by: ['status'], where: { tenantId, isArchived: false }, _count: true }),
      this.db.giving.aggregate({ where: { tenantId, date: { gte: monthStart } }, _sum: { amount: true }, _count: true }),
      this.db.giving.aggregate({ where: { tenantId, date: { gte: lastMonthStart, lte: lastMonthEnd } }, _sum: { amount: true } }),
      this.db.giving.aggregate({ where: { tenantId, date: { gte: yearStart } }, _sum: { amount: true }, _count: true }),
      this.db.event.count({ where: { tenantId, date: { gte: monthStart }, isActive: true } }),
      this.db.asset.aggregate({ where: { tenantId }, _sum: { value: true }, _count: true }),
      this.db.pledge.count({ where: { tenantId, status: 'ACTIVE' } }),
    ]);

    const thisMonthGiving = Number(givingThisMonth._sum.amount) || 0;
    const lastMonthGiving = Number(givingLastMonth._sum.amount) || 0;

    return {
      members: {
        total: totalMembers, newThisMonth,
        byStatus: membersByStatus.reduce((acc: any, s) => { acc[s.status] = s._count; return acc; }, {}),
      },
      giving: {
        thisMonth: thisMonthGiving, lastMonth: lastMonthGiving,
        monthChange: lastMonthGiving > 0 ? Math.round(((thisMonthGiving - lastMonthGiving) / lastMonthGiving) * 100) : 0,
        ytd: Number(givingYtd._sum.amount) || 0, ytdTransactions: givingYtd._count,
      },
      events: { thisMonth: totalEvents },
      assets: { total: assetValue._count, totalValue: Number(assetValue._sum.value) || 0 },
      pledges: { active: activePledges },
    };
  }
}
