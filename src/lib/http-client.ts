/**
 * HTTP client for Cal.com v2 API
 */

import type { AuthConfig } from '../types/auth.js';
import type { ErrorResponse } from '../types/common.js';
import {
  CalComError,
  CalComAuthError,
  CalComValidationError,
  CalComRateLimitError,
  CalComNotFoundError,
  CalComServerError,
} from './errors.js';

export type HttpClientOptions = {
  baseUrl?: string;
  auth: AuthConfig;
  apiVersion?: string;
  timeout?: number;
  maxRetries?: number;
};

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
};

export class HttpClient {
  private readonly baseUrl: string;
  private readonly auth: AuthConfig;
  private readonly apiVersion: string;
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl ?? 'https://api.cal.com/v2';
    this.auth = options.auth;
    this.apiVersion = options.apiVersion ?? '2024-08-13';
    this.timeout = options.timeout ?? 30000; // 30 seconds
    this.maxRetries = options.maxRetries ?? 3;
  }

  /**
   * Build authentication headers based on auth config
   */
  private getAuthHeaders(): Record<string, string> {
    switch (this.auth.type) {
      case 'apiKey':
        return {
          Authorization: `Bearer ${this.auth.apiKey}`,
        };
      case 'oauthClient':
        return {
          'x-cal-client-id': this.auth.clientId,
          'x-cal-secret-key': this.auth.secretKey,
        };
      case 'managedUser':
        return {
          Authorization: `Bearer ${this.auth.accessToken}`,
        };
    }
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(path, this.baseUrl);
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  /**
   * Handle HTTP errors and convert to custom error types
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: ErrorResponse | undefined;
    
    try {
      errorData = await response.json() as ErrorResponse;
    } catch {
      // If response body is not JSON, use status text
    }

    const message = errorData?.error?.message ?? response.statusText ?? 'Unknown error';

    switch (response.status) {
      case 400:
        throw new CalComValidationError(message, errorData?.error?.details);
      case 401:
      case 403:
        throw new CalComAuthError(message);
      case 404:
        throw new CalComNotFoundError(message);
      case 429: {
        const retryAfter = response.headers.get('Retry-After');
        throw new CalComRateLimitError(message, retryAfter ? parseInt(retryAfter, 10) : undefined);
      }
      case 500:
      case 502:
      case 503:
      case 504:
        throw new CalComServerError(message, response.status);
      default:
        throw new CalComError(`HTTP ${response.status}: ${message}`);
    }
  }

  /**
   * Execute HTTP request with retry logic
   */
  private async executeRequest<T>(
    url: string,
    options: RequestInit,
    retryCount = 0
  ): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      // Retry on network errors or 5xx server errors
      const shouldRetry =
        retryCount < this.maxRetries &&
        (error instanceof CalComServerError ||
          (error instanceof Error && error.name === 'AbortError'));

      if (shouldRetry) {
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = 1000 * Math.pow(2, retryCount);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.executeRequest<T>(url, options, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Make an HTTP request
   */
  async request<T>(options: RequestOptions): Promise<T> {
    const { method = 'GET', path, body, query, headers: customHeaders } = options;

    const url = this.buildUrl(path, query);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'cal-api-version': this.apiVersion,
      ...this.getAuthHeaders(),
      ...customHeaders,
    };

    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    return this.executeRequest<T>(url, requestOptions);
  }

  /**
   * Convenience method for GET requests
   */
  async get<T>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>({ method: 'GET', path, query });
  }

  /**
   * Convenience method for POST requests
   */
  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>({ method: 'POST', path, body });
  }

  /**
   * Convenience method for PUT requests
   */
  async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>({ method: 'PUT', path, body });
  }

  /**
   * Convenience method for PATCH requests
   */
  async patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>({ method: 'PATCH', path, body });
  }

  /**
   * Convenience method for DELETE requests
   */
  async delete<T>(path: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', path });
  }
}
