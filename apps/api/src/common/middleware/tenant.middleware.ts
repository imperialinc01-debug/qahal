import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private db: DatabaseService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const host = req.headers.host || '';
    const hostname = host.split(':')[0];

    // Local development — use first active tenant
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const firstTenant = await this.db.tenant.findFirst({ where: { status: { not: 'CANCELLED' } } });
      if (firstTenant) {
        (req as any).tenant = firstTenant;
      }
      return next();
    }

    // Production — single-tenant mode for now (qahal.app or api.qahal.app)
    // When you go multi-tenant with subdomains (e.g. charis.qahal.app),
    // uncomment the subdomain lookup below
    const productionHosts = [
      process.env.FRONTEND_URL?.replace('https://', '').replace('http://', ''),
      hostname, // catch railway domain, api.qahal.app, etc.
    ].filter(Boolean);

    // For single-tenant: find the first active tenant
    const tenant = await this.db.tenant.findFirst({
      where: { status: { not: 'CANCELLED' } },
    });

    if (tenant) {
      (req as any).tenant = tenant;
    }

    // Future multi-tenant subdomain routing:
    // const parts = hostname.split('.');
    // if (parts.length >= 3) {
    //   const tenant = await this.db.tenant.findFirst({
    //     where: { OR: [{ subdomain: parts[0] }, { customDomain: hostname }], status: { not: 'CANCELLED' } },
    //   });
    //   if (tenant) (req as any).tenant = tenant;
    // }

    next();
  }
}
