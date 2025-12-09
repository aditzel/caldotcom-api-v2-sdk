/**
 * Webhook types for Cal.com v2 API
 */

export type WebhookTrigger = 
  | 'BOOKING_CREATED'
  | 'BOOKING_PAYMENT_INITIATED'
  | 'BOOKING_PAID'
  | 'BOOKING_RESCHEDULED'
  | 'BOOKING_REQUESTED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_NO_SHOW_UPDATED'
  | 'FORM_SUBMITTED'
  | 'MEETING_ENDED'
  | 'MEETING_STARTED'
  | 'RECORDING_READY'
  | 'INSTANT_MEETING'
  | 'RECORDING_TRANSCRIPTION_GENERATED'
  | 'OOO_CREATED'
  | 'AFTER_HOSTS_CAL_VIDEO_NO_SHOW'
  | 'AFTER_GUESTS_CAL_VIDEO_NO_SHOW'
  | 'FORM_SUBMITTED_NO_EVENT'
  | 'DELEGATION_CREDENTIAL_ERROR';

export type Webhook = {
  id: number;
  userId: number;
  payloadTemplate: string | null;
  triggers: WebhookTrigger[];
  subscriberUrl: string;
  active: boolean;
  secret?: string;
};

export type CreateWebhookInput = {
  subscriberUrl: string;
  triggers: WebhookTrigger[];
  active?: boolean;
  payloadTemplate?: string;
  secret?: string;
};

export type UpdateWebhookInput = {
  subscriberUrl?: string;
  triggers?: WebhookTrigger[];
  active?: boolean;
  payloadTemplate?: string;
  secret?: string;
};
