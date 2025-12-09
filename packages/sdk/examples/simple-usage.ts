/**
 * Simple usage example using environment variables
 * 
 * This is the easiest way to get started!
 * 
 * Setup:
 * 1. Copy .env.example to .env
 * 2. Add your CALDOTCOM_API_KEY
 * 3. Run: bun run examples/simple-usage.ts
 */

import { createClientFromEnv } from './utils/env-config.js';
import { CalComAuthError, CalComError } from '../src/index.js';

async function main() {
  try {
    // Create client automatically from environment variables
    const client = createClientFromEnv();
    console.log('✅ Client created successfully!\n');

    // Example: List all event types
    console.log('📅 Fetching event types...');
    const eventTypes = await client.eventTypes.list();
    console.log(`Found ${eventTypes.length} event types:\n`);
    
    eventTypes.forEach((eventType) => {
      console.log(`  - ${eventType.title} (${eventType.slug})`);
      console.log(`    Duration: ${eventType.lengthInMinutes} minutes`);
      console.log(`    ID: ${eventType.id}\n`);
    });

    // Example: List recent bookings
    console.log('\n📆 Fetching recent bookings...');
    const bookings = await client.bookings.list({
      status: 'accepted',
      sort: {
        field: 'start',
        direction: 'desc',
      },
      take: 5,
    });
    
    console.log(`Found ${bookings.length} recent bookings:\n`);
    bookings.forEach((booking) => {
      console.log(`  - ${booking.title}`);
      console.log(`    Start: ${booking.start}`);
      console.log(`    Status: ${booking.status}`);
      console.log(`    Attendees: ${booking.attendees.map(a => a.name).join(', ')}\n`);
    });

  } catch (error) {
    if (error instanceof CalComAuthError) {
      console.error('❌ Authentication failed!');
      console.error('   Please check your CALDOTCOM_API_KEY in .env file');
    } else if (error instanceof CalComError) {
      console.error('❌ API Error:', error.message);
    } else {
      console.error('❌ Error:', error);
    }
    process.exit(1);
  }
}

main();
