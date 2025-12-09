
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { ConferencingResource } from '../../src/resources/conferencing';
import type { HttpClient } from '../../src/lib/http-client';

describe('Conferencing Resource', () => {
  let resource: ConferencingResource;
  let mockHttp: HttpClient;

  beforeEach(() => {
    mockHttp = {
      get: mock(() => Promise.resolve({ data: {} })),
      post: mock(() => Promise.resolve({ data: {} })),
    } as unknown as HttpClient;

    resource = new ConferencingResource(mockHttp);
  });

  it('lists conferencing apps', async () => {
    await resource.list();
    expect(mockHttp.get).toHaveBeenCalledWith('/conferencing');
  });

  it('gets default app', async () => {
    await resource.getDefault();
    expect(mockHttp.get).toHaveBeenCalledWith('/conferencing/default');
  });

  it('sets default app', async () => {
    await resource.setDefault('zoom');
    expect(mockHttp.post).toHaveBeenCalledWith('/conferencing/zoom/default', {});
  });
});
