/**
 * Bookings resource client
 */

import type { HttpClient } from '../lib/http-client.js';
import type { ApiResponse, PaginatedResponse } from '../types/common.js';
import type {
  CreateBookingInput,
  CreateInstantBookingInput,
  CreateRecurringBookingInput,
  Booking,
  RecurringBooking,
  GetBookingsFilters,
  UpdateBookingInput,
  CancelBookingInput,
  RescheduleBookingInput,
} from '../types/bookings.js';

export class BookingsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Create a booking
   * 
   * @see https://cal.com/docs/api-reference/v2/bookings/create-a-booking
   */
  async create(
    input: CreateBookingInput | CreateInstantBookingInput | CreateRecurringBookingInput
  ): Promise<Booking | RecurringBooking[]> {
    const response = await this.http.post<ApiResponse<Booking | RecurringBooking[]>>(
      '/bookings',
      input
    );
    return response.data;
  }

  /**
   * Get all bookings
   * 
   * @see https://cal.com/docs/api-reference/v2/bookings/get-all-bookings
   */
  async list(filters?: GetBookingsFilters): Promise<Booking[]> {
    const query: Record<string, string | number | boolean | undefined> = {};

    if (filters) {
      if (filters.status) {
        query.status = Array.isArray(filters.status)
          ? filters.status.join(',')
          : filters.status;
      }
      if (filters.attendeeEmail) {
        query.attendeeEmail = filters.attendeeEmail;
      }
      if (filters.eventTypeId) {
        query.eventTypeId = filters.eventTypeId;
      }
      if (filters.eventTypeIds) {
        query.eventTypeIds = filters.eventTypeIds.join(',');
      }
      if (filters.teamId) {
        query.teamId = filters.teamId;
      }
      if (filters.after) {
        query.after = filters.after;
      }
      if (filters.before) {
        query.before = filters.before;
      }
      if (filters.take) {
        query.take = filters.take;
      }
      if (filters.sort) {
        query.sortBy = filters.sort.field;
        query.sortDir = filters.sort.direction;
      }
    }

    const response = await this.http.get<PaginatedResponse<Booking>>('/bookings', query);
    return response.data;
  }

  /**
   * Get a booking by ID
   * 
   * @see https://cal.com/docs/api-reference/v2/bookings/get-a-booking
   */
  async get(bookingId: number): Promise<Booking> {
    const response = await this.http.get<ApiResponse<Booking>>(`/bookings/${bookingId}`);
    return response.data;
  }

  /**
   * Get a booking by UID
   * 
   * @see https://cal.com/docs/api-reference/v2/bookings/get-a-booking-by-uid
   */
  async getByUid(uid: string): Promise<Booking> {
    const response = await this.http.get<ApiResponse<Booking>>(`/bookings/uid/${uid}`);
    return response.data;
  }

  /**
   * Update a booking
   * 
   * @see https://cal.com/docs/api-reference/v2/bookings/update-a-booking
   */
  async update(bookingId: number, input: UpdateBookingInput): Promise<Booking> {
    const response = await this.http.patch<ApiResponse<Booking>>(
      `/bookings/${bookingId}`,
      input
    );
    return response.data;
  }

  /**
   * Cancel a booking
   * 
   * @see https://cal.com/docs/api-reference/v2/bookings/cancel-a-booking
   */
  async cancel(bookingId: number, input?: CancelBookingInput): Promise<Booking> {
    const response = await this.http.post<ApiResponse<Booking>>(
      `/bookings/${bookingId}/cancel`,
      input ?? {}
    );
    return response.data;
  }

  /**
   * Reschedule a booking
   * 
   * @see https://cal.com/docs/api-reference/v2/bookings/reschedule-a-booking
   */
  async reschedule(bookingId: number, input: RescheduleBookingInput): Promise<Booking> {
    const response = await this.http.post<ApiResponse<Booking>>(
      `/bookings/${bookingId}/reschedule`,
      input
    );
    return response.data;
  }

  /**
   * Mark a booking as no-show
   * 
   * @see https://cal.com/docs/api-reference/v2/bookings/mark-no-show
   */
  async markNoShow(bookingId: number): Promise<Booking> {
    const response = await this.http.post<ApiResponse<Booking>>(
      `/bookings/${bookingId}/mark-absent`,
      { attendees: [] } // Mark all attendees as absent
    );
    return response.data;
  }
}
