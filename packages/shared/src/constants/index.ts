export const APP_NAME = 'Qahal';
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export const MEMBER_STATUS_LABELS: Record<string, string> = {
  VISITOR: 'Visitor',
  NEW_CONVERT: 'New Convert',
  MEMBER: 'Member',
  WORKER: 'Worker',
  LEADER: 'Leader',
  INACTIVE: 'Inactive',
  ARCHIVED: 'Archived',
};

export const GIVING_CATEGORY_LABELS: Record<string, string> = {
  TITHE: 'Tithe',
  OFFERING: 'Offering',
  SPECIAL_SEED: 'Special Seed',
  PLEDGE_PAYMENT: 'Pledge Payment',
  BUILDING_FUND: 'Building Fund',
  MISSIONS: 'Missions',
  WELFARE: 'Welfare',
  OTHER: 'Other',
};

export const ROLES_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 100,
  PASTOR: 80,
  ADMIN: 60,
  LEADER: 40,
  MEMBER: 20,
};
