
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { CalComClient } from '../../src/index';

describe('Conferencing Resource', () => {
  let client: CalComClient;
  let mockGet: any;
  let mockPost: any;

  beforeEach(() => {
    client = new CalComClient({
      auth: { type: 'apiKey', apiKey: 'test-key' },
    });

    const http = (client as any).http;
    mockGet = mock(() => Promise.resolve({ data: {} }));
    mockPost = mock(() => Promise.resolve({ data: {} }));

    http.get = mockGet;
    http.post = mockPost;
  });

  it('lists conferencing apps', async () => {
    await client.conferencing.list();
    expect(mockGet).toHaveBeenCalledWith('/conferencing');
  });

  it('gets default app', async () => {
    await client.conferencing.getDefault();
    expect(mockGet).toHaveBeenCalledWith('/conferencing/default');
  });

  it('sets default app', async () => {
    await client.conferencing.setDefault('zoom');
    expect(mockPost).toHaveBeenCalledWith('/conferencing/zoom/default', {});
  });
});
