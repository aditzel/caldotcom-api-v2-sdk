/**
 * Event Types resource client
 */

import type { HttpClient } from '../lib/http-client.js';
import type { ApiResponse, PaginatedResponse } from '../types/common.js';
import type {
  CreateEventTypeInput,
  UpdateEventTypeInput,
  EventType,
  GetEventTypesFilters,
} from '../types/event-types.js';

export class EventTypesResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Create an event type
   * 
   * @see https://cal.com/docs/api-reference/v2/event-types/create-an-event-type
   */
  async create(input: CreateEventTypeInput): Promise<EventType> {
    const response = await this.http.post<ApiResponse<EventType>>('/event-types', input);
    return response.data;
  }

  /**
   * Get all event types
   * 
   * @see https://cal.com/docs/api-reference/v2/event-types/get-all-event-types
   */
  async list(filters?: GetEventTypesFilters): Promise<EventType[]> {
    const query: Record<string, string | number | boolean | undefined> = {};

    if (filters) {
      if (filters.username) {
        query.username = filters.username;
      }
      if (filters.teamSlug) {
        query.teamSlug = filters.teamSlug;
      }
      if (filters.organizationSlug) {
        query.organizationSlug = filters.organizationSlug;
      }
      if (filters.includeHidden) {
        query.includeHidden = filters.includeHidden;
      }
    }

    const response = await this.http.get<PaginatedResponse<EventType>>('/event-types', query);
    return response.data;
  }

  /**
   * Get an event type by ID
   * 
   * @see https://cal.com/docs/api-reference/v2/event-types/get-an-event-type
   */
  async get(eventTypeId: number): Promise<EventType> {
    const response = await this.http.get<ApiResponse<EventType>>(`/event-types/${eventTypeId}`);
    return response.data;
  }

  /**
   * Get an event type by slug
   * 
   * @see https://cal.com/docs/api-reference/v2/event-types/get-an-event-type
   */
  async getBySlug(
    slug: string,
    username?: string,
    organizationSlug?: string
  ): Promise<EventType> {
    const query: Record<string, string> = {};
    if (username) {
      query.username = username;
    }
    if (organizationSlug) {
      query.organizationSlug = organizationSlug;
    }

    const response = await this.http.get<ApiResponse<EventType>>(
      `/event-types/slug/${slug}`,
      query
    );
    return response.data;
  }

  /**
   * Update an event type
   * 
   * @see https://cal.com/docs/api-reference/v2/event-types/update-an-event-type
   */
  async update(eventTypeId: number, input: UpdateEventTypeInput): Promise<EventType> {
    const response = await this.http.patch<ApiResponse<EventType>>(
      `/event-types/${eventTypeId}`,
      input
    );
    return response.data;
  }

  /**
   * Delete an event type
   * 
   * @see https://cal.com/docs/api-reference/v2/event-types/delete-an-event-type
   */
  async delete(eventTypeId: number): Promise<void> {
    await this.http.delete<ApiResponse<void>>(`/event-types/${eventTypeId}`);
  }
}
