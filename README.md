# @aditzel/caldotcom-api-v2-sdk

TypeScript SDK for Cal.com v2 API - A modern, type-safe client for interacting with Cal.com's scheduling platform.

## Features

- ✅ **Full TypeScript Support** - Complete type definitions for all API endpoints
- 🔐 **Multiple Authentication Methods** - API Key, OAuth Client, and Managed User tokens
- 🔄 **Automatic Retries** - Built-in retry logic with exponential backoff
- ⚡ **Modern Runtime Support** - Works with Bun, Node.js 18+, and Deno
- 📦 **Tree-shakeable** - ESM & CJS bundles with proper exports
- 🛡️ **Type-safe Error Handling** - Custom error classes for different failure scenarios
- 🔌 **Resource-based API** - Intuitive object-oriented interface

> 🛡️ **Project Constitution**: All contributors MUST follow the [Project Constitution](./CONSTITUTION.md), including the requirement that no task is done until linting, building, and the full test suite pass cleanly.

## Installation

```bash
# npm
npm install @aditzel/caldotcom-api-v2-sdk

# pnpm
pnpm add @aditzel/caldotcom-api-v2-sdk

# yarn
yarn add @aditzel/caldotcom-api-v2-sdk

# bun
bun add @aditzel/caldotcom-api-v2-sdk
```

## Quick Start

> **⚠️ Security Best Practice**: Never hardcode API keys in your source code! Always use environment variables.

### Using Environment Variables (Recommended)

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Add your credentials to `.env`:
```bash
CALDOTCOM_API_KEY=cal_live_your_actual_key_here
```

> **Note**: This SDK uses the `CALDOTCOM_` prefix (not `CAL_COM_` or `CALCOM_`) to avoid conflicts with existing Cal.com integrations in your project.

3. Use the SDK with environment variables:
```typescript
import { CalComClient } from '@aditzel/caldotcom-api-v2-sdk';

// ✅ GOOD: Load from environment variables
const client = new CalComClient({
  auth: {
    type: 'apiKey',
    apiKey: process.env.CALDOTCOM_API_KEY!,
  },
});

// ❌ BAD: Never hardcode credentials!
const badClient = new CalComClient({
  auth: {
    type: 'apiKey',
    apiKey: 'cal_live_xxxxx', // Don't do this!
  },
});
```

**Note**: The `.env` file is already in `.gitignore` to prevent accidentally committing secrets.

### API Key Authentication (Regular Users)

```typescript
import { CalComClient } from '@aditzel/caldotcom-api-v2-sdk';

const client = new CalComClient({
  auth: {
    type: 'apiKey',
    apiKey: process.env.CALDOTCOM_API_KEY!, // cal_live_xxxxx
  },
});

// List all bookings
const bookings = await client.bookings.list();

// Create a booking
const booking = await client.bookings.create({
  start: '2024-08-13T09:00:00Z',
  eventTypeId: 123,
  attendee: {
    name: 'John Doe',
    email: 'john@example.com',
    timeZone: 'America/New_York',
  },
});
```

### OAuth Client Authentication (Platform Customers)

```typescript
import { CalComClient } from '@aditzel/caldotcom-api-v2-sdk';

const client = new CalComClient({
  auth: {
    type: 'oauthClient',
    clientId: process.env.CALDOTCOM_CLIENT_ID!,
    secretKey: process.env.CALDOTCOM_SECRET_KEY!,
  },
});

// Manage platform resources
// Create teams, manage users, webhooks, etc.
```

### Managed User Authentication (Platform Managed Users)

```typescript
import { CalComClient } from '@aditzel/caldotcom-api-v2-sdk';

const client = new CalComClient({
  auth: {
    type: 'managedUser',
    accessToken: user.calAccessToken,
    refreshToken: user.calRefreshToken,
  },
});

// Manage user's schedules, event types, and bookings
const eventTypes = await client.eventTypes.list();
```

## Authentication Methods

### 1. API Key

