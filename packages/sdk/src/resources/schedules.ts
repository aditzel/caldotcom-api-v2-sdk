/**
 * Schedules resource client
 */

import type { HttpClient } from '../lib/http-client.js';
import type { ApiResponse, PaginatedResponse } from '../types/common.js';
import type {
  Schedule,
  CreateScheduleInput,
  UpdateScheduleInput,
} from '../types/schedules.js';

export class SchedulesResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get all schedules
   * 
   * @see https://cal.com/docs/api-reference/v2/schedules/get-all-schedules
   */
  async list(params?: { page?: number; limit?: number }): Promise<Schedule[]> {
    // Note: API spec might define pagination differently, checking implementation
    const response = await this.http.get<PaginatedResponse<Schedule>>('/schedules', params);
    return response.data;
  }

  /**
   * Get default schedule
   * 
   * @see https://cal.com/docs/api-reference/v2/schedules/get-default-schedule
   */
  async getDefault(): Promise<Schedule> {
    const response = await this.http.get<ApiResponse<Schedule>>('/schedules/default');
    return response.data;
  }

  /**
   * Get a schedule
   * 
   * @see https://cal.com/docs/api-reference/v2/schedules/get-a-schedule
   */
  async get(scheduleId: number): Promise<Schedule> {
    const response = await this.http.get<ApiResponse<Schedule>>(`/schedules/${scheduleId}`);
    return response.data;
  }

  /**
   * Create a schedule
   * 
   * @see https://cal.com/docs/api-reference/v2/schedules/create-a-schedule
   */
  async create(input: CreateScheduleInput): Promise<Schedule> {
    const response = await this.http.post<ApiResponse<Schedule>>('/schedules', input);
    return response.data;
  }

  /**
   * Update a schedule
   * 
   * @see https://cal.com/docs/api-reference/v2/schedules/update-a-schedule
   */
  async update(scheduleId: number, input: UpdateScheduleInput): Promise<Schedule> {
    const response = await this.http.patch<ApiResponse<Schedule>>(`/schedules/${scheduleId}`, input);
    return response.data;
  }

  /**
   * Delete a schedule
   * 
   * @see https://cal.com/docs/api-reference/v2/schedules/delete-a-schedule
   */
  async delete(scheduleId: number): Promise<void> {
    await this.http.delete(`/schedules/${scheduleId}`);
  }
}
