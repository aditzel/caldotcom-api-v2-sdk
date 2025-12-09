/**
 * Slots types for Cal.com v2 API
 */

export type AvailableSlots = Record<string, string[]>;

export type TimeRangeSlot = {
  start: string;
  end: string;
};

export type AvailableRangeSlots = Record<string, TimeRangeSlot[]>;

export type GetAvailableSlotsOptions = {
  eventTypeId?: number;
  eventTypeSlug?: string;
  username?: string;
  organizationSlug?: string;
  teamSlug?: string;
  usernames?: string[];
  start: string;
  end: string;
  timeZone?: string;
  duration?: number;
  format?: 'range';
  bookingUidToReschedule?: string;
};

export type ReserveSlotInput = {
  eventTypeId: number;
  slotStart: string;
  slotDuration?: number;
  reservationDuration?: number;
};

export type ReserveSlotOutput = {
  eventTypeId: number;
  slotStart: string;
  slotEnd: string;
  slotDuration: number;
  reservationUid: string;
  reservationDuration: number;
  reservationUntil: string;
};
