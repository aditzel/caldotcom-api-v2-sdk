
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { TeamsResource } from '../../src/resources/teams';
import type { HttpClient } from '../../src/lib/http-client';

describe('Teams Resource', () => {
  let resource: TeamsResource;
  let mockHttp: HttpClient;

  beforeEach(() => {
    mockHttp = {
      get: mock(() => Promise.resolve({ data: {} })),
      post: mock(() => Promise.resolve({ data: {} })),
      patch: mock(() => Promise.resolve({ data: {} })),
      delete: mock(() => Promise.resolve({ data: {} })),
    } as unknown as HttpClient;

    resource = new TeamsResource(mockHttp);
  });

  it('lists teams', async () => {
    await resource.list();
    expect(mockHttp.get).toHaveBeenCalledWith('/teams', undefined);
  });

  it('gets a team', async () => {
    await resource.get(1);
    expect(mockHttp.get).toHaveBeenCalledWith('/teams/1');
  });

  it('creates a team', async () => {
    const input = { name: 'Team A' };
    await resource.create(input);
    expect(mockHttp.post).toHaveBeenCalledWith('/teams', input);
  });

  it('updates a team', async () => {
    const input = { name: 'Team B' };
    await resource.update(1, input);
    expect(mockHttp.patch).toHaveBeenCalledWith('/teams/1', input);
  });

  it('deletes a team', async () => {
    await resource.delete(1);
    expect(mockHttp.delete).toHaveBeenCalledWith('/teams/1');
  });

  it('gets memberships', async () => {
    await resource.getMemberships(1);
    expect(mockHttp.get).toHaveBeenCalledWith('/teams/1/memberships', undefined);
  });

  it('adds membership', async () => {
    const input = { userId: 2, role: 'MEMBER' as const };
    await resource.addMembership(1, input);
    expect(mockHttp.post).toHaveBeenCalledWith('/teams/1/memberships', input);
  });

  it('updates membership', async () => {
    const input = { role: 'ADMIN' as const };
    await resource.updateMembership(1, 10, input);
    expect(mockHttp.patch).toHaveBeenCalledWith('/teams/1/memberships/10', input);
  });

  it('removes membership', async () => {
    await resource.removeMembership(1, 10);
    expect(mockHttp.delete).toHaveBeenCalledWith('/teams/1/memberships/10');
  });

  it('gets event types', async () => {
    await resource.getEventTypes(1);
    expect(mockHttp.get).toHaveBeenCalledWith('/teams/1/event-types', undefined);
  });

  it('creates event type', async () => {
    const input = { 
      lengthInMinutes: 30, 
      title: 'Quick Chat', 
      slug: 'quick-chat', 
      schedulingType: 'collective' as const 
    };
    await resource.createEventType(1, input);
    expect(mockHttp.post).toHaveBeenCalledWith('/teams/1/event-types', input);
  });
});
