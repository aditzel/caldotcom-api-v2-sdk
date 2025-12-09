
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { CalComClient } from '../../src/index';

describe('Organizations Resources', () => {
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

  describe('Org Attributes', () => {
    it('lists attributes', async () => {
      await client.organizations.attributes(1).list();
      expect(mockGet).toHaveBeenCalledWith('/organizations/1/attributes', undefined);
    });

    it('creates attribute', async () => {
      const input = { 
        name: 'Attr', 
        slug: 'attr', 
        type: 'TEXT' as const,
        options: [] 
      };
      await client.organizations.attributes(1).create(input);
      expect(mockPost).toHaveBeenCalledWith('/organizations/1/attributes', input);
    });

    it('gets attribute', async () => {
      await client.organizations.attributes(1).get('attr-id');
      expect(mockGet).toHaveBeenCalledWith('/organizations/1/attributes/attr-id');
    });

    it('deletes attribute', async () => {
      await client.organizations.attributes(1).delete('attr-id');
      expect(mockDelete).toHaveBeenCalledWith('/organizations/1/attributes/attr-id');
    });
  });

  describe('Org Teams', () => {
    it('lists teams', async () => {
      await client.organizations.teams(1).list();
      expect(mockGet).toHaveBeenCalledWith('/organizations/1/teams', undefined);
    });

    it('creates team', async () => {
      const input = { name: 'Org Team' };
      await client.organizations.teams(1).create(input);
      expect(mockPost).toHaveBeenCalledWith('/organizations/1/teams', input);
    });

    it('gets team', async () => {
      await client.organizations.teams(1).get(10);
      expect(mockGet).toHaveBeenCalledWith('/organizations/1/teams/10');
    });

    it('updates team', async () => {
      const input = { name: 'Updated Team' };
      await client.organizations.teams(1).update(10, input);
      expect(mockPatch).toHaveBeenCalledWith('/organizations/1/teams/10', input);
    });

    it('deletes team', async () => {
      await client.organizations.teams(1).delete(10);
      expect(mockDelete).toHaveBeenCalledWith('/organizations/1/teams/10');
    });
  });
});
