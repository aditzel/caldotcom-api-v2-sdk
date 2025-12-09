/**
 * Teams resource client
 */

import type { HttpClient } from '../lib/http-client.js';
import type { ApiResponse, PaginatedResponse } from '../types/common.js';
import type {
  Team,
  CreateTeamInput,
  UpdateTeamInput,
  TeamMembership,
  CreateTeamMembershipInput,
  UpdateTeamMembershipInput,
  TeamEventType,
  CreateTeamEventTypeInput,
  UpdateTeamEventTypeInput,
} from '../types/teams.js';

export class TeamsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get all teams
   * 
   * @see https://cal.com/docs/api-reference/v2/teams/get-all-teams
   */
  async list(params?: { page?: number; limit?: number }): Promise<Team[]> {
    const response = await this.http.get<PaginatedResponse<Team>>('/teams', params);
    return response.data;
  }

  /**
   * Get a team
   * 
   * @see https://cal.com/docs/api-reference/v2/teams/get-a-team
   */
  async get(teamId: number): Promise<Team> {
    const response = await this.http.get<ApiResponse<Team>>(`/teams/${teamId}`);
    return response.data;
  }

  /**
   * Create a team
   * 
   * @see https://cal.com/docs/api-reference/v2/teams/create-a-team
   */
  async create(input: CreateTeamInput): Promise<Team> {
    const response = await this.http.post<ApiResponse<Team>>('/teams', input);
    return response.data;
  }

  /**
   * Update a team
   * 
   * @see https://cal.com/docs/api-reference/v2/teams/update-a-team
   */
  async update(teamId: number, input: UpdateTeamInput): Promise<Team> {
    const response = await this.http.patch<ApiResponse<Team>>(`/teams/${teamId}`, input);
    return response.data;
  }

  /**
   * Delete a team
   * 
   * @see https://cal.com/docs/api-reference/v2/teams/delete-a-team
   */
  async delete(teamId: number): Promise<void> {
    await this.http.delete(`/teams/${teamId}`);
  }

  // Memberships

  /**
   * Get team memberships
   */
  async getMemberships(teamId: number, params?: { page?: number; limit?: number }): Promise<TeamMembership[]> {
    const response = await this.http.get<PaginatedResponse<TeamMembership>>(`/teams/${teamId}/memberships`, params);
    return response.data;
  }

  /**
   * Add a membership to a team
   */
  async addMembership(teamId: number, input: CreateTeamMembershipInput): Promise<TeamMembership> {
    const response = await this.http.post<ApiResponse<TeamMembership>>(`/teams/${teamId}/memberships`, input);
    return response.data;
  }

  /**
   * Get a team membership
   */
  async getMembership(teamId: number, membershipId: number): Promise<TeamMembership> {
    const response = await this.http.get<ApiResponse<TeamMembership>>(`/teams/${teamId}/memberships/${membershipId}`);
    return response.data;
  }

  /**
   * Update a team membership
   */
  async updateMembership(teamId: number, membershipId: number, input: UpdateTeamMembershipInput): Promise<TeamMembership> {
    const response = await this.http.patch<ApiResponse<TeamMembership>>(`/teams/${teamId}/memberships/${membershipId}`, input);
    return response.data;
  }

  /**
   * Remove a team membership
   */
  async removeMembership(teamId: number, membershipId: number): Promise<void> {
    await this.http.delete(`/teams/${teamId}/memberships/${membershipId}`);
  }

  // Team Event Types

  /**
   * Get team event types
   */
  async getEventTypes(teamId: number, params?: { page?: number; limit?: number }): Promise<TeamEventType[]> {
    const response = await this.http.get<PaginatedResponse<TeamEventType>>(`/teams/${teamId}/event-types`, params);
    return response.data;
  }

  /**
   * Create a team event type
   */
  async createEventType(teamId: number, input: CreateTeamEventTypeInput): Promise<TeamEventType> {
    const response = await this.http.post<ApiResponse<TeamEventType>>(`/teams/${teamId}/event-types`, input);
    return response.data;
  }

  /**
   * Get a team event type
   */
  async getEventType(teamId: number, eventTypeId: number): Promise<TeamEventType> {
    const response = await this.http.get<ApiResponse<TeamEventType>>(`/teams/${teamId}/event-types/${eventTypeId}`);
    return response.data;
  }

  /**
   * Update a team event type
   */
  async updateEventType(teamId: number, eventTypeId: number, input: UpdateTeamEventTypeInput): Promise<TeamEventType> {
    const response = await this.http.patch<ApiResponse<TeamEventType>>(`/teams/${teamId}/event-types/${eventTypeId}`, input);
    return response.data;
  }

  /**
   * Delete a team event type
   */
  async deleteEventType(teamId: number, eventTypeId: number): Promise<void> {
    await this.http.delete(`/teams/${teamId}/event-types/${eventTypeId}`);
  }
}
