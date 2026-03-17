import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private db: DatabaseService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const host = req.headers.host || '';
    const hostname = host.split(':')[0];

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const firstTenant = await this.db.tenant.findFirst({ where: { status: { not: 'CANCELLED' } } });
      if (firstTenant) {
        (req as any).tenant = firstTenant;
      }
      return next();
    }

    const parts = hostname.split('.');
    if (parts.length >= 3) {
      const tenant = await this.db.tenant.findFirst({
        where: { OR: [{ subdomain: parts[0] }, { customDomain: hostname }], status: { not: 'CANCELLED' } },
      });
      if (tenant) {
        (req as any).tenant = tenant;
      }
    }
    next();
  }
}
