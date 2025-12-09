/**
 * Platform Webhooks resource client
 */

import type { HttpClient } from '../../lib/http-client.js';
import { CalComError } from '../../lib/errors.js';
import type { ApiResponse, PaginatedResponse } from '../../types/common.js';
import type { PlatformWebhook } from '../../types/platform.js';
import type { CreateWebhookInput, UpdateWebhookInput } from '../../types/webhooks.js';

export class PlatformWebhooksResource {
  constructor(private readonly http: HttpClient) {}

  private getClientId(): string {
    const auth = this.http.getAuth();
    if (auth.type !== 'oauthClient') {
      throw new CalComError('Platform Webhooks API requires oauthClient authentication');
    }
    return auth.clientId;
  }

  /**
   * Get all platform webhooks
   * 
   * @see https://cal.com/docs/api-reference/v2/platform-webhooks/get-all-webhooks
   */
  async list(params?: { page?: number; limit?: number }): Promise<PlatformWebhook[]> {
    const clientId = this.getClientId();
    const response = await this.http.get<PaginatedResponse<PlatformWebhook>>(`/oauth-clients/${clientId}/webhooks`, params);
    return response.data;
  }

  /**
   * Create a platform webhook
   * 
   * @see https://cal.com/docs/api-reference/v2/platform-webhooks/create-a-webhook
   */
  async create(input: CreateWebhookInput): Promise<PlatformWebhook> {
    const clientId = this.getClientId();
    const response = await this.http.post<ApiResponse<PlatformWebhook>>(`/oauth-clients/${clientId}/webhooks`, input);
    return response.data;
  }

  /**
   * Get a platform webhook
   * 
   * @see https://cal.com/docs/api-reference/v2/platform-webhooks/get-a-webhook
   */
  async get(webhookId: number): Promise<PlatformWebhook> {
    const clientId = this.getClientId();
    const response = await this.http.get<ApiResponse<PlatformWebhook>>(`/oauth-clients/${clientId}/webhooks/${webhookId}`);
    return response.data;
  }

  /**
   * Update a platform webhook
   * 
   * @see https://cal.com/docs/api-reference/v2/platform-webhooks/update-a-webhook
   */
  async update(webhookId: number, input: UpdateWebhookInput): Promise<PlatformWebhook> {
    const clientId = this.getClientId();
    const response = await this.http.patch<ApiResponse<PlatformWebhook>>(`/oauth-clients/${clientId}/webhooks/${webhookId}`, input);
    return response.data;
  }

  /**
   * Delete a platform webhook
   * 
   * @see https://cal.com/docs/api-reference/v2/platform-webhooks/delete-a-webhook
   */
  async delete(webhookId: number): Promise<void> {
    const clientId = this.getClientId();
    await this.http.delete(`/oauth-clients/${clientId}/webhooks/${webhookId}`);
  }
}
