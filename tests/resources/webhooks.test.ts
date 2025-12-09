
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { WebhooksResource } from '../../src/resources/webhooks';
import type { HttpClient } from '../../src/lib/http-client';
import type { WebhookTrigger } from '../../src/types/webhooks';

describe('Webhooks Resource', () => {
  let resource: WebhooksResource;
  let mockHttp: HttpClient;

  beforeEach(() => {
    mockHttp = {
      get: mock(() => Promise.resolve({ data: {} })),
      post: mock(() => Promise.resolve({ data: {} })),
      patch: mock(() => Promise.resolve({ data: {} })),
      delete: mock(() => Promise.resolve({ data: {} })),
    } as unknown as HttpClient;

    resource = new WebhooksResource(mockHttp);
  });

  it('lists webhooks', async () => {
    await resource.list();
    expect(mockHttp.get).toHaveBeenCalledWith('/webhooks', undefined);
  });

  it('gets a webhook', async () => {
    await resource.get(1);
    expect(mockHttp.get).toHaveBeenCalledWith('/webhooks/1');
  });

  it('creates a webhook', async () => {
    const input = { 
      subscriberUrl: 'https://example.com', 
      triggers: ['BOOKING_CREATED'] as WebhookTrigger[] 
    };
    await resource.create(input);
    expect(mockHttp.post).toHaveBeenCalledWith('/webhooks', input);
  });

  it('updates a webhook', async () => {
    const input = { active: false };
    await resource.update(1, input);
    expect(mockHttp.patch).toHaveBeenCalledWith('/webhooks/1', input);
  });

  it('deletes a webhook', async () => {
    await resource.delete(1);
    expect(mockHttp.delete).toHaveBeenCalledWith('/webhooks/1');
  });
});
