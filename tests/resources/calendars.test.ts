
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { CalComClient } from '../../src/index';

describe('Calendars Resource', () => {
  let client: CalComClient;
  let mockGet: any;
  let mockPost: any;
  let mockPut: any;
  let mockDelete: any;

  beforeEach(() => {
    client = new CalComClient({
      auth: { type: 'apiKey', apiKey: 'test-key' },
    });

    const http = (client as any).http;
    mockGet = mock(() => Promise.resolve({ data: {} }));
    mockPost = mock(() => Promise.resolve({ data: {} }));
    mockPut = mock(() => Promise.resolve({ data: {} }));
    mockDelete = mock(() => Promise.resolve({ data: {} }));

    http.get = mockGet;
    http.post = mockPost;
    http.put = mockPut;
    http.delete = mockDelete;
  });

  it('lists connected calendars', async () => {
    await client.calendars.list();
    expect(mockGet).toHaveBeenCalledWith('/calendars');
  });

  it('updates destination calendar', async () => {
    const input = { 
      integration: 'google_calendar', 
      externalId: 'primary@example.com',
      credentialId: 1
    };
    await client.calendars.updateDestination(input);
    expect(mockPut).toHaveBeenCalledWith('/destination-calendars', input);
  });

  it('adds selected calendar', async () => {
    const input = { 
      integration: 'google_calendar', 
      externalId: 'other@example.com',
      credentialId: 1
    };
    await client.calendars.addSelected(input);
    expect(mockPost).toHaveBeenCalledWith('/selected-calendars', input);
  });

  it('removes selected calendar', async () => {
    const input = { 
      integration: 'google_calendar', 
      externalId: 'other@example.com',
      credentialId: 1
    };
    await client.calendars.removeSelected(input);
    expect(mockDelete).toHaveBeenCalledWith('/selected-calendars', input);
  });
});
