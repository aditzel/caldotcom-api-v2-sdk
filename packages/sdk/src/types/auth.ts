/**
 * Authentication types for Cal.com v2 API
 */

/**
 * API key authentication (for non-platform users)
 */
export type ApiKeyAuth = {
  type: 'apiKey';
  apiKey: string; // prefixed with cal_ or cal_live_
};

/**
 * OAuth client credentials (for platform customers)
 */
export type OAuthClientAuth = {
  type: 'oauthClient';
  clientId: string;
  secretKey: string;
};

/**
 * Managed user access token (for platform managed users)
 */
export type ManagedUserAuth = {
  type: 'managedUser';
  accessToken: string;
  refreshToken?: string;
};

/**
 * Union type of all authentication methods
 */
export type AuthConfig = ApiKeyAuth | OAuthClientAuth | ManagedUserAuth;

/**
 * Token refresh response
 */
export type TokenRefreshResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until expiration (typically 3600 for access token)
};

