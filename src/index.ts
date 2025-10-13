/**
 * Cal.com v2 API SDK
 * Runtime: Bun/Node (ES2022+)
 */

import { HttpClient } from './lib/http-client.js';
import { BookingsResource } from './resources/bookings.js';
import { EventTypesResource } from './resources/event-types.js';
import type { AuthConfig } from './types/auth.js';

// Export all types
export * from './types/index.js';

// Export errors
export * from './lib/errors.js';

export interface CalComClientOptions {
  /**
   * Authentication configuration
   * - API key for regular users
   * - OAuth client credentials for platform customers
   * - Managed user access token for platform managed users
   */
  auth: AuthConfig;
  
  /**
   * Base URL for the Cal.com API
   * @default 'https://api.cal.com/v2'
   */
  baseUrl?: string;
  
  /**
   * API version to use
   * @default '2024-08-13'
   */
  apiVersion?: string;
  
  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;
  
  /**
   * Maximum number of retry attempts for failed requests
   * @default 3
   */
  maxRetries?: number;
}

/**
 * Main Cal.com API client
 * 
 * @example
 * ```typescript
 * // API Key authentication
 * const client = new CalComClient({
 *   auth: {
 *     type: 'apiKey',
 *     apiKey: 'cal_live_xxxxx'
 *   }
 * });
 * 
 * // OAuth client authentication
 * const platformClient = new CalComClient({
 *   auth: {
 *     type: 'oauthClient',
 *     clientId: 'your-client-id',
 *     secretKey: 'your-secret-key'
 *   }
 * });
 * 
 * // Managed user authentication
 * const managedUserClient = new CalComClient({
 *   auth: {
 *     type: 'managedUser',
 *     accessToken: 'access-token',
 *     refreshToken: 'refresh-token'
 *   }
 * });
 * ```
 */
export class CalComClient {
  private readonly http: HttpClient;
  
  /**
   * Bookings resource
   */
  public readonly bookings: BookingsResource;
  
  /**
   * Event Types resource
   */
  public readonly eventTypes: EventTypesResource;

  constructor(options: CalComClientOptions) {
    this.http = new HttpClient({
      baseUrl: options.baseUrl,
      auth: options.auth,
      apiVersion: options.apiVersion,
      timeout: options.timeout,
      maxRetries: options.maxRetries,
    });
    
    // Initialize resource clients
    this.bookings = new BookingsResource(this.http);
    this.eventTypes = new EventTypesResource(this.http);
  }
}

// SDK version
export const version = '0.1.0';
