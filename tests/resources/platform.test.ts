
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { ManagedUsersResource } from '../../src/resources/platform/managed-users';
import { PlatformWebhooksResource } from '../../src/resources/platform/webhooks';
import type { HttpClient } from '../../src/lib/http-client';
import type { WebhookTrigger } from '../../src/types/webhooks';

describe('Platform Resources', () => {
  let mockHttp: HttpClient;

  beforeEach(() => {
    mockHttp = {
      get: mock(() => Promise.resolve({ data: {} })),
      post: mock(() => Promise.resolve({ data: {} })),
      patch: mock(() => Promise.resolve({ data: {} })),
      delete: mock(() => Promise.resolve({ data: {} })),
      getAuth: mock(() => ({ 
        type: 'oauthClient', 
        clientId: 'client-id', 
        secretKey: 'secret' 
      })),
    } as unknown as HttpClient;
  });

  describe('Managed Users', () => {
    let resource: ManagedUsersResource;
    
    beforeEach(() => {
      resource = new ManagedUsersResource(mockHttp);
    });

    it('lists managed users', async () => {
      await resource.list();
      expect(mockHttp.get).toHaveBeenCalledWith('/oauth-clients/client-id/users', undefined);
    });

    it('creates managed user', async () => {
      const input = { email: 'test@example.com', name: 'Test' };
      await resource.create(input);
      expect(mockHttp.post).toHaveBeenCalledWith('/oauth-clients/client-id/users', input);
    });

    it('gets managed user', async () => {
      await resource.get(1);
      expect(mockHttp.get).toHaveBeenCalledWith('/oauth-clients/client-id/users/1');
    });

    it('updates managed user', async () => {
      const input = { name: 'Updated' };
      await resource.update(1, input);
      expect(mockHttp.patch).toHaveBeenCalledWith('/oauth-clients/client-id/users/1', input);
    });

    it('deletes managed user', async () => {
      await resource.delete(1);
      expect(mockHttp.delete).toHaveBeenCalledWith('/oauth-clients/client-id/users/1');
    });

    it('force refresh tokens', async () => {
      await resource.forceRefresh(1);
      expect(mockHttp.post).toHaveBeenCalledWith('/oauth-clients/client-id/users/1/force-refresh', {});
    });
  });

  describe('Platform Webhooks', () => {
    let resource: PlatformWebhooksResource;
    
    beforeEach(() => {
      resource = new PlatformWebhooksResource(mockHttp);
    });

    it('lists webhooks', async () => {
      await resource.list();
      expect(mockHttp.get).toHaveBeenCalledWith('/oauth-clients/client-id/webhooks', undefined);
    });

    it('creates webhook', async () => {
      const input = { subscriberUrl: 'https://example.com', triggers: ['BOOKING_CREATED'] as WebhookTrigger[] };
      await resource.create(input);
      expect(mockHttp.post).toHaveBeenCalledWith('/oauth-clients/client-id/webhooks', input);
    });

    it('gets webhook', async () => {
      await resource.get(1);
      expect(mockHttp.get).toHaveBeenCalledWith('/oauth-clients/client-id/webhooks/1');
    });

    it('updates webhook', async () => {
      const input = { active: false };
      await resource.update(1, input);
      expect(mockHttp.patch).toHaveBeenCalledWith('/oauth-clients/client-id/webhooks/1', input);
    });

    it('deletes webhook', async () => {
      await resource.delete(1);
      expect(mockHttp.delete).toHaveBeenCalledWith('/oauth-clients/client-id/webhooks/1');
    });
  });
});
