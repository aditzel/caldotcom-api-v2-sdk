import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { CalComClient } from '../src/index.js';
import type { UserProfile } from '../src/types/me.js';

const originalFetch = globalThis.fetch;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

describe('MeResource', () => {
  let client: CalComClient;
  let profileState: UserProfile;
  let lastRequest: { url: string; method: string; body?: unknown } | undefined;

  beforeEach(() => {
    profileState = {
      id: 1,
      username: 'test-user',
      email: 'test@example.com',
      timeFormat: 12,
      defaultScheduleId: 123,
      weekStart: 'Sunday',
      timeZone: 'UTC',
      organizationId: null,
      name: 'Test User',
      locale: 'en',
      avatarUrl: 'https://example.com/avatar.png',
      bio: 'Initial bio',
      metadata: { test: true },
    };

    lastRequest = undefined;

    globalThis.fetch = ((input, init) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      const method = init?.method ?? 'GET';

      let parsedBody: unknown;
      if (typeof init?.body === 'string') {
        try {
          parsedBody = JSON.parse(init.body);
        } catch {
          parsedBody = undefined;
        }
      }

      lastRequest = { url, method, body: parsedBody };

      if (!url.endsWith('/me')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              status: 'error',
              error: { message: 'Not Found' },
            }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        );
      }

      if (method === 'GET') {
        return Promise.resolve(
          new Response(
            JSON.stringify({ status: 'success', data: profileState }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        );
      }

      if (method === 'PATCH') {
        if (isRecord(parsedBody)) {
          if (typeof parsedBody.email === 'string') {
            profileState = { ...profileState, email: parsedBody.email };
          }
          if (typeof parsedBody.name === 'string') {
            profileState = { ...profileState, name: parsedBody.name };
          }
          if (typeof parsedBody.timeFormat === 'number') {
            profileState = { ...profileState, timeFormat: parsedBody.timeFormat };
          }
          if ('defaultScheduleId' in parsedBody) {
            const { defaultScheduleId } = parsedBody;
            if (typeof defaultScheduleId === 'number' || defaultScheduleId === null) {
              profileState = { ...profileState, defaultScheduleId };
            }
          }
          if (typeof parsedBody.weekStart === 'string') {
            profileState = { ...profileState, weekStart: parsedBody.weekStart };
          }
          if (typeof parsedBody.timeZone === 'string') {
            profileState = { ...profileState, timeZone: parsedBody.timeZone };
          }
          if (typeof parsedBody.locale === 'string') {
            profileState = { ...profileState, locale: parsedBody.locale };
          }
          if ('avatarUrl' in parsedBody) {
            const { avatarUrl } = parsedBody;
            if (typeof avatarUrl === 'string' || avatarUrl === null) {
              profileState = { ...profileState, avatarUrl };
            }
          }
          if ('bio' in parsedBody) {
            const { bio } = parsedBody;
            if (typeof bio === 'string' || bio === null) {
              profileState = { ...profileState, bio };
            }
          }
          if (isRecord(parsedBody.metadata)) {
            const entries = Object.entries(parsedBody.metadata);
            if (entries.every(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))) {
              profileState = {
                ...profileState,
                metadata: parsedBody.metadata as Record<string, string | number | boolean>,
              };
            }
          }
        }

        return Promise.resolve(
          new Response(
            JSON.stringify({ status: 'success', data: profileState }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        );
      }

      return Promise.resolve(
        new Response(
          JSON.stringify({
            status: 'error',
            error: { message: 'Method Not Allowed' },
          }),
          {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      );
    }) as typeof fetch;

    client = new CalComClient({
      auth: {
        type: 'apiKey',
        apiKey: process.env.CALDOTCOM_API_KEY ?? 'test_key',
      },
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('get()', () => {
    it('should fetch user profile', async () => {
      const profile = await client.me.get();

      expect(lastRequest?.method).toBe('GET');
      expect(profile).toBeDefined();
      expect(profile.id).toBe(profileState.id);
      expect(profile.email).toBeTypeOf('string');
      expect(profile.timeZone).toBeTypeOf('string');
    });
  });

  describe('update()', () => {
    it('should update user profile with partial data', async () => {
      const updated = await client.me.update({
        timeFormat: 24,
        weekStart: 'Monday',
      });

      expect(lastRequest?.method).toBe('PATCH');
      expect(updated).toBeDefined();
      expect(updated.timeFormat).toBe(24);
      expect(updated.weekStart).toBe('Monday');
    });

    it('should update user bio and metadata', async () => {
      const updated = await client.me.update({
        bio: 'Test bio',
        metadata: {
          testKey: 'testValue',
        },
      });

      expect(lastRequest?.method).toBe('PATCH');
      expect(lastRequest?.body).toBeDefined();
      expect(isRecord(lastRequest?.body)).toBe(true);

      const body = lastRequest!.body as Record<string, unknown>;
      expect(isRecord(body.metadata)).toBe(true);

      const metadata = body.metadata as Record<string, unknown>;
      expect(metadata.testKey).toBe('testValue');
      expect(updated).toBeDefined();
      expect(updated.bio).toBe('Test bio');
      expect(updated.metadata?.testKey).toBe('testValue');
    });

    it('should update timezone', async () => {
      const updated = await client.me.update({
        timeZone: 'America/New_York',
      });

      expect(lastRequest?.method).toBe('PATCH');
      expect(updated.timeZone).toBe('America/New_York');
    });

    it('should clear optional fields when null is provided', async () => {
      const updated = await client.me.update({
        bio: null,
        avatarUrl: null,
        defaultScheduleId: null,
      });

      expect(lastRequest?.method).toBe('PATCH');
      expect(updated.bio).toBeNull();
      expect(updated.avatarUrl).toBeNull();
      expect(updated.defaultScheduleId).toBeNull();
    });
  });
});
