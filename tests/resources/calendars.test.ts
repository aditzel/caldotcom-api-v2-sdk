
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { CalendarsResource } from '../../src/resources/calendars';
import type { HttpClient } from '../../src/lib/http-client';

describe('Calendars Resource', () => {
  let resource: CalendarsResource;
  let mockHttp: HttpClient;

  beforeEach(() => {
    mockHttp = {
      get: mock(() => Promise.resolve({ data: {} })),
      post: mock(() => Promise.resolve({ data: {} })),
      put: mock(() => Promise.resolve({ data: {} })),
      patch: mock(() => Promise.resolve({ data: {} })),
      delete: mock(() => Promise.resolve({ data: {} })),
    } as unknown as HttpClient;

    resource = new CalendarsResource(mockHttp);
  });

  it('lists connected calendars', async () => {
    await resource.list();
    expect(mockHttp.get).toHaveBeenCalledWith('/calendars');
  });

  it('updates destination calendar', async () => {
    const input = { 
      integration: 'google_calendar', 
      externalId: 'primary@example.com',
      credentialId: 1
    };
    await resource.updateDestination(input);
    expect(mockHttp.put).toHaveBeenCalledWith('/destination-calendars', input);
  });

  it('adds selected calendar', async () => {
    const input = { 
      integration: 'google_calendar', 
      externalId: 'other@example.com',
      credentialId: 1
    };
    await resource.addSelected(input);
    expect(mockHttp.post).toHaveBeenCalledWith('/selected-calendars', input);
  });

  it('removes selected calendar', async () => {
    const input = { 
      integration: 'google_calendar', 
      externalId: 'other@example.com',
      credentialId: 1
    };
    await resource.removeSelected(input);
    expect(mockHttp.delete).toHaveBeenCalledWith('/selected-calendars', input);
  });
});
