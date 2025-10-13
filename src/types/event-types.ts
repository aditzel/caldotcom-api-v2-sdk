/**
 * Event Type types for Cal.com v2 API
 */

import type { Location, Metadata } from './index.js';

/**
 * Booking field types
 */
export type BookingField =
  | BookingFieldName
  | BookingFieldEmail
  | BookingFieldPhone
  | BookingFieldAddress
  | BookingFieldText
  | BookingFieldNumber
  | BookingFieldTextarea
  | BookingFieldSelect
  | BookingFieldMultiselect
  | BookingFieldCheckbox
  | BookingFieldRadio
  | BookingFieldBoolean;

type BaseBookingField = {
  label?: string;
  placeholder?: string;
  required?: boolean;
  disableOnPrefill?: boolean;
};

export type BookingFieldName = BaseBookingField & {
  type: 'name';
};

export type BookingFieldEmail = BaseBookingField & {
  type: 'email';
};

export type BookingFieldPhone = BaseBookingField & {
  type: 'phone';
};

export type BookingFieldAddress = BaseBookingField & {
  type: 'address';
};

export type BookingFieldText = BaseBookingField & {
  type: 'text';
};

export type BookingFieldNumber = BaseBookingField & {
  type: 'number';
};

export type BookingFieldTextarea = BaseBookingField & {
  type: 'textarea';
};

export type BookingFieldSelect = BaseBookingField & {
  type: 'select';
  options?: string[];
};

export type BookingFieldMultiselect = BaseBookingField & {
  type: 'multiselect';
  options?: string[];
};

export type BookingFieldCheckbox = BaseBookingField & {
  type: 'checkbox';
};

export type BookingFieldRadio = BaseBookingField & {
  type: 'radio';
  options?: string[];
};

export type BookingFieldBoolean = BaseBookingField & {
  type: 'boolean';
};

/**
 * Booking limits
 */
export type BookingLimitsCount = {
  day?: number;
  week?: number;
  month?: number;
  year?: number;
  disabled?: boolean;
};

export type BookingLimitsDuration = {
  day?: number; // must be multiple of 15
  week?: number;
  month?: number;
  year?: number;
};

/**
 * Booking window
 */
export type BookingWindow = {
  type: 'businessDays' | 'calendarDays' | 'range';
  value: number;
  rolling?: boolean;
};

/**
 * Booker layouts
 */
export type BookerLayouts = {
  defaultLayout: 'month' | 'week' | 'column';
  enabledLayouts: Array<'month' | 'week' | 'column'>;
};

/**
 * Confirmation policy
 */
export type ConfirmationPolicy = {
  type: 'always' | 'time';
  noticeThreshold?: {
    unit: 'minutes' | 'hours' | 'days';
    count: number;
  };
  blockUnconfirmedBookingsInBooker?: boolean;
};

/**
 * Recurrence settings
 */
export type Recurrence = {
  interval: number;
  occurrences: number;
  frequency: 'yearly' | 'monthly' | 'weekly';
};

/**
 * Color settings
 */
export type ColorSettings = {
  lightThemeHex: string;
  darkThemeHex: string;
};

/**
 * Seats settings
 */
export type SeatsSettings = {
  seatsPerTimeSlot: number;
  showAttendeeInfo: boolean;
  showAvailabilityCount: boolean;
};

/**
 * Destination calendar
 */
export type DestinationCalendar = {
  integration: string;
  externalId: string;
};

/**
 * Cal Video settings
 */
export type CalVideoSettings = {
  disableRecordingForOrganizer?: boolean;
  disableRecordingForGuests?: boolean;
  redirectUrlOnExit?: Record<string, unknown>;
  enableAutomaticRecordingForOrganizer?: boolean;
  enableAutomaticTranscription?: boolean;
  disableTranscriptionForGuests?: boolean;
  disableTranscriptionForOrganizer?: boolean;
};

/**
 * Create event type input
 */
export type CreateEventTypeInput = {
  lengthInMinutes: number;
  title: string;
  slug: string;
  lengthInMinutesOptions?: number[];
  description?: string;
  bookingFields?: BookingField[];
  disableGuests?: boolean;
  slotInterval?: number;
  minimumBookingNotice?: number;
  beforeEventBuffer?: number;
  afterEventBuffer?: number;
  scheduleId?: number;
  bookingLimitsCount?: BookingLimitsCount;
  onlyShowFirstAvailableSlot?: boolean;
  bookingLimitsDuration?: BookingLimitsDuration;
  bookingWindow?: BookingWindow;
  offsetStart?: number;
  bookerLayouts?: BookerLayouts;
  confirmationPolicy?: ConfirmationPolicy;
  recurrence?: Recurrence;
  requiresBookerEmailVerification?: boolean;
  hideCalendarNotes?: boolean;
  lockTimeZoneToggleOnBookingPage?: boolean;
  color?: ColorSettings;
  seats?: SeatsSettings;
  customName?: string;
  destinationCalendar?: DestinationCalendar;
  useDestinationCalendarEmail?: boolean;
  hideCalendarEventDetails?: boolean;
  successRedirectUrl?: string;
  hideOrganizerEmail?: boolean;
  calVideoSettings?: CalVideoSettings;
  hidden?: boolean;
  bookingRequiresAuthentication?: boolean;
  locations?: Location[];
};

/**
 * Update event type input
 */
export type UpdateEventTypeInput = Partial<CreateEventTypeInput>;

/**
 * Event type output
 */
export type EventType = {
  id: number;
  lengthInMinutes: number;
  title: string;
  slug: string;
  description: string;
  locations: Location[];
  bookingFields: BookingField[];
  disableGuests: boolean;
  slotInterval: number | null;
  minimumBookingNotice: number;
  beforeEventBuffer: number;
  afterEventBuffer: number;
  recurrence?: Recurrence;
  metadata: Metadata;
  price?: number;
  currency?: string;
  lockTimeZoneToggleOnBookingPage: boolean;
  seatsPerTimeSlot?: Record<string, unknown> | null;
  forwardParamsSuccessRedirect?: Record<string, unknown> | null;
  successRedirectUrl?: Record<string, unknown> | null;
  isInstantEvent: boolean;
  seatsShowAvailabilityCount?: boolean | null;
  scheduleId: number | null;
  bookingLimitsCount?: BookingLimitsCount;
  onlyShowFirstAvailableSlot?: boolean;
  bookingLimitsDuration?: BookingLimitsDuration;
  bookingWindow?: BookingWindow[];
  bookerLayouts?: BookerLayouts;
  confirmationPolicy?: ConfirmationPolicy;
  requiresBookerEmailVerification?: boolean;
  hideCalendarNotes?: boolean;
  color?: ColorSettings;
  seats?: SeatsSettings;
  offsetStart?: number;
  customName?: string;
  destinationCalendar?: DestinationCalendar;
  useDestinationCalendarEmail?: boolean;
  hideCalendarEventDetails?: boolean;
  hideOrganizerEmail?: boolean;
  calVideoSettings?: CalVideoSettings;
  hidden: boolean;
  bookingRequiresAuthentication: boolean;
  ownerId: number;
  users: string[];
  lengthInMinutesOptions?: number[];
};

/**
 * Get event types filters
 */
export type GetEventTypesFilters = {
  username?: string;
  teamSlug?: string;
  organizationSlug?: string;
  includeHidden?: boolean;
};
