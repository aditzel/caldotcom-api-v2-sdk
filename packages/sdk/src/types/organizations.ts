/**
 * Organization types for Cal.com v2 API
 */

import type { MembershipUser } from './teams.js';

export type OrgRoleType = 'SYSTEM' | 'CUSTOM';
export type OrgRolePermission = 
  | '*.*' 
  | 'role.create' | 'role.read' | 'role.update' | 'role.delete'
  | 'eventType.create' | 'eventType.read' | 'eventType.update' | 'eventType.delete'
  | 'team.create' | 'team.read' | 'team.update' | 'team.delete' | 'team.invite' | 'team.remove' | 'team.listMembers' | 'team.listMembersPrivate' | 'team.changeMemberRole' | 'team.impersonate'
  | 'organization.create' | 'organization.read' | 'organization.listMembers' | 'organization.listMembersPrivate' | 'organization.invite' | 'organization.remove' | 'organization.manageBilling' | 'organization.changeMemberRole' | 'organization.impersonate' | 'organization.update'
  | 'booking.read' | 'booking.readOrgBookings' | 'booking.readRecordings' | 'booking.update'
  | 'insights.read'
  | 'workflow.create' | 'workflow.read' | 'workflow.update' | 'workflow.delete'
  | 'organization.attributes.read' | 'organization.attributes.update' | 'organization.attributes.delete' | 'organization.attributes.create' | 'organization.attributes.editUsers'
  | 'routingForm.create' | 'routingForm.read' | 'routingForm.update' | 'routingForm.delete'
  | 'webhook.create' | 'webhook.read' | 'webhook.update' | 'webhook.delete'
  | 'watchlist.create' | 'watchlist.read' | 'watchlist.update' | 'watchlist.delete';

export type OrganizationRole = {
  id: string;
  name: string;
  color?: string;
  description?: string;
  organizationId?: number;
  type: OrgRoleType;
  permissions: OrgRolePermission[];
  createdAt: string;
  updatedAt: string;
};

export type CreateOrgRoleInput = {
  name: string;
  color?: string;
  description?: string;
  permissions?: OrgRolePermission[];
};

export type UpdateOrgRoleInput = Partial<CreateOrgRoleInput>;

export type CreateOrganizationAttributeOptionInput = {
  value: string;
  slug: string;
};

export type OrganizationAttribute = {
  id: string;
  teamId: number;
  type: 'TEXT' | 'NUMBER' | 'SINGLE_SELECT' | 'MULTI_SELECT';
  name: string;
  slug: string;
  enabled: boolean;
  usersCanEditRelation?: boolean;
};

export type CreateOrganizationAttributeInput = {
  name: string;
  slug: string;
  type: 'TEXT' | 'NUMBER' | 'SINGLE_SELECT' | 'MULTI_SELECT';
  options: CreateOrganizationAttributeOptionInput[];
  enabled?: boolean;
};

export type OrganizationMembership = {
  id: number;
  userId: number;
  teamId: number;
  accepted: boolean;
  role: 'MEMBER' | 'OWNER' | 'ADMIN';
  disableImpersonation?: boolean;
  user: MembershipUser;
  attributes: unknown[];
};
