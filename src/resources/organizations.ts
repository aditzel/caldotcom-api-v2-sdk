/**
 * Organizations resource client
 */

import type { HttpClient } from '../lib/http-client.js';
import { OrgAttributesResource } from './organizations/attributes.js';
import { OrgTeamsResource } from './organizations/teams.js';

export class OrganizationsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Access Organization Attributes resources
   * @param orgId - The organization ID
   */
  attributes(orgId: number): OrgAttributesResource {
    return new OrgAttributesResource(this.http, orgId);
  }

  /**
   * Access Organization Teams resources
   * @param orgId - The organization ID
   */
  teams(orgId: number): OrgTeamsResource {
    return new OrgTeamsResource(this.http, orgId);
  }

  // Add other sub-resources here as needed
}
