import { z } from 'zod';

// ── Member Validators ──
export const createMemberSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
  status: z
    .enum(['VISITOR', 'NEW_CONVERT', 'MEMBER', 'WORKER', 'LEADER', 'INACTIVE'])
    .default('VISITOR'),
  address: z.string().optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  familyId: z.string().uuid().optional().nullable(),
  customFields: z.record(z.unknown()).default({}),
});

export const updateMemberSchema = createMemberSchema.partial();

// ── Giving Validators ──
export const recordGivingSchema = z.object({
  memberId: z.string().uuid().optional().nullable(),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'NGN', 'ZAR', 'GBP', 'EUR', 'CAD', 'GHS', 'KES']).default('GHS'),
  category: z
    .enum([
      'TITHE',
      'OFFERING',
      'SPECIAL_SEED',
      'PLEDGE_PAYMENT',
      'BUILDING_FUND',
      'MISSIONS',
      'WELFARE',
      'OTHER',
    ])
    .default('OFFERING'),
  paymentMethod: z
    .enum([
      'CASH',
      'BANK_TRANSFER',
      'POS',
      'MOBILE_MONEY',
      'ONLINE_CARD',
      'PAYSTACK',
      'STRIPE',
      'OTHER',
    ])
    .default('CASH'),
  date: z.string().datetime(),
  pledgeId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// ── Attendance Validators ──
export const checkInSchema = z.object({
  eventId: z.string().uuid(),
  memberId: z.string().uuid(),
  checkInMethod: z.enum(['MANUAL', 'QR_CODE', 'SELF_CHECK_IN']).default('MANUAL'),
  isFirstTime: z.boolean().default(false),
});

export const batchCheckInSchema = z.object({
  eventId: z.string().uuid(),
  memberIds: z.array(z.string().uuid()).min(1),
  checkInMethod: z.enum(['MANUAL', 'QR_CODE', 'SELF_CHECK_IN']).default('MANUAL'),
});

// ── Message Validators ──
export const sendMessageSchema = z.object({
  channel: z.enum(['EMAIL', 'SMS', 'PUSH', 'WHATSAPP']),
  recipientIds: z.array(z.string().uuid()).min(1),
  templateId: z.string().uuid().optional(),
  subject: z.string().max(500).optional(),
  body: z.string().min(1),
  scheduledFor: z.string().datetime().optional(),
});

// ── Auth Validators ──
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  churchName: z.string().min(2).max(255),
  subdomain: z
    .string()
    .min(3)
    .max(63)
    .regex(/^[a-z0-9-]+$/),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type RecordGivingInput = z.infer<typeof recordGivingSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type BatchCheckInInput = z.infer<typeof batchCheckInSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
