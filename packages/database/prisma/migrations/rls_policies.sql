-- Qahal: Row-Level Security Policies
-- This migration enables RLS on all tenant-scoped tables
-- Run after Prisma migrations create the tables

-- Enable RLS on all tenant-scoped tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE giving ENABLE ROW LEVEL SECURITY;
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Create the function to get current tenant from session variable
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
$$ LANGUAGE SQL STABLE;

-- ============================================================
-- RLS POLICIES: Each table gets SELECT, INSERT, UPDATE, DELETE
-- All scoped by tenant_id = current_tenant_id()
-- ============================================================

-- USERS
CREATE POLICY users_select ON users FOR SELECT USING (tenant_id = current_tenant_id());
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY users_update ON users FOR UPDATE USING (tenant_id = current_tenant_id());
CREATE POLICY users_delete ON users FOR DELETE USING (tenant_id = current_tenant_id());

-- MEMBERS
CREATE POLICY members_select ON members FOR SELECT USING (tenant_id = current_tenant_id());
CREATE POLICY members_insert ON members FOR INSERT WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY members_update ON members FOR UPDATE USING (tenant_id = current_tenant_id());
CREATE POLICY members_delete ON members FOR DELETE USING (tenant_id = current_tenant_id());

-- FAMILIES
CREATE POLICY families_select ON families FOR SELECT USING (tenant_id = current_tenant_id());
CREATE POLICY families_insert ON families FOR INSERT WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY families_update ON families FOR UPDATE USING (tenant_id = current_tenant_id());
CREATE POLICY families_delete ON families FOR DELETE USING (tenant_id = current_tenant_id());

-- GROUPS
CREATE POLICY groups_select ON groups FOR SELECT USING (tenant_id = current_tenant_id());
CREATE POLICY groups_insert ON groups FOR INSERT WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY groups_update ON groups FOR UPDATE USING (tenant_id = current_tenant_id());
CREATE POLICY groups_delete ON groups FOR DELETE USING (tenant_id = current_tenant_id());

-- GROUP_MEMBERS (uses join through group)
CREATE POLICY group_members_select ON group_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM groups WHERE groups.id = group_members.group_id AND groups.tenant_id = current_tenant_id()));
CREATE POLICY group_members_insert ON group_members FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM groups WHERE groups.id = group_members.group_id AND groups.tenant_id = current_tenant_id()));
CREATE POLICY group_members_update ON group_members FOR UPDATE
  USING (EXISTS (SELECT 1 FROM groups WHERE groups.id = group_members.group_id AND groups.tenant_id = current_tenant_id()));
CREATE POLICY group_members_delete ON group_members FOR DELETE
  USING (EXISTS (SELECT 1 FROM groups WHERE groups.id = group_members.group_id AND groups.tenant_id = current_tenant_id()));

-- EVENTS
CREATE POLICY events_select ON events FOR SELECT USING (tenant_id = current_tenant_id());
CREATE POLICY events_insert ON events FOR INSERT WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY events_update ON events FOR UPDATE USING (tenant_id = current_tenant_id());
CREATE POLICY events_delete ON events FOR DELETE USING (tenant_id = current_tenant_id());

-- ATTENDANCE
CREATE POLICY attendance_select ON attendance FOR SELECT USING (tenant_id = current_tenant_id());
CREATE POLICY attendance_insert ON attendance FOR INSERT WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY attendance_update ON attendance FOR UPDATE USING (tenant_id = current_tenant_id());
CREATE POLICY attendance_delete ON attendance FOR DELETE USING (tenant_id = current_tenant_id());

-- GIVING
CREATE POLICY giving_select ON giving FOR SELECT USING (tenant_id = current_tenant_id());
CREATE POLICY giving_insert ON giving FOR INSERT WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY giving_update ON giving FOR UPDATE USING (tenant_id = current_tenant_id());
CREATE POLICY giving_delete ON giving FOR DELETE USING (tenant_id = current_tenant_id());

-- PLEDGES
CREATE POLICY pledges_select ON pledges FOR SELECT USING (tenant_id = current_tenant_id());
CREATE POLICY pledges_insert ON pledges FOR INSERT WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY pledges_update ON pledges FOR UPDATE USING (tenant_id = current_tenant_id());
CREATE POLICY pledges_delete ON pledges FOR DELETE USING (tenant_id = current_tenant_id());

-- MESSAGES
CREATE POLICY messages_select ON messages FOR SELECT USING (tenant_id = current_tenant_id());
CREATE POLICY messages_insert ON messages FOR INSERT WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY messages_update ON messages FOR UPDATE USING (tenant_id = current_tenant_id());
CREATE POLICY messages_delete ON messages FOR DELETE USING (tenant_id = current_tenant_id());

-- MESSAGE_TEMPLATES
CREATE POLICY message_templates_select ON message_templates FOR SELECT USING (tenant_id = current_tenant_id());
CREATE POLICY message_templates_insert ON message_templates FOR INSERT WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY message_templates_update ON message_templates FOR UPDATE USING (tenant_id = current_tenant_id());
CREATE POLICY message_templates_delete ON message_templates FOR DELETE USING (tenant_id = current_tenant_id());

-- AUTOMATION_RULES
CREATE POLICY automation_rules_select ON automation_rules FOR SELECT USING (tenant_id = current_tenant_id());
CREATE POLICY automation_rules_insert ON automation_rules FOR INSERT WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY automation_rules_update ON automation_rules FOR UPDATE USING (tenant_id = current_tenant_id());
CREATE POLICY automation_rules_delete ON automation_rules FOR DELETE USING (tenant_id = current_tenant_id());

-- AUDIT_LOGS (select only — logs are immutable)
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT USING (tenant_id = current_tenant_id());
CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT WITH CHECK (tenant_id = current_tenant_id());

-- CUSTOM_FIELD_DEFINITIONS
CREATE POLICY custom_fields_select ON custom_field_definitions FOR SELECT USING (tenant_id = current_tenant_id());
CREATE POLICY custom_fields_insert ON custom_field_definitions FOR INSERT WITH CHECK (tenant_id = current_tenant_id());
CREATE POLICY custom_fields_update ON custom_field_definitions FOR UPDATE USING (tenant_id = current_tenant_id());
CREATE POLICY custom_fields_delete ON custom_field_definitions FOR DELETE USING (tenant_id = current_tenant_id());

-- REFRESH_TOKENS (scoped through user)
CREATE POLICY refresh_tokens_select ON refresh_tokens FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = refresh_tokens.user_id AND users.tenant_id = current_tenant_id()));
CREATE POLICY refresh_tokens_insert ON refresh_tokens FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = refresh_tokens.user_id AND users.tenant_id = current_tenant_id()));
CREATE POLICY refresh_tokens_delete ON refresh_tokens FOR DELETE
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = refresh_tokens.user_id AND users.tenant_id = current_tenant_id()));

-- ============================================================
-- TENANTS table does NOT have RLS — it's the root entity
-- Super-admin access bypasses RLS via a superuser role
-- ============================================================

-- Create an application-level DB role that respects RLS
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'qahal_app') THEN
    CREATE ROLE qahal_app LOGIN PASSWORD 'change_me_in_production';
  END IF;
END
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO qahal_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO qahal_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO qahal_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO qahal_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO qahal_app;
