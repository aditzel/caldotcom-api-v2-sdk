import { describe, it, expect } from 'bun:test';
import { CalComClient, version } from '../src/index.js';

describe('SDK bootstrap', () => {
  it('exposes version', () => {
    expect(typeof version).toBe('string');
  });

  it('constructs', () => {
    const client = new CalComClient({
      auth: {
        type: 'apiKey',
        apiKey: 'test-key',
      },
    });
    expect(client).toBeDefined();
    expect(client.bookings).toBeDefined();
    expect(client.eventTypes).toBeDefined();
  });
  });
});
