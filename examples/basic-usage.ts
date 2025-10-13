/**
 * Basic usage example with environment variables
 * 
 * Setup:
 * 1. Copy .env.example to .env
 * 2. Fill in your API credentials
 * 3. Run: bun run examples/basic-usage.ts
 */

import { CalComClient } from '../src/index.js';

// Validate environment variables
function validateEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Example 1: API Key Authentication (Regular Users)
async function apiKeyExample() {
  console.log('🔑 API Key Authentication Example\n');

  const client = new CalComClient({
    auth: {
      type: 'apiKey',
      apiKey: validateEnv('CALDOTCOM_API_KEY'),
    },
  });

  try {
    // List bookings
    const bookings = await client.bookings.list({
      status: 'accepted',
    });
    console.log(`Found ${bookings.length} bookings`);

    // List event types
    const eventTypes = await client.eventTypes.list();
    console.log(`Found ${eventTypes.length} event types`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 2: OAuth Client Authentication (Platform Customers)
async function oauthClientExample() {
  console.log('\n🔐 OAuth Client Authentication Example\n');

  const client = new CalComClient({
    auth: {
      type: 'oauthClient',
      clientId: validateEnv('CALDOTCOM_CLIENT_ID'),
      secretKey: validateEnv('CALDOTCOM_SECRET_KEY'),
    },
  });

  try {
    // Platform-specific operations
    console.log('OAuth client configured for platform operations');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 3: Managed User Authentication
async function managedUserExample() {
  console.log('\n👤 Managed User Authentication Example\n');

  const client = new CalComClient({
    auth: {
      type: 'managedUser',
      accessToken: validateEnv('CALDOTCOM_ACCESS_TOKEN'),
      refreshToken: process.env.CALDOTCOM_REFRESH_TOKEN, // optional
    },
  });

  try {
    // Managed user operations
    const eventTypes = await client.eventTypes.list();
    console.log(`Managed user has ${eventTypes.length} event types`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 4: Using optional configuration from env
async function customConfigExample() {
  console.log('\n⚙️  Custom Configuration Example\n');

  const client = new CalComClient({
    auth: {
      type: 'apiKey',
      apiKey: validateEnv('CALDOTCOM_API_KEY'),
    },
    baseUrl: process.env.CALDOTCOM_BASE_URL,
    apiVersion: process.env.CALDOTCOM_API_VERSION,
    timeout: process.env.CALDOTCOM_TIMEOUT 
      ? parseInt(process.env.CALDOTCOM_TIMEOUT, 10) 
      : undefined,
    maxRetries: process.env.CALDOTCOM_MAX_RETRIES
      ? parseInt(process.env.CALDOTCOM_MAX_RETRIES, 10)
      : undefined,
  });

  console.log('Client configured with custom settings');
}

// Run examples
async function main() {
  console.log('🚀 Cal.com SDK Examples\n');
  console.log('Make sure you have a .env file with your credentials!\n');

  // Check which credentials are available
  const hasApiKey = !!process.env.CALDOTCOM_API_KEY;
  const hasOAuthClient = !!(process.env.CALDOTCOM_CLIENT_ID && process.env.CALDOTCOM_SECRET_KEY);
  const hasManagedUser = !!process.env.CALDOTCOM_ACCESS_TOKEN;

  if (hasApiKey) {
    await apiKeyExample();
  }

  if (hasOAuthClient) {
    await oauthClientExample();
  }

  if (hasManagedUser) {
    await managedUserExample();
  }

  if (!hasApiKey && !hasOAuthClient && !hasManagedUser) {
    console.error('❌ No credentials found in environment variables!');
    console.error('Please copy .env.example to .env and add your credentials.');
    process.exit(1);
  }

  await customConfigExample();
}

main().catch(console.error);
