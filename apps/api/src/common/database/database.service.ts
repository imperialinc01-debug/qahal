import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Set the tenant context for RLS policies.
   * Call this at the start of every tenant-scoped request.
   */
  async setTenantContext(tenantId: string): Promise<void> {
    await this.$executeRawUnsafe(
      `SET LOCAL app.current_tenant_id = '${tenantId}'`,
    );
  }

  /**
   * Execute a callback within a transaction with tenant context set.
   * This ensures RLS policies are enforced for all queries in the transaction.
   */
  async withTenant<T>(tenantId: string, fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `SET LOCAL app.current_tenant_id = '${tenantId}'`,
      );
      return fn(tx as PrismaClient);
    });
  }
}
