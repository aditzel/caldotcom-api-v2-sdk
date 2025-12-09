/**
 * Organization Teams resource client
 */

import type { HttpClient } from '../../lib/http-client.js';
import type { ApiResponse, PaginatedResponse } from '../../types/common.js';
import type { Team, CreateTeamInput, UpdateTeamInput } from '../../types/teams.js';

export class OrgTeamsResource {
  constructor(
    private readonly http: HttpClient,
    private readonly orgId: number
  ) {}

  /**
   * Get all teams
   */
  async list(params?: { page?: number; limit?: number }): Promise<Team[]> {
    const response = await this.http.get<PaginatedResponse<Team>>(`/organizations/${this.orgId}/teams`, params);
    return response.data;
  }

  /**
   * Create a team
   */
  async create(input: CreateTeamInput): Promise<Team> {
    const response = await this.http.post<ApiResponse<Team>>(`/organizations/${this.orgId}/teams`, input);
    return response.data;
  }

  /**
   * Get a team
   */
  async get(teamId: number): Promise<Team> {
    const response = await this.http.get<ApiResponse<Team>>(`/organizations/${this.orgId}/teams/${teamId}`);
    return response.data;
  }

  /**
   * Update a team
   */
  async update(teamId: number, input: UpdateTeamInput): Promise<Team> {
    const response = await this.http.patch<ApiResponse<Team>>(`/organizations/${this.orgId}/teams/${teamId}`, input);
    return response.data;
  }

  /**
   * Delete a team
   */
  async delete(teamId: number): Promise<void> {
    await this.http.delete(`/organizations/${this.orgId}/teams/${teamId}`);
  }
}
