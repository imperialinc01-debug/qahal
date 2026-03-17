-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "TenantPlan" AS ENUM ('FREE', 'GROWTH', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TRIAL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'PASTOR', 'ADMIN', 'LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('VISITOR', 'NEW_CONVERT', 'MEMBER', 'WORKER', 'LEADER', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('CELL', 'MINISTRY', 'DEPARTMENT', 'ZONE', 'DISTRICT', 'TEAM');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SUNDAY_SERVICE', 'MIDWEEK_SERVICE', 'PRAYER_MEETING', 'CELL_MEETING', 'SPECIAL_EVENT', 'CONFERENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "RecurrenceRule" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "CheckInMethod" AS ENUM ('MANUAL', 'QR_CODE', 'SELF_CHECK_IN');

-- CreateEnum
CREATE TYPE "GivingCategory" AS ENUM ('TITHE', 'OFFERING', 'SPECIAL_SEED', 'PLEDGE_PAYMENT', 'BUILDING_FUND', 'MISSIONS', 'WELFARE', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'POS', 'MOBILE_MONEY', 'ONLINE_CARD', 'PAYSTACK', 'STRIPE', 'OTHER');

-- CreateEnum
CREATE TYPE "PledgeStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "AutomationType" AS ENUM ('BIRTHDAY', 'ANNIVERSARY', 'VISITOR_FOLLOWUP', 'ABSENTEE_ALERT', 'PLEDGE_REMINDER', 'EVENT_REMINDER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CurrencyCode" AS ENUM ('USD', 'NGN', 'ZAR', 'GBP', 'EUR', 'CAD', 'GHS', 'KES');

-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('EQUIPMENT', 'FURNITURE', 'VEHICLE', 'PROPERTY', 'INSTRUMENT', 'ELECTRONICS', 'OTHER');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED', 'DISPOSED');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "subdomain" VARCHAR(63) NOT NULL,
    "customDomain" VARCHAR(255),
    "logoUrl" TEXT,
    "plan" "TenantPlan" NOT NULL DEFAULT 'FREE',
    "status" "TenantStatus" NOT NULL DEFAULT 'TRIAL',
    "currency" "CurrencyCode" NOT NULL DEFAULT 'GHS',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "avatarUrl" TEXT,
    "phone" VARCHAR(30),
    "lastLoginAt" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "memberId" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(30),
    "altPhone" VARCHAR(30),
    "dateOfBirth" DATE,
    "gender" "Gender",
    "maritalStatus" VARCHAR(30),
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(100),
    "postalCode" VARCHAR(20),
    "photoUrl" TEXT,
    "status" "MemberStatus" NOT NULL DEFAULT 'VISITOR',
    "salvationDate" DATE,
    "baptismDate" DATE,
    "joinedDate" DATE,
    "weddingAnniversary" DATE,
    "familyId" UUID,
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "notes" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "families" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "primaryContactId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_field_definitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "entity" VARCHAR(50) NOT NULL,
    "fieldName" VARCHAR(100) NOT NULL,
    "fieldLabel" VARCHAR(200) NOT NULL,
    "fieldType" VARCHAR(30) NOT NULL,
    "options" JSONB,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_field_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "GroupType" NOT NULL DEFAULT 'CELL',
    "parentGroupId" UUID,
    "leaderId" UUID,
    "meetingDay" VARCHAR(20),
    "meetingTime" VARCHAR(20),
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "groupId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "role" VARCHAR(30) NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "EventType" NOT NULL DEFAULT 'SUNDAY_SERVICE',
    "date" TIMESTAMPTZ NOT NULL,
    "endDate" TIMESTAMPTZ,
    "recurrence" "RecurrenceRule" NOT NULL DEFAULT 'NONE',
    "recurrenceEndDate" DATE,
    "location" TEXT,
    "groupId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "checkedInAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkInMethod" "CheckInMethod" NOT NULL DEFAULT 'MANUAL',
    "isFirstTime" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "giving" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "memberId" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" "CurrencyCode" NOT NULL DEFAULT 'GHS',
    "category" "GivingCategory" NOT NULL DEFAULT 'OFFERING',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "transactionRef" VARCHAR(255),
    "pledgeId" UUID,
    "date" DATE NOT NULL,
    "notes" TEXT,
    "receiptSent" BOOLEAN NOT NULL DEFAULT false,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "giving_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pledges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "targetAmount" DECIMAL(12,2) NOT NULL,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" "CurrencyCode" NOT NULL DEFAULT 'GHS',
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "status" "PledgeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pledges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "subject" VARCHAR(500),
    "body" TEXT NOT NULL,
    "mergeFields" JSONB NOT NULL DEFAULT '[]',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "recipientId" UUID NOT NULL,
    "templateId" UUID,
    "subject" VARCHAR(500),
    "body" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'QUEUED',
    "scheduledFor" TIMESTAMPTZ,
    "sentAt" TIMESTAMPTZ,
    "deliveredAt" TIMESTAMPTZ,
    "failReason" TEXT,
    "externalId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "AutomationType" NOT NULL,
    "templateId" UUID NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "userId" UUID,
    "action" VARCHAR(50) NOT NULL,
    "entity" VARCHAR(50) NOT NULL,
    "entityId" UUID,
    "changes" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" "AssetCategory" NOT NULL DEFAULT 'EQUIPMENT',
    "condition" "AssetCondition" NOT NULL DEFAULT 'GOOD',
    "value" DECIMAL(12,2),
    "source" VARCHAR(255),
    "donorMemberId" UUID,
    "acquiredDate" DATE,
    "location" VARCHAR(255),
    "serialNumber" VARCHAR(255),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_subdomain_key" ON "tenants"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_customDomain_key" ON "tenants"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "users_memberId_key" ON "users"("memberId");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenantId_email_key" ON "users"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "members_tenantId_idx" ON "members"("tenantId");

-- CreateIndex
CREATE INDEX "members_tenantId_status_idx" ON "members"("tenantId", "status");

-- CreateIndex
CREATE INDEX "members_tenantId_familyId_idx" ON "members"("tenantId", "familyId");

-- CreateIndex
CREATE INDEX "members_tenantId_dateOfBirth_idx" ON "members"("tenantId", "dateOfBirth");

-- CreateIndex
CREATE INDEX "members_tenantId_lastName_firstName_idx" ON "members"("tenantId", "lastName", "firstName");

-- CreateIndex
CREATE INDEX "families_tenantId_idx" ON "families"("tenantId");

-- CreateIndex
CREATE INDEX "custom_field_definitions_tenantId_entity_idx" ON "custom_field_definitions"("tenantId", "entity");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_definitions_tenantId_entity_fieldName_key" ON "custom_field_definitions"("tenantId", "entity", "fieldName");

-- CreateIndex
CREATE INDEX "groups_tenantId_idx" ON "groups"("tenantId");

-- CreateIndex
CREATE INDEX "groups_tenantId_type_idx" ON "groups"("tenantId", "type");

-- CreateIndex
CREATE INDEX "groups_parentGroupId_idx" ON "groups"("parentGroupId");

-- CreateIndex
CREATE INDEX "group_members_memberId_idx" ON "group_members"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_groupId_memberId_key" ON "group_members"("groupId", "memberId");

-- CreateIndex
CREATE INDEX "events_tenantId_idx" ON "events"("tenantId");

-- CreateIndex
CREATE INDEX "events_tenantId_date_idx" ON "events"("tenantId", "date");

-- CreateIndex
CREATE INDEX "events_tenantId_type_idx" ON "events"("tenantId", "type");

-- CreateIndex
CREATE INDEX "attendance_tenantId_idx" ON "attendance"("tenantId");

-- CreateIndex
CREATE INDEX "attendance_tenantId_eventId_idx" ON "attendance"("tenantId", "eventId");

-- CreateIndex
CREATE INDEX "attendance_tenantId_memberId_idx" ON "attendance"("tenantId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_eventId_memberId_key" ON "attendance"("eventId", "memberId");

-- CreateIndex
CREATE INDEX "giving_tenantId_idx" ON "giving"("tenantId");

-- CreateIndex
CREATE INDEX "giving_tenantId_date_idx" ON "giving"("tenantId", "date");

-- CreateIndex
CREATE INDEX "giving_tenantId_memberId_idx" ON "giving"("tenantId", "memberId");

-- CreateIndex
CREATE INDEX "giving_tenantId_category_idx" ON "giving"("tenantId", "category");

-- CreateIndex
CREATE INDEX "pledges_tenantId_idx" ON "pledges"("tenantId");

-- CreateIndex
CREATE INDEX "pledges_tenantId_memberId_idx" ON "pledges"("tenantId", "memberId");

-- CreateIndex
CREATE INDEX "pledges_tenantId_status_idx" ON "pledges"("tenantId", "status");

-- CreateIndex
CREATE INDEX "message_templates_tenantId_idx" ON "message_templates"("tenantId");

-- CreateIndex
CREATE INDEX "message_templates_tenantId_channel_idx" ON "message_templates"("tenantId", "channel");

-- CreateIndex
CREATE INDEX "messages_tenantId_idx" ON "messages"("tenantId");

-- CreateIndex
CREATE INDEX "messages_tenantId_status_idx" ON "messages"("tenantId", "status");

-- CreateIndex
CREATE INDEX "messages_tenantId_recipientId_idx" ON "messages"("tenantId", "recipientId");

-- CreateIndex
CREATE INDEX "messages_tenantId_channel_status_idx" ON "messages"("tenantId", "channel", "status");

-- CreateIndex
CREATE INDEX "messages_scheduledFor_idx" ON "messages"("scheduledFor");

-- CreateIndex
CREATE INDEX "automation_rules_tenantId_idx" ON "automation_rules"("tenantId");

-- CreateIndex
CREATE INDEX "automation_rules_tenantId_type_isActive_idx" ON "automation_rules"("tenantId", "type", "isActive");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_entity_entityId_idx" ON "audit_logs"("tenantId", "entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_tenantId_createdAt_idx" ON "audit_logs"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "assets_tenantId_idx" ON "assets"("tenantId");

-- CreateIndex
CREATE INDEX "assets_tenantId_category_idx" ON "assets"("tenantId", "category");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "families" ADD CONSTRAINT "families_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_field_definitions" ADD CONSTRAINT "custom_field_definitions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giving" ADD CONSTRAINT "giving_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giving" ADD CONSTRAINT "giving_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giving" ADD CONSTRAINT "giving_pledgeId_fkey" FOREIGN KEY ("pledgeId") REFERENCES "pledges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pledges" ADD CONSTRAINT "pledges_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pledges" ADD CONSTRAINT "pledges_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "message_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "message_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_donorMemberId_fkey" FOREIGN KEY ("donorMemberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
