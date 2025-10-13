/**
 * Cal.com v2 API SDK (placeholder)
 * Runtime: Bun/Node (ES2022+)
 */

export interface CalComClientOptions {
  apiKey: string;
  baseUrl?: string;
}

export class CalComClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(opts: CalComClientOptions) {
    this.apiKey = opts.apiKey;
    this.baseUrl = opts.baseUrl ?? 'https://api.cal.com/v2';
  }

  // Example placeholder method to validate wiring; replace with real API calls.
  async ping(): Promise<{ ok: boolean }> {
    return { ok: true };
  }
}

// Simple export for smoke tests and to demonstrate typings.
export const version = '0.1.0';
