/**
 * Managed Users resource client
 */

import type { HttpClient } from '../../lib/http-client.js';
import { CalComError } from '../../lib/errors.js';
import type { ApiResponse, PaginatedResponse } from '../../types/common.js';
import type {
  ManagedUser,
  CreateManagedUserInput,
  CreateManagedUserData,
  UpdateManagedUserInput,
  ForceRefreshOutput,
} from '../../types/platform.js';

export class ManagedUsersResource {
  constructor(private readonly http: HttpClient) {}

  private getClientId(): string {
    const auth = this.http.getAuth();
    if (auth.type !== 'oauthClient') {
      throw new CalComError('Managed Users API requires oauthClient authentication');
    }
    return auth.clientId;
  }

  /**
   * Get all managed users
   * 
   * @see https://cal.com/docs/api-reference/v2/platform-managed-users/get-all-managed-users
   */
  async list(params?: { page?: number; limit?: number }): Promise<ManagedUser[]> {
    const clientId = this.getClientId();
    const response = await this.http.get<PaginatedResponse<ManagedUser>>(`/oauth-clients/${clientId}/users`, params);
    return response.data;
  }

  /**
   * Create a managed user
   * 
   * @see https://cal.com/docs/api-reference/v2/platform-managed-users/create-a-managed-user
   */
  async create(input: CreateManagedUserInput): Promise<CreateManagedUserData> {
    const clientId = this.getClientId();
    const response = await this.http.post<ApiResponse<CreateManagedUserData>>(`/oauth-clients/${clientId}/users`, input);
    return response.data;
  }

  /**
   * Get a managed user
   * 
   * @see https://cal.com/docs/api-reference/v2/platform-managed-users/get-a-managed-user
   */
  async get(userId: number): Promise<ManagedUser> {
    const clientId = this.getClientId();
    const response = await this.http.get<ApiResponse<ManagedUser>>(`/oauth-clients/${clientId}/users/${userId}`);
    return response.data;
  }

  /**
   * Update a managed user
   * 
   * @see https://cal.com/docs/api-reference/v2/platform-managed-users/update-a-managed-user
   */
  async update(userId: number, input: UpdateManagedUserInput): Promise<ManagedUser> {
    const clientId = this.getClientId();
    const response = await this.http.patch<ApiResponse<ManagedUser>>(`/oauth-clients/${clientId}/users/${userId}`, input);
    return response.data;
  }

  /**
   * Delete a managed user
   * 
   * @see https://cal.com/docs/api-reference/v2/platform-managed-users/delete-a-managed-user
   */
  async delete(userId: number): Promise<void> {
    const clientId = this.getClientId();
    await this.http.delete(`/oauth-clients/${clientId}/users/${userId}`);
  }

  /**
   * Force refresh tokens for a managed user
   * 
   * @see https://cal.com/docs/api-reference/v2/platform-managed-users/force-refresh-tokens
   */
  async forceRefresh(userId: number): Promise<ForceRefreshOutput> {
    const clientId = this.getClientId();
    const response = await this.http.post<ApiResponse<ForceRefreshOutput>>(`/oauth-clients/${clientId}/users/${userId}/force-refresh`, {});
    return response.data;
  }
}
