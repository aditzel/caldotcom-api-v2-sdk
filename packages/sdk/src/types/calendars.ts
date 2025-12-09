/**
 * Calendar types for Cal.com v2 API
 */

export type Integration = {
  name: string;
  description: string;
  type: string;
  title?: string;
  variant: string;
  categories: string[];
  logo: string;
  publisher: string;
  slug: string;
  url: string;
  email: string;
  [key: string]: unknown;
};

export type Calendar = {
  externalId: string;
  integration?: string;
  name?: string;
  primary?: boolean;
  readOnly: boolean;
  email?: string;
  isSelected: boolean;
  credentialId: number;
  delegationCredentialId?: string;
};

export type ConnectedCalendar = {
  integration: Integration;
  credentialId: number;
  delegationCredentialId?: string;
  primary?: Calendar;
  calendars?: Calendar[];
};

export type CalendarDestination = {
  id: number;
  integration: string;
  externalId: string;
  primaryEmail: string;
  userId: number;
  eventTypeId: number;
  credentialId: number;
  delegationCredentialId?: string;
  name?: string;
  primary?: boolean;
  readOnly?: boolean;
  email?: string;
  integrationTitle?: string;
};

export type ConnectedCalendarsData = {
  connectedCalendars: ConnectedCalendar[];
  destinationCalendar: CalendarDestination;
};

export type SelectedCalendarInput = {
  integration: string;
  externalId: string;
  credentialId: number;
  delegationCredentialId?: string;
};

export type SelectedCalendar = {
  userId: number;
  integration: string;
  externalId: string;
  credentialId: number;
};
