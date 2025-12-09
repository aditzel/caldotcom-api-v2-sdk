
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { SlotsResource } from '../../src/resources/slots';
import type { HttpClient } from '../../src/lib/http-client';

describe('Slots Resource', () => {
  let resource: SlotsResource;
  let mockHttp: HttpClient;

  beforeEach(() => {
    mockHttp = {
      get: mock(() => Promise.resolve({ data: {} })),
      post: mock(() => Promise.resolve({ data: {} })),
      delete: mock(() => Promise.resolve({ data: {} })),
    } as unknown as HttpClient;

    resource = new SlotsResource(mockHttp);
  });

  it('gets available slots', async () => {
    const input = { 
      start: '2024-01-01T00:00:00Z', 
      end: '2024-01-02T00:00:00Z',
      eventTypeId: 123 
    };
    await resource.getAvailable(input);
    // getAvailable spreads input into query
    expect(mockHttp.get).toHaveBeenCalledWith('/slots', expect.objectContaining({
      start: '2024-01-01T00:00:00Z',
      end: '2024-01-02T00:00:00Z',
      eventTypeId: 123
    }));
  });

  it('reserves a slot', async () => {
    const input = { eventTypeId: 1, slotStart: '2024-01-01T10:00:00Z' };
    await resource.reserve(input);
    expect(mockHttp.post).toHaveBeenCalledWith('/slots/reservations', input);
  });

  it('removes a reservation', async () => {
    await resource.removeReservation('uid-123');
    expect(mockHttp.delete).toHaveBeenCalledWith('/slots/reservations/uid-123');
  });
});