For regular Cal.com users. Get your API key from [Cal.com Settings → Security](https://app.cal.com/settings/security).

- **Test mode**: Prefixed with `cal_`
- **Live mode**: Prefixed with `cal_live_`

```typescript
const client = new CalComClient({
  auth: {
    type: 'apiKey',
    apiKey: 'cal_live_xxxxx',
  },
});
```

### 2. OAuth Client Credentials

For platform customers managing multiple users. Access from [Platform Dashboard](https://app.cal.com/settings/platform).

**Required for:**
- Managing managed users
- Creating OAuth client webhooks
- Team-related endpoints
- Refreshing managed user tokens

```typescript
const client = new CalComClient({
  auth: {
    type: 'oauthClient',
    clientId: 'your-client-id',
    secretKey: 'your-secret-key',
  },
});
```

### 3. Managed User Access Token

For platform managed users. Obtained when creating a managed user.

**Token Validity:**
- Access token: 60 minutes
- Refresh token: 1 year

```typescript
const client = new CalComClient({
  auth: {
    type: 'managedUser',
    accessToken: 'access-token',
    refreshToken: 'refresh-token', // optional
  },
});
```

## API Reference

### Bookings

#### Create a Booking

```typescript
const booking = await client.bookings.create({
  start: '2024-08-13T09:00:00Z', // ISO 8601 UTC
  eventTypeId: 123,
  attendee: {
    name: 'John Doe',
    email: 'john@example.com',
    timeZone: 'America/New_York',
    phoneNumber: '+1234567890', // optional
    language: 'en', // optional
  },
  bookingFieldsResponses: { // optional
    customField: 'value',
  },
  guests: ['guest@example.com'], // optional
  location: { // optional
    type: 'address',
    address: '123 Main St',
  },
  metadata: { // optional
    key: 'value',
  },
});
```

#### Create an Instant Booking

```typescript
const booking = await client.bookings.create({
  instant: true,
  start: '2024-08-13T09:00:00Z',
  eventTypeId: 123,
  attendee: { /* ... */ },
});
```

#### Create a Recurring Booking

```typescript
const bookings = await client.bookings.create({
  start: [
    '2024-08-13T09:00:00Z',
    '2024-08-20T09:00:00Z',
    '2024-08-27T09:00:00Z',
  ],
  eventTypeId: 123,
  attendee: { /* ... */ },
});
```

#### List Bookings

```typescript
const bookings = await client.bookings.list({
  status: 'accepted',
  eventTypeId: 123,
  after: '2024-01-01T00:00:00Z',
  sort: {
    field: 'start',
    direction: 'asc',
  },
});
```

#### Get a Booking

```typescript
// By ID
const booking = await client.bookings.get(123);

// By UID
const booking = await client.bookings.getByUid('booking_uid_123');
```

#### Update a Booking

```typescript
const updated = await client.bookings.update(123, {
  start: '2024-08-13T10:00:00Z',
  reschedulingReason: 'Time conflict',
});
```

#### Cancel a Booking

```typescript
const cancelled = await client.bookings.cancel(123, {
  cancellationReason: 'No longer needed',
});
```

#### Reschedule a Booking

```typescript
const rescheduled = await client.bookings.reschedule(123, {
  start: '2024-08-14T09:00:00Z',
  reschedulingReason: 'Time conflict',
});
```

### Me (User Profile)

#### Get User Profile

```typescript
const profile = await client.me.get();

console.log(profile.email);      // User email
console.log(profile.timeZone);   // IANA timezone
console.log(profile.weekStart);  // Week start day
console.log(profile.timeFormat); // 12 or 24
```

**Returns:**

```typescript
{
  id: number;
  username: string;
  email: string;
  name?: string;
  timeFormat: TimeFormat;            // 12 or 24
  defaultScheduleId: number | null;
  weekStart: WeekStart;              // e.g., "Monday"
  timeZone: TimeZone;                // IANA timezone
  locale?: LanguageCode;
  avatarUrl?: string | null;
  bio?: string | null;
  metadata?: Metadata;
  organizationId: number | null;
  organization?: UserOrganization;
}
```

#### Update User Profile

```typescript
const updated = await client.me.update({
  timeZone: 'America/Los_Angeles',
  weekStart: 'Monday',
  timeFormat: 24,
  bio: 'Software developer and scheduling enthusiast',
  metadata: {
    preference: 'darkMode',
    customField: 'value'
  }
});
```

**Available Fields:**
- `email?: string` - User email
- `name?: string` - Display name
- `timeFormat?: 12 | 24` - Time format preference
- `defaultScheduleId?: number | null` - Default schedule ID
- `weekStart?: WeekStart` - First day of week
- `timeZone?: TimeZone` - IANA timezone
- `locale?: LanguageCode` - Language preference
- `avatarUrl?: string | null` - Avatar image URL
- `bio?: string | null` - User biography
- `metadata?: Metadata` - Custom metadata (max 50 keys, key ≤40 chars, value ≤500 chars)

### Event Types

#### Create an Event Type

```typescript
const eventType = await client.eventTypes.create({
  lengthInMinutes: 60,
  title: 'Consultation',
  slug: 'consultation',
  description: 'Schedule a consultation call',
  locations: [
    {
      type: 'address',
      address: '123 Main St',
      public: true,
    },
  ],
  bookingFields: [
    {
      type: 'name',
      label: 'Full Name',
      required: true,
    },
  ],
  // ... many more options available
});
```

#### List Event Types

```typescript
const eventTypes = await client.eventTypes.list({
  username: 'johndoe',
  includeHidden: false,
});
```

#### Get an Event Type

```typescript
// By ID
const eventType = await client.eventTypes.get(123);

// By slug
const eventType = await client.eventTypes.getBySlug(
  'consultation',
  'johndoe'
);
```

#### Update an Event Type

```typescript
const updated = await client.eventTypes.update(123, {
  title: 'Updated Consultation',
  lengthInMinutes: 45,
});
```

#### Delete an Event Type

```typescript
await client.eventTypes.delete(123);
```

## Error Handling

The SDK provides typed error classes for different failure scenarios:

```typescript
import {
  CalComError,
  CalComAuthError,
  CalComValidationError,
  CalComRateLimitError,
  CalComNotFoundError,
  CalComServerError,
} from '@aditzel/caldotcom-api-v2-sdk';

try {
  const booking = await client.bookings.create(/* ... */);
} catch (error) {
  if (error instanceof CalComAuthError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof CalComValidationError) {
    console.error('Validation error:', error.message, error.details);
  } else if (error instanceof CalComRateLimitError) {
    console.error('Rate limit exceeded. Retry after:', error.retryAfter);
  } else if (error instanceof CalComNotFoundError) {
    console.error('Resource not found:', error.message);
  } else if (error instanceof CalComServerError) {
    console.error('Server error:', error.statusCode, error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Configuration

### Custom Base URL

```typescript
const client = new CalComClient({
  auth: { /* ... */ },
  baseUrl: 'https://custom-cal-instance.com/v2',
});
```

### Custom Timeout

```typescript
const client = new CalComClient({
  auth: { /* ... */ },
  timeout: 60000, // 60 seconds
});
```

### Custom Retry Settings

```typescript
const client = new CalComClient({
  auth: { /* ... */ },
  maxRetries: 5, // default: 3
});
```

### Custom API Version

```typescript
const client = new CalComClient({
  auth: { /* ... */ },
  apiVersion: '2024-08-13', // default: '2024-08-13'
});
```

## Examples

The `examples/` directory contains practical usage examples:

### Simple Usage
The easiest way to get started with automatic environment variable loading:

```bash
# Setup
cp .env.example .env
# Edit .env and add your CALDOTCOM_API_KEY

# Run the example
bun run examples/simple-usage.ts
```

The simple example uses a helper utility that automatically detects and loads credentials from environment variables:

```typescript
import { createClientFromEnv } from './examples/utils/env-config.js';

// Automatically creates client from environment variables
const client = createClientFromEnv();

// Start using the API
const eventTypes = await client.eventTypes.list();
```

### Complete Examples
See `examples/basic-usage.ts` for comprehensive examples of:
- All three authentication methods
- Custom configuration
- Error handling
- Common operations

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Type check
npx tsc --noEmit

# Build
bun run build

# Lint
bun run lint

# Format
bun run format

# Run examples
bun run examples/simple-usage.ts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

Review the [Repository Guidelines](./AGENTS.md) before opening a PR to follow project conventions.

## License

MIT - Made with ❤️ by [Allan Ditzel](https://github.com/aditzel)

## Links

- [Cal.com API Documentation](https://cal.com/docs/api-reference/v2)
- [GitHub Repository](https://github.com/aditzel/caldotcom-api-v2-sdk)
- [npm Package](https://www.npmjs.com/package/@aditzel/caldotcom-api-v2-sdk)
