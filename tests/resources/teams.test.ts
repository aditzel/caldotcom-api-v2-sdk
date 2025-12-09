
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { CalComClient } from '../../src/index';

describe('Teams Resource', () => {
  let client: CalComClient;
  let mockGet: any;
  let mockPost: any;
  let mockPatch: any;
  let mockDelete: any;

  beforeEach(() => {
    client = new CalComClient({
      auth: { type: 'apiKey', apiKey: 'test-key' },
    });

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

  it('lists teams', async () => {
    await client.teams.list();
    expect(mockGet).toHaveBeenCalledWith('/teams', undefined);
  });

  it('gets a team', async () => {
    await client.teams.get(1);
    expect(mockGet).toHaveBeenCalledWith('/teams/1');
  });

  it('creates a team', async () => {
    const input = { name: 'Team A' };
    await client.teams.create(input);
    expect(mockPost).toHaveBeenCalledWith('/teams', input);
  });

  it('updates a team', async () => {
    const input = { name: 'Team B' };
    await client.teams.update(1, input);
    expect(mockPatch).toHaveBeenCalledWith('/teams/1', input);
  });

  it('deletes a team', async () => {
    await client.teams.delete(1);
    expect(mockDelete).toHaveBeenCalledWith('/teams/1');
  });

  it('gets memberships', async () => {
    await client.teams.getMemberships(1);
    expect(mockGet).toHaveBeenCalledWith('/teams/1/memberships', undefined);
  });

  it('adds membership', async () => {
    const input = { userId: 2, role: 'MEMBER' as const };
    await client.teams.addMembership(1, input);
    expect(mockPost).toHaveBeenCalledWith('/teams/1/memberships', input);
  });

  it('updates membership', async () => {
    const input = { role: 'ADMIN' as const };
    await client.teams.updateMembership(1, 10, input);
    expect(mockPatch).toHaveBeenCalledWith('/teams/1/memberships/10', input);
  });

  it('removes membership', async () => {
    await client.teams.removeMembership(1, 10);
    expect(mockDelete).toHaveBeenCalledWith('/teams/1/memberships/10');
  });

  it('gets event types', async () => {
    await client.teams.getEventTypes(1);
    expect(mockGet).toHaveBeenCalledWith('/teams/1/event-types', undefined);
  });

  it('creates event type', async () => {
    const input = { 
      lengthInMinutes: 30, 
      title: 'Quick Chat', 
      slug: 'quick-chat', 
      schedulingType: 'collective' as const 
    };
    await client.teams.createEventType(1, input);
    expect(mockPost).toHaveBeenCalledWith('/teams/1/event-types', input);
  });
});
