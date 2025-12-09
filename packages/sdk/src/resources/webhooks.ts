/**
 * Webhooks resource client
 */

import type { HttpClient } from '../lib/http-client.js';
import type { ApiResponse, PaginatedResponse } from '../types/common.js';
import type {
  Webhook,
  CreateWebhookInput,
  UpdateWebhookInput,
} from '../types/webhooks.js';

export class WebhooksResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get all webhooks
   * 
   * @see https://cal.com/docs/api-reference/v2/webhooks/get-all-webhooks
   */
  async list(params?: { page?: number; limit?: number }): Promise<Webhook[]> {
    const response = await this.http.get<PaginatedResponse<Webhook>>('/webhooks', params);
    return response.data;
  }

  /**
   * Get a webhook
   * 
   * @see https://cal.com/docs/api-reference/v2/webhooks/get-a-webhook
   */
  async get(webhookId: number): Promise<Webhook> {
    const response = await this.http.get<ApiResponse<Webhook>>(`/webhooks/${webhookId}`);
    return response.data;
  }

  /**
   * Create a webhook
   * 
   * @see https://cal.com/docs/api-reference/v2/webhooks/create-a-webhook
   */
  async create(input: CreateWebhookInput): Promise<Webhook> {
    const response = await this.http.post<ApiResponse<Webhook>>('/webhooks', input);
    return response.data;
  }

  /**
   * Update a webhook
   * 
   * @see https://cal.com/docs/api-reference/v2/webhooks/update-a-webhook
   */
  async update(webhookId: number, input: UpdateWebhookInput): Promise<Webhook> {
    const response = await this.http.patch<ApiResponse<Webhook>>(`/webhooks/${webhookId}`, input);
    return response.data;
  }

  /**
   * Delete a webhook
   * 
   * @see https://cal.com/docs/api-reference/v2/webhooks/delete-a-webhook
   */
  async delete(webhookId: number): Promise<void> {
    await this.http.delete(`/webhooks/${webhookId}`);
  }
}
