
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { SchedulesResource } from '../../src/resources/schedules';
import type { HttpClient } from '../../src/lib/http-client';

describe('Schedules Resource', () => {
  let resource: SchedulesResource;
  let mockHttp: HttpClient;

  beforeEach(() => {
    mockHttp = {
      get: mock(() => Promise.resolve({ data: {} })),
      post: mock(() => Promise.resolve({ data: {} })),
      patch: mock(() => Promise.resolve({ data: {} })),
      delete: mock(() => Promise.resolve({ data: {} })),
    } as unknown as HttpClient;

    resource = new SchedulesResource(mockHttp);
  });

  it('lists schedules', async () => {
    await resource.list({ page: 1, limit: 10 });
    expect(mockHttp.get).toHaveBeenCalledWith('/schedules', { page: 1, limit: 10 });
  });

  it('gets default schedule', async () => {
    await resource.getDefault();
    expect(mockHttp.get).toHaveBeenCalledWith('/schedules/default');
  });

  it('gets a schedule', async () => {
    await resource.get(123);
    expect(mockHttp.get).toHaveBeenCalledWith('/schedules/123');
  });

  it('creates a schedule', async () => {
    const input = {
      name: 'New Schedule',
      timeZone: 'UTC',
      isDefault: false
    };
    await resource.create(input);
    expect(mockHttp.post).toHaveBeenCalledWith('/schedules', input);
  });

  it('updates a schedule', async () => {
    const input = { name: 'Updated Name' };
    await resource.update(123, input);
    expect(mockHttp.patch).toHaveBeenCalledWith('/schedules/123', input);
  });

  it('deletes a schedule', async () => {
    await resource.delete(123);
    expect(mockHttp.delete).toHaveBeenCalledWith('/schedules/123');
  });
});
