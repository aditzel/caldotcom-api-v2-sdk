/**
 * Me (User Profile) types for Cal.com v2 API
 */

import type { LanguageCode, TimeZone, Metadata } from './common.js';

/**
 * Week start day options
 */
export type WeekStart =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

/**
 * Time format options
 */
export type TimeFormat = 12 | 24;

/**
 * Organization information
 */
export type UserOrganization = {
  isPlatform: boolean;
  id: number;
};

/**
 * User profile response
 */
export type UserProfile = {
  id: number;
  username: string;
  email: string;
  name?: string;
  timeFormat: TimeFormat;
  defaultScheduleId: number | null;
  weekStart: WeekStart;
  timeZone: TimeZone;
  locale?: LanguageCode;
  avatarUrl?: string | null;
  bio?: string | null;
  metadata?: Metadata;
  organizationId: number | null;
  organization?: UserOrganization;
};

/**
 * Update user profile input
 */
export type UpdateUserProfileInput = {
  email?: string;
  name?: string;
  timeFormat?: TimeFormat;
  defaultScheduleId?: number | null;
  weekStart?: WeekStart;
  timeZone?: TimeZone;
  locale?: LanguageCode;
  avatarUrl?: string | null;
  bio?: string | null;
  metadata?: Metadata;
};
