
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { MeResource } from '../../src/resources/me';
import type { HttpClient } from '../../src/lib/http-client';

describe('Me Resource', () => {
  let resource: MeResource;
  let mockHttp: HttpClient;

  beforeEach(() => {
    mockHttp = {
      get: mock(() => Promise.resolve({ data: {} })),
      patch: mock(() => Promise.resolve({ data: {} })),
    } as unknown as HttpClient;

    resource = new MeResource(mockHttp);
  });

  it('gets current user', async () => {
    await resource.get();
    expect(mockHttp.get).toHaveBeenCalledWith('/me');
  });

  it('updates current user', async () => {
    const input = { bio: 'New Bio' };
    await resource.update(input);
    expect(mockHttp.patch).toHaveBeenCalledWith('/me', input);
  });
});
