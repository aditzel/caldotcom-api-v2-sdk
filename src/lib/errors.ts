/**
 * Custom error classes for Cal.com API errors
 */

export class CalComError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CalComError';
  }
}

export class CalComAuthError extends CalComError {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'CalComAuthError';
  }
}

export class CalComValidationError extends CalComError {
  public readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = 'CalComValidationError';
    this.details = details;
  }
}

export class CalComRateLimitError extends CalComError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message);
    this.name = 'CalComRateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class CalComNotFoundError extends CalComError {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'CalComNotFoundError';
  }
}

export class CalComServerError extends CalComError {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'CalComServerError';
    this.statusCode = statusCode;
  }
}
