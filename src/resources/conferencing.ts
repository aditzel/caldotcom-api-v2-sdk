/**
 * Conferencing resource client
 */

import type { HttpClient } from '../lib/http-client.js';
import type { ApiResponse } from '../types/common.js';
import type { ConferencingApp, DefaultConferencingApp } from '../types/conferencing.js';

export class ConferencingResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get all connected conferencing apps
   * 
   * @see https://cal.com/docs/api-reference/v2/conferencing/get-all-conferencing-apps
   */
  async list(): Promise<ConferencingApp[]> {
    const response = await this.http.get<ApiResponse<ConferencingApp[]>>('/conferencing');
    return response.data;
  }

  /**
   * Get default conferencing app
   * 
   * @see https://cal.com/docs/api-reference/v2/conferencing/get-default-conferencing-app
   */
  async getDefault(): Promise<DefaultConferencingApp> {
    const response = await this.http.get<ApiResponse<DefaultConferencingApp>>('/conferencing/default');
    return response.data;
  }

  /**
   * Set default conferencing app
   * 
   * @see https://cal.com/docs/api-reference/v2/conferencing/set-default-conferencing-app
   */
  async setDefault(appSlug: string): Promise<DefaultConferencingApp> {
    const response = await this.http.post<ApiResponse<DefaultConferencingApp>>(`/conferencing/${appSlug}/default`, {});
    return response.data;
  }
}
