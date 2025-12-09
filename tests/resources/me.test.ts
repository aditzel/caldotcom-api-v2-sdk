
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { CalComClient } from '../../src/index';

describe('Me Resource', () => {
  let client: CalComClient;
  let mockGet: any;
  let mockPatch: any;

  beforeEach(() => {
    client = new CalComClient({
      auth: { type: 'apiKey', apiKey: 'test-key' },
    });

    const http = (client as any).http;
    mockGet = mock(() => Promise.resolve({ data: {} }));
    mockPatch = mock(() => Promise.resolve({ data: {} }));

    http.get = mockGet;
    http.patch = mockPatch;
  });

  it('gets current user', async () => {
    await client.me.get();
    expect(mockGet).toHaveBeenCalledWith('/me');
  });

  it('updates current user', async () => {
    const input = { bio: 'New Bio' };
    await client.me.update(input);
    expect(mockPatch).toHaveBeenCalledWith('/me', input);
  });
});
