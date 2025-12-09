/**
 * Team types for Cal.com v2 API
 */

export type TeamRole = 'MEMBER' | 'OWNER' | 'ADMIN';

export type Team = {
  id: number;
  parentId?: number;
  name: string;
  slug?: string;
  logoUrl?: string;
  calVideoLogo?: string;
  appLogo?: string;
  appIconLogo?: string;
  bio?: string;
  hideBranding?: boolean;
  isOrganization: boolean;
  isPrivate?: boolean;
  hideBookATeamMember?: boolean;
  metadata?: Record<string, unknown>;
  theme?: string;
  brandColor?: string;
  darkBrandColor?: string;
  bannerUrl?: string;
  timeFormat?: number;
  timeZone?: string;
  weekStart?: string;
};

export type CreateTeamInput = {
  name: string;
  slug?: string;
  logoUrl?: string;
  calVideoLogo?: string;
  appLogo?: string;
  appIconLogo?: string;
  bio?: string;
  hideBranding?: boolean;
  isPrivate?: boolean;
  hideBookATeamMember?: boolean;
  metadata?: Record<string, unknown>;
  theme?: string;
  brandColor?: string;
  darkBrandColor?: string;
  bannerUrl?: string;
  timeFormat?: number;
  timeZone?: string;
  weekStart?: string;
  autoAcceptCreator?: boolean;
};

export type UpdateTeamInput = {
  name?: string;
  slug?: string;
  logoUrl?: string;
  calVideoLogo?: string;
  appLogo?: string;
  appIconLogo?: string;
  bio?: string;
  hideBranding?: boolean;
  isPrivate?: boolean;
  hideBookATeamMember?: boolean;
  metadata?: Record<string, unknown>;
  theme?: string;
  brandColor?: string;
  darkBrandColor?: string;
  bannerUrl?: string;
  timeFormat?: number;
  timeZone?: string;
  weekStart?: string;
  bookingLimits?: string;
  includeManagedEventsInLimits?: boolean;
};

export type MembershipUser = {
  avatarUrl?: string;
  username?: string;
  name?: string;
  email: string;
  bio?: string;
  metadata?: Record<string, unknown>;
};

export type TeamMembership = {
  id: number;
  userId: number;
  teamId: number;
  accepted: boolean;
  role: TeamRole;
  disableImpersonation?: boolean;
  user: MembershipUser;
};

export type CreateTeamMembershipInput = {
  userId: number;
  accepted?: boolean;
  role?: TeamRole;
  disableImpersonation?: boolean;
};

export type UpdateTeamMembershipInput = {
  accepted?: boolean;
  role?: TeamRole;
  disableImpersonation?: boolean;
};

export type TeamEventTypeHost = {
  userId: number;
  mandatory?: boolean;
  priority?: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
};

export type TeamSchedulingType = 'collective' | 'roundRobin' | 'managed';

export type CreateTeamEventTypeInput = {
  lengthInMinutes: number;
  title: string;
  slug: string;
  schedulingType: TeamSchedulingType;
  description?: string;
  hosts?: TeamEventTypeHost[];
  locations?: Record<string, unknown>[];
  metadata?: Record<string, unknown>;
  hidden?: boolean;
  // Add other common fields as needed
};

export type UpdateTeamEventTypeInput = Partial<CreateTeamEventTypeInput>;

export type TeamEventType = {
  id: number;
  teamId: number;
  lengthInMinutes: number;
  title: string;
  slug: string;
  schedulingType: TeamSchedulingType;
  hosts: TeamEventTypeHost[]; // Summary said string[] but typically it returns objects or IDs. I'll trust Host[] or any[] for now.
  description?: string;
  locations?: Record<string, unknown>[];
  metadata?: Record<string, unknown>;
  hidden: boolean;
};
