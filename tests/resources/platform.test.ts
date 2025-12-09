
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { CalComClient } from '../../src/index';

describe('Platform Resources', () => {
  let client: CalComClient;
  let mockGet: any;
  let mockPost: any;
  let mockPatch: any;
  let mockDelete: any;

  beforeEach(() => {
    client = new CalComClient({
      auth: { 
        type: 'oauthClient', 
        clientId: 'client-id',
        secretKey: 'secret'
      },
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

  describe('Managed Users', () => {
    it('lists managed users', async () => {
      await client.platform.managedUsers.list();
      expect(mockGet).toHaveBeenCalledWith('/oauth-clients/client-id/users', undefined);
    });

    it('creates managed user', async () => {
      const input = { email: 'test@example.com', name: 'Test' };
      await client.platform.managedUsers.create(input);
      expect(mockPost).toHaveBeenCalledWith('/oauth-clients/client-id/users', input);
    });

    it('gets managed user', async () => {
      await client.platform.managedUsers.get(1);
      expect(mockGet).toHaveBeenCalledWith('/oauth-clients/client-id/users/1');
    });

    it('updates managed user', async () => {
      const input = { name: 'Updated' };
      await client.platform.managedUsers.update(1, input);
      expect(mockPatch).toHaveBeenCalledWith('/oauth-clients/client-id/users/1', input);
    });

    it('deletes managed user', async () => {
      await client.platform.managedUsers.delete(1);
      expect(mockDelete).toHaveBeenCalledWith('/oauth-clients/client-id/users/1');
    });

    it('force refresh tokens', async () => {
      await client.platform.managedUsers.forceRefresh(1);
      expect(mockPost).toHaveBeenCalledWith('/oauth-clients/client-id/users/1/force-refresh', {});
    });
  });

  describe('Platform Webhooks', () => {
    it('lists webhooks', async () => {
      await client.platform.webhooks.list();
      expect(mockGet).toHaveBeenCalledWith('/oauth-clients/client-id/webhooks', undefined);
    });

    it('creates webhook', async () => {
      const input = { subscriberUrl: 'https://example.com', triggers: ['BOOKING_CREATED'] as any[] };
      await client.platform.webhooks.create(input);
      expect(mockPost).toHaveBeenCalledWith('/oauth-clients/client-id/webhooks', input);
    });

    it('gets webhook', async () => {
      await client.platform.webhooks.get(1);
      expect(mockGet).toHaveBeenCalledWith('/oauth-clients/client-id/webhooks/1');
    });

    it('updates webhook', async () => {
      const input = { active: false };
      await client.platform.webhooks.update(1, input);
      expect(mockPatch).toHaveBeenCalledWith('/oauth-clients/client-id/webhooks/1', input);
    });

    it('deletes webhook', async () => {
      await client.platform.webhooks.delete(1);
      expect(mockDelete).toHaveBeenCalledWith('/oauth-clients/client-id/webhooks/1');
    });
  });
});
