
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { CalComClient } from '../../src/index';

describe('Schedules Resource', () => {
  let client: CalComClient;
  let mockGet: any;
  let mockPost: any;
  let mockPatch: any;
  let mockDelete: any;

  beforeEach(() => {
    client = new CalComClient({
      auth: { type: 'apiKey', apiKey: 'test-key' },
    });

    // Mock the internal http client methods
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

  it('lists schedules', async () => {
    await client.schedules.list({ page: 1, limit: 10 });
    expect(mockGet).toHaveBeenCalledWith('/schedules', { page: 1, limit: 10 });
  });

  it('gets default schedule', async () => {
    await client.schedules.getDefault();
    expect(mockGet).toHaveBeenCalledWith('/schedules/default');
  });

  it('gets a schedule', async () => {
    await client.schedules.get(123);
    expect(mockGet).toHaveBeenCalledWith('/schedules/123');
  });

  it('creates a schedule', async () => {
    const input = {
      name: 'New Schedule',
      timeZone: 'UTC',
      isDefault: false
    };
    await client.schedules.create(input);
    expect(mockPost).toHaveBeenCalledWith('/schedules', input);
  });

  it('updates a schedule', async () => {
    const input = { name: 'Updated Name' };
    await client.schedules.update(123, input);
    expect(mockPatch).toHaveBeenCalledWith('/schedules/123', input);
  });

  it('deletes a schedule', async () => {
    await client.schedules.delete(123);
    expect(mockDelete).toHaveBeenCalledWith('/schedules/123');
  });
});
