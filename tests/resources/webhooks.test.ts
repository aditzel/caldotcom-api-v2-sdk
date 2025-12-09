
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { CalComClient } from '../../src/index';

describe('Webhooks Resource', () => {
  let client: CalComClient;
  let mockGet: any;
  let mockPost: any;
  let mockPatch: any;
  let mockDelete: any;

  beforeEach(() => {
    client = new CalComClient({
      auth: { type: 'apiKey', apiKey: 'test-key' },
    });

    const http = (client as any).http;
    mockGet = mock(() => Promise.resolve({ data: {} }));
    mockPost = mock(() => Promise.resolve({ data: {} }));
    mockPatch = mock(() => Promise.resolve({ data: {} }));
    mockDelete = mock(() => Promise.resolve({ data: {} }));

    http.get = mockGet;
    http.post = mockPost;
    http.patch = mockPatch;
    http.delete = mockDelete;
  });

  it('lists webhooks', async () => {
    await client.webhooks.list();
    expect(mockGet).toHaveBeenCalledWith('/webhooks', undefined);
  });

  it('gets a webhook', async () => {
    await client.webhooks.get(1);
    expect(mockGet).toHaveBeenCalledWith('/webhooks/1');
  });

  it('creates a webhook', async () => {
    const input = { 
      subscriberUrl: 'https://example.com', 
      triggers: ['BOOKING_CREATED'] as any[] 
    };
    await client.webhooks.create(input);
    expect(mockPost).toHaveBeenCalledWith('/webhooks', input);
  });

  it('updates a webhook', async () => {
    const input = { active: false };
    await client.webhooks.update(1, input);
    expect(mockPatch).toHaveBeenCalledWith('/webhooks/1', input);
  });

  it('deletes a webhook', async () => {
    await client.webhooks.delete(1);
    expect(mockDelete).toHaveBeenCalledWith('/webhooks/1');
  });
});
