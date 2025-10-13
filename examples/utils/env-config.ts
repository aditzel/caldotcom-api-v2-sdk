/**
 * Utility to create Cal.com client from environment variables
 * 
 * This makes it easy to configure the client without hardcoding credentials
 */

import { CalComClient, type CalComClientOptions, type AuthConfig } from '../../src/index.js';

export class EnvConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvConfigError';
  }
}

/**
 * Load authentication config from environment variables
 * Automatically detects which auth method to use based on available env vars
 */
export function loadAuthFromEnv(): AuthConfig {
  // Check for API Key authentication
  if (process.env.CALDOTCOM_API_KEY) {
    return {
      type: 'apiKey',
      apiKey: process.env.CALDOTCOM_API_KEY,
    };
  }

  // Check for OAuth Client authentication
  if (process.env.CALDOTCOM_CLIENT_ID && process.env.CALDOTCOM_SECRET_KEY) {
    return {
      type: 'oauthClient',
      clientId: process.env.CALDOTCOM_CLIENT_ID,
      secretKey: process.env.CALDOTCOM_SECRET_KEY,
    };
  }

  // Check for Managed User authentication
  if (process.env.CALDOTCOM_ACCESS_TOKEN) {
    return {
      type: 'managedUser',
      accessToken: process.env.CALDOTCOM_ACCESS_TOKEN,
      refreshToken: process.env.CALDOTCOM_REFRESH_TOKEN,
    };
  }

  throw new EnvConfigError(
    'No Cal.com credentials found in environment variables. ' +
    'Please set one of: CALDOTCOM_API_KEY, CALDOTCOM_CLIENT_ID + CALDOTCOM_SECRET_KEY, or CALDOTCOM_ACCESS_TOKEN'
  );
}

/**
 * Create a Cal.com client from environment variables
 * 
 * @example
 * ```typescript
 * import { createClientFromEnv } from './utils/env-config';
 * 
 * const client = createClientFromEnv();
 * const bookings = await client.bookings.list();
 * ```
 */
export function createClientFromEnv(): CalComClient {
  const auth = loadAuthFromEnv();

  const options: CalComClientOptions = {
    auth,
  };

  // Load optional config from environment
  if (process.env.CALDOTCOM_BASE_URL) {
    options.baseUrl = process.env.CALDOTCOM_BASE_URL;
  }

  if (process.env.CALDOTCOM_API_VERSION) {
    options.apiVersion = process.env.CALDOTCOM_API_VERSION;
  }

  if (process.env.CALDOTCOM_TIMEOUT) {
    const timeout = parseInt(process.env.CALDOTCOM_TIMEOUT, 10);
    if (!isNaN(timeout)) {
      options.timeout = timeout;
    }
  }

  if (process.env.CALDOTCOM_MAX_RETRIES) {
    const maxRetries = parseInt(process.env.CALDOTCOM_MAX_RETRIES, 10);
    if (!isNaN(maxRetries)) {
      options.maxRetries = maxRetries;
    }
  }

  return new CalComClient(options);
}

/**
 * Validate that required environment variables are set
 * Throws an error with helpful message if any are missing
 */
export function validateEnv(requiredVars: string[]): void {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new EnvConfigError(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please copy .env.example to .env and fill in your credentials.'
    );
  }
}

/**
 * Get a required environment variable or throw an error
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new EnvConfigError(
      `Missing required environment variable: ${key}\n` +
      'Please copy .env.example to .env and fill in your credentials.'
    );
  }
  return value;
}

/**
 * Get an optional environment variable with a default value
 */
export function getEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}
