/**
 * Schedule types for Cal.com v2 API
 */

export type ScheduleDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type ScheduleAvailability = {
  days: ScheduleDay[];
  startTime: string;
  endTime: string;
};

export type ScheduleOverride = {
  date: string;
  startTime: string;
  endTime: string;
};

export type Schedule = {
  id: number;
  ownerId: number;
  name: string;
  timeZone: string;
  availability: ScheduleAvailability[];
  isDefault: boolean;
  overrides: ScheduleOverride[];
};

export type CreateScheduleInput = {
  name: string;
  timeZone: string;
  availability?: ScheduleAvailability[];
  isDefault: boolean;
  overrides?: ScheduleOverride[];
};

export type UpdateScheduleInput = {
  name?: string;
  timeZone?: string;
  availability?: ScheduleAvailability[];
  isDefault?: boolean;
  overrides?: ScheduleOverride[];
};
