import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private db: DatabaseService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      const payload = this.decodePayload(auth.slice(7));
      if (payload?.tenantId) {
        const tenant = await this.db.tenant.findFirst({
          where: { id: payload.tenantId, status: { not: 'CANCELLED' } },
        });
        if (tenant) (req as any).tenant = tenant;
      }
    }
    next();
  }

  private decodePayload(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const json = Buffer.from(parts[1], 'base64').toString('utf-8');
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}
