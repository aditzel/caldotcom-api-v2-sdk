import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { CalComClient } from 'caldotcom-api-v2-sdk';

const apiKey = process.env.CAL_API_KEY;

if (!apiKey) {
  console.error('CAL_API_KEY environment variable is required');
  process.exit(1);
}

const client = new CalComClient({
  auth: {
    type: 'apiKey',
    apiKey,
  },
});

const server = new FastMCP({
  name: 'Cal.com API v2',
  version: '0.1.0',
});

server.addTool({
  name: 'list_bookings',
  description: 'List bookings',
  parameters: z.object({
    limit: z.number().optional().default(10),
    status: z.enum(['upcoming', 'recurring', 'past', 'cancelled', 'unconfirmed']).optional(),
  }),
  execute: async (args) => {
    const { limit, status } = args;
    try {
      const bookings = await client.bookings.list({
        take: limit,
        // @ts-ignore - status type matching
        status: status as any,
      });
      return JSON.stringify(bookings, null, 2);
    } catch (error) {
      return `Error fetching bookings: ${error}`;
    }
  },
});

server.start();
