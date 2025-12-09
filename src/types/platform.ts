/**
 * Platform types for Cal.com v2 API
 */

import type { UpdateMeInput } from './me.js';
import type { WebhookTrigger } from './webhooks.js';

export type CreateManagedUserInput = {
  email: string;
  name: string;
  timeFormat?: number;
  weekStart?: string;
  timeZone?: string;
  locale?: string;
  avatarUrl?: string;
  bio?: string;
  metadata?: Record<string, unknown>;
};

export type ManagedUser = {
  id: number;
  email: string;
  username: string;
  name: string;
  bio: string;
  timeZone: string;
  weekStart: string;
  createdDate: string;
  timeFormat: number;
  defaultScheduleId: number;
  locale?: string;
  avatarUrl?: string;
  metadata?: Record<string, unknown>;
};

export type CreateManagedUserData = {
  accessToken: string;
  refreshToken: string;
  user: ManagedUser;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
};

export type UpdateManagedUserInput = UpdateMeInput;

export type PlatformWebhook = {
  id: number;
  oAuthClientId: string;
  payloadTemplate: string | null;
  triggers: WebhookTrigger[];
  subscriberUrl: string;
  active: boolean;
  secret?: string;
};

export type ForceRefreshOutput = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
};
