
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { OrganizationsResource } from '../../src/resources/organizations';
import type { HttpClient } from '../../src/lib/http-client';

describe('Organizations Resources', () => {
  let resource: OrganizationsResource;
  let mockHttp: HttpClient;

  beforeEach(() => {
    mockHttp = {
      get: mock(() => Promise.resolve({ data: {} })),
      post: mock(() => Promise.resolve({ data: {} })),
      patch: mock(() => Promise.resolve({ data: {} })),
      delete: mock(() => Promise.resolve({ data: {} })),
    } as unknown as HttpClient;

    resource = new OrganizationsResource(mockHttp);
  });

  describe('Org Attributes', () => {
    it('lists attributes', async () => {
      await resource.attributes(1).list();
      expect(mockHttp.get).toHaveBeenCalledWith('/organizations/1/attributes', undefined);
    });

    it('creates attribute', async () => {
      const input = { 
        name: 'Attr', 
        slug: 'attr', 
        type: 'TEXT' as const,
        options: [] 
      };
      await resource.attributes(1).create(input);
      expect(mockHttp.post).toHaveBeenCalledWith('/organizations/1/attributes', input);
    });

    it('gets attribute', async () => {
      await resource.attributes(1).get('attr-id');
      expect(mockHttp.get).toHaveBeenCalledWith('/organizations/1/attributes/attr-id');
    });

    it('deletes attribute', async () => {
      await resource.attributes(1).delete('attr-id');
      expect(mockHttp.delete).toHaveBeenCalledWith('/organizations/1/attributes/attr-id');
    });
  });

  describe('Org Teams', () => {
    it('lists teams', async () => {
      await resource.teams(1).list();
      expect(mockHttp.get).toHaveBeenCalledWith('/organizations/1/teams', undefined);
    });

    it('creates team', async () => {
      const input = { name: 'Org Team' };
      await resource.teams(1).create(input);
      expect(mockHttp.post).toHaveBeenCalledWith('/organizations/1/teams', input);
    });

    it('gets team', async () => {
      await resource.teams(1).get(10);
      expect(mockHttp.get).toHaveBeenCalledWith('/organizations/1/teams/10');
    });

    it('updates team', async () => {
      const input = { name: 'Updated Team' };
      await resource.teams(1).update(10, input);
      expect(mockHttp.patch).toHaveBeenCalledWith('/organizations/1/teams/10', input);
    });

    it('deletes team', async () => {
      await resource.teams(1).delete(10);
      expect(mockHttp.delete).toHaveBeenCalledWith('/organizations/1/teams/10');
    });
  });
});
