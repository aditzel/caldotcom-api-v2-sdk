/**
 * Booking types for Cal.com v2 API
 */

import type { LanguageCode, TimeZone, BookingStatus, Metadata, SortDirection } from './common.js';

/**
 * Attendee information
 */
export type Attendee = {
  name: string;
  email: string;
  timeZone: TimeZone;
  language?: LanguageCode;
  phoneNumber?: string;
  absent?: boolean;
};

/**
 * Host information
 */
export type Host = {
  id: number;
  name: string;
  email: string;
  username: string;
  timeZone: TimeZone;
};

/**
 * Location types for bookings
 */
export type LocationAddress = {
  type: 'address';
  address?: string;
  public?: boolean;
};

export type LocationIntegration = {
  type: 'integration';
  integration: string;
};

export type LocationLink = {
  type: 'link';
  link: string;
};

export type LocationPhone = {
  type: 'phone';
  phone?: string;
};

export type Location = LocationAddress | LocationIntegration | LocationLink | LocationPhone;

/**
 * Routing information for team bookings
 */
export type RoutingInfo = {
  responseId?: number | null;
  queuedResponseId?: string | null;
  teamMemberIds?: number[];
  teamMemberEmail?: string;
  skipContactOwner?: boolean;
  crmAppSlug?: string;
  crmOwnerRecordType?: string;
};

/**
 * Create booking input
 */
export type CreateBookingInput = {
  start: string; // ISO 8601 in UTC
  attendee: {
    name: string;
    email: string;
    timeZone: TimeZone;
    phoneNumber?: string;
    language?: LanguageCode;
  };
  eventTypeId?: number;
  eventTypeSlug?: string;
  username?: string;
  teamSlug?: string;
  organizationSlug?: string;
  bookingFieldsResponses?: Record<string, unknown>;
  guests?: string[];
  location?: Location;
  metadata?: Metadata;
  lengthInMinutes?: number;
  routing?: RoutingInfo;
  emailVerificationCode?: string;
  /** @deprecated Use location instead */
  meetingUrl?: string;
};

/**
 * Create instant booking input (for team event types)
 */
export type CreateInstantBookingInput = CreateBookingInput & {
  instant: true;
};

/**
 * Create recurring booking input
 */
export type CreateRecurringBookingInput = Omit<CreateBookingInput, 'start'> & {
  start: string[];
};

/**
 * Booking output
 */
export type Booking = {
  id: number;
  uid: string;
  title: string;
  description: string;
  hosts: Host[];
  status: BookingStatus;
  start: string;
  end: string;
  duration: number;
  eventTypeId: number;
  eventType: {
    id: number;
    slug: string;
  };
  location: string;
  absentHost: boolean;
  createdAt: string;
  updatedAt: string;
  attendees: Attendee[];
  guests: string[];
  bookingFieldsResponses: Record<string, unknown>;
  metadata?: Metadata;
  cancellationReason?: string;
  cancelledByEmail?: string;
  reschedulingReason?: string;
  rescheduledByEmail?: string;
  rescheduledFromUid?: string;
  rescheduledToUid?: string;
  rating?: number;
  icsUid?: string;
  /** @deprecated Use location instead */
  meetingUrl?: string;
};

/**
 * Recurring booking output
 */
export type RecurringBooking = Booking & {
  recurringEventId: string;
};

/**
 * Get bookings filters
 */
export type GetBookingsFilters = {
  status?: BookingStatus | BookingStatus[];
  attendeeEmail?: string;
  eventTypeId?: number;
  eventTypeIds?: number[];
  teamId?: number;
  after?: string; // cursor for pagination
  before?: string;
  sort?: {
    field: 'start' | 'end' | 'createdAt';
    direction: SortDirection;
  };
  take?: number;
};

/**
 * Update booking input
 */
export type UpdateBookingInput = {
  start?: string;
  reschedulingReason?: string;
  metadata?: Metadata;
};

/**
 * Cancel booking input
 */
export type CancelBookingInput = {
  cancellationReason?: string;
};

/**
 * Reschedule booking input
 */
export type RescheduleBookingInput = {
  start: string;
  reschedulingReason?: string;
};
