/**
 * Prisma Enum Types
 *
 * These are defined here so the project compiles before `prisma generate` is run.
 * After running `npx prisma generate`, these are redundant — the real types come
 * from @prisma/client. You can then delete this file and update imports.
 *
 * For now, all modules import from here instead of @prisma/client directly.
 */

export enum TenantPlan {
  FREE = 'FREE',
  GROWTH = 'GROWTH',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRIAL = 'TRIAL',
  CANCELLED = 'CANCELLED',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  PASTOR = 'PASTOR',
  ADMIN = 'ADMIN',
  LEADER = 'LEADER',
  MEMBER = 'MEMBER',
}

export enum MemberStatus {
  VISITOR = 'VISITOR',
  NEW_CONVERT = 'NEW_CONVERT',
  MEMBER = 'MEMBER',
  WORKER = 'WORKER',
  LEADER = 'LEADER',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum GroupType {
  CELL = 'CELL',
  MINISTRY = 'MINISTRY',
  DEPARTMENT = 'DEPARTMENT',
  ZONE = 'ZONE',
  DISTRICT = 'DISTRICT',
  TEAM = 'TEAM',
}

export enum EventType {
  SUNDAY_SERVICE = 'SUNDAY_SERVICE',
  MIDWEEK_SERVICE = 'MIDWEEK_SERVICE',
  PRAYER_MEETING = 'PRAYER_MEETING',
  CELL_MEETING = 'CELL_MEETING',
  SPECIAL_EVENT = 'SPECIAL_EVENT',
  CONFERENCE = 'CONFERENCE',
  OTHER = 'OTHER',
}

export enum RecurrenceRule {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum CheckInMethod {
  MANUAL = 'MANUAL',
  QR_CODE = 'QR_CODE',
  SELF_CHECK_IN = 'SELF_CHECK_IN',
}

export enum GivingCategory {
  TITHE = 'TITHE',
  OFFERING = 'OFFERING',
  SPECIAL_SEED = 'SPECIAL_SEED',
  PLEDGE_PAYMENT = 'PLEDGE_PAYMENT',
  BUILDING_FUND = 'BUILDING_FUND',
  MISSIONS = 'MISSIONS',
  WELFARE = 'WELFARE',
  OTHER = 'OTHER',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  POS = 'POS',
  MOBILE_MONEY = 'MOBILE_MONEY',
  ONLINE_CARD = 'ONLINE_CARD',
  PAYSTACK = 'PAYSTACK',
  STRIPE = 'STRIPE',
  OTHER = 'OTHER',
}

export enum PledgeStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum MessageChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  WHATSAPP = 'WHATSAPP',
}

export enum MessageStatus {
  QUEUED = 'QUEUED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
}

export enum CurrencyCode {
  USD = 'USD',
  NGN = 'NGN',
  ZAR = 'ZAR',
  GBP = 'GBP',
  EUR = 'EUR',
  CAD = 'CAD',
  GHS = 'GHS',
  KES = 'KES',
}
