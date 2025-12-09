/**
 * Me (User Profile) resource client
 */

import type { HttpClient } from '../lib/http-client.js';
import type { ApiResponse } from '../types/common.js';
import type { UserProfile, UpdateUserProfileInput } from '../types/me.js';

export class MeResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get authenticated user's profile
   *
   * Returns profile information for the currently authenticated user
   * (API key holder or managed user with access token).
   *
   * @see https://cal.com/docs/api-reference/v2/me/get-my-profile
   *
   * @example
   * ```typescript
   * const profile = await client.me.get();
   * console.log(profile.email, profile.timeZone);
   * ```
   */
  async get(): Promise<UserProfile> {
    const response = await this.http.get<ApiResponse<UserProfile>>('/me');
    return response.data;
  }

  /**
   * Update authenticated user's profile
   *
   * Updates profile settings for the currently authenticated user.
   * All fields are optional - only provide the fields you want to update.
   *
   * **Metadata Constraints:**
   * - Maximum 50 keys
   * - Key length: up to 40 characters
   * - Value length: up to 500 characters
   *
   * @see https://cal.com/docs/api-reference/v2/me/update-my-profile
   *
   * @param input - Partial user profile data to update
   * @returns Updated user profile
   *
   * @example
   * ```typescript
   * const updated = await client.me.update({
   *   timeZone: 'America/Los_Angeles',
   *   weekStart: 'Monday',
   *   timeFormat: 24,
   *   bio: 'Updated bio text',
   *   metadata: {
   *     customField: 'value',
   *     preference: 'darkMode'
   *   }
   * });
   * ```
   */
  async update(input: UpdateUserProfileInput): Promise<UserProfile> {
    const response = await this.http.patch<ApiResponse<UserProfile>>('/me', input);
    return response.data;
  }
}
