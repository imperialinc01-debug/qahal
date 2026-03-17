// Re-export Prisma types and add custom types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface TenantContext {
  tenantId: string;
  subdomain: string;
  plan: string;
}

export interface AuthPayload {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
}
