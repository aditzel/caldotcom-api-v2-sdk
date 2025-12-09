
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { CalComClient } from '../../src/index';

describe('Slots Resource', () => {
  let client: CalComClient;
  let mockGet: any;
  let mockPost: any;
  let mockDelete: any;

  beforeEach(() => {
    client = new CalComClient({
      auth: { type: 'apiKey', apiKey: 'test-key' },
    });

    const http = (client as any).http;
    mockGet = mock(() => Promise.resolve({ data: {} }));
    mockPost = mock(() => Promise.resolve({ data: {} }));
    mockDelete = mock(() => Promise.resolve({ data: {} }));

    http.get = mockGet;
    http.post = mockPost;
    http.delete = mockDelete;
  });

  it('gets available slots', async () => {
    const input = { 
      start: '2024-01-01T00:00:00Z', 
      end: '2024-01-02T00:00:00Z',
      eventTypeId: 123 
    };
    await client.slots.getAvailable(input);
    // getAvailable spreads input into query
    expect(mockGet).toHaveBeenCalledWith('/slots', expect.objectContaining({
      start: '2024-01-01T00:00:00Z',
      end: '2024-01-02T00:00:00Z',
      eventTypeId: 123
    }));
  });

  it('reserves a slot', async () => {
    const input = { eventTypeId: 1, slotStart: '2024-01-01T10:00:00Z' };
    await client.slots.reserve(input);
    expect(mockPost).toHaveBeenCalledWith('/slots/reservations', input);
  });

  it('removes a reservation', async () => {
    await client.slots.removeReservation('uid-123');
    expect(mockDelete).toHaveBeenCalledWith('/slots/reservations/uid-123');
  });
});
