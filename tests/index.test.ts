import { describe, it, expect } from 'bun:test';
import { CalComClient, version } from '../src/index';

describe('SDK bootstrap', () => {
  it('exposes version', () => {
    expect(typeof version).toBe('string');
  });

  it('constructs and ping works', async () => {
    const client = new CalComClient({ apiKey: 'test' });
    const res = await client.ping();
    expect(res.ok).toBe(true);
  });
});
