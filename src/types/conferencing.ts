/**
 * Conferencing types for Cal.com v2 API
 */

export type ConferencingApp = {
  id: number;
  type: string;
  userId: number;
  invalid?: boolean;
};

export type DefaultConferencingApp = {
  appSlug?: string;
  appLink?: string;
};
