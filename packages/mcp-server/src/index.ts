import { FastMCP } from 'fastmcp';
import { listBookings, listBookingsSchema } from './tools';

const server = new FastMCP({
  name: 'Cal.com API v2',
  version: '0.1.0',
});

server.addTool({
  name: 'list_bookings',
  description: 'List bookings',
  parameters: listBookingsSchema,
  execute: async (args) => {
    try {
      const bookings = await listBookings(args);
      return JSON.stringify(bookings, null, 2);
    } catch (error: any) {
      return `Error fetching bookings: ${error.message}`;
    }
  },
});

server.start({
  transportType: 'stdio',
});
