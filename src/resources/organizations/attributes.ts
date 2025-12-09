/**
 * Organization Attributes resource client
 */

import type { HttpClient } from '../../lib/http-client.js';
import type { ApiResponse, PaginatedResponse } from '../../types/common.js';
import type {
  OrganizationAttribute,
  CreateOrganizationAttributeInput,
} from '../../types/organizations.js';

export class OrgAttributesResource {
  constructor(
    private readonly http: HttpClient,
    private readonly orgId: number
  ) {}

  /**
   * Get all attributes
   * 
   * @see https://cal.com/docs/api-reference/v2/orgs-attributes/get-all-attributes
   */
  async list(params?: { page?: number; limit?: number }): Promise<OrganizationAttribute[]> {
    const response = await this.http.get<PaginatedResponse<OrganizationAttribute>>(`/organizations/${this.orgId}/attributes`, params);
    return response.data;
  }

  /**
   * Create an attribute
   * 
   * @see https://cal.com/docs/api-reference/v2/orgs-attributes/create-an-attribute
   */
  async create(input: CreateOrganizationAttributeInput): Promise<OrganizationAttribute> {
    const response = await this.http.post<ApiResponse<OrganizationAttribute>>(`/organizations/${this.orgId}/attributes`, input);
    return response.data;
  }

  /**
   * Get an attribute
   * 
   * @see https://cal.com/docs/api-reference/v2/orgs-attributes/get-an-attribute
   */
  async get(attributeId: string): Promise<OrganizationAttribute> {
    const response = await this.http.get<ApiResponse<OrganizationAttribute>>(`/organizations/${this.orgId}/attributes/${attributeId}`);
    return response.data;
  }

  // Update and Delete
  // Note: Types for update might be Partial<Create> or specific
  async delete(attributeId: string): Promise<void> {
    await this.http.delete(`/organizations/${this.orgId}/attributes/${attributeId}`);
  }
}
