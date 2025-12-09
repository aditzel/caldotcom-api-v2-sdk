/**
 * Slots resource client
 */

import type { HttpClient } from '../lib/http-client.js';
import type { ApiResponse } from '../types/common.js';
import type {
  AvailableSlots,
  AvailableRangeSlots,
  GetAvailableSlotsOptions,
  ReserveSlotInput,
  ReserveSlotOutput,
} from '../types/slots.js';

export class SlotsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get available slots
   * 
   * @see https://cal.com/docs/api-reference/v2/slots/get-available-slots
   */
  async getAvailable(options: GetAvailableSlotsOptions): Promise<AvailableSlots | AvailableRangeSlots> {
    const query: Record<string, string | number | boolean | undefined> = {
      ...options,
      usernames: options.usernames?.join(','),
    };
    const response = await this.http.get<ApiResponse<AvailableSlots | AvailableRangeSlots>>('/slots', query);
    return response.data;
  }

  /**
   * Reserve a slot
   * 
   * @see https://cal.com/docs/api-reference/v2/slots/reserve-a-slot
   */
  async reserve(input: ReserveSlotInput): Promise<ReserveSlotOutput> {
    const response = await this.http.post<ApiResponse<ReserveSlotOutput>>('/slots/reservations', input);
    return response.data;
  }

  /**
   * Remove a reservation
   * 
   * @see https://cal.com/docs/api-reference/v2/slots/delete-a-reservation
   */
  async removeReservation(uid: string): Promise<void> {
    await this.http.delete(`/slots/reservations/${uid}`);
  }
}
