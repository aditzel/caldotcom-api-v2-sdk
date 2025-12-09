/**
 * Calendars resource client
 */

import type { HttpClient } from '../lib/http-client.js';
import type { ApiResponse } from '../types/common.js';
import type {
  ConnectedCalendarsData,
  CalendarDestination,
  SelectedCalendarInput,
  SelectedCalendar,
} from '../types/calendars.js';

export class CalendarsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get all connected calendars
   * 
   * @see https://cal.com/docs/api-reference/v2/calendars/get-all-connected-calendars
   */
  async list(): Promise<ConnectedCalendarsData> {
    const response = await this.http.get<ApiResponse<ConnectedCalendarsData>>('/calendars');
    return response.data;
  }

  /**
   * Update destination calendar
   * 
   * @see https://cal.com/docs/api-reference/v2/destination-calendars/update-destination-calendar
   */
  async updateDestination(input: SelectedCalendarInput): Promise<CalendarDestination> {
    const response = await this.http.put<ApiResponse<CalendarDestination>>('/destination-calendars', input);
    return response.data;
  }

  /**
   * Add selected calendar
   * 
   * @see https://cal.com/docs/api-reference/v2/selected-calendars/create-selected-calendar
   */
  async addSelected(input: SelectedCalendarInput): Promise<SelectedCalendar> {
    const response = await this.http.post<ApiResponse<SelectedCalendar>>('/selected-calendars', input);
    return response.data;
  }

  /**
   * Remove selected calendar
   * 
   * @see https://cal.com/docs/api-reference/v2/selected-calendars/delete-selected-calendar
   */
  async removeSelected(input: SelectedCalendarInput): Promise<void> {
    // Manually construct query object matching the input structure but as primitive types for HttpClient
    const query: Record<string, string | number | boolean | undefined> = {
      integration: input.integration,
      externalId: input.externalId,
      credentialId: input.credentialId,
      delegationCredentialId: input.delegationCredentialId,
    };
    await this.http.delete('/selected-calendars', query);
  }
}
