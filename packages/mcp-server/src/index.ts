import { FastMCP } from 'fastmcp';
import { listBookings, listBookingsSchema } from './tools.js';

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

const transportType = process.env.MCP_TRANSPORT === 'stdio' ? 'stdio' : 'httpStream';
const port = parseInt(process.env.PORT || '8080', 10);

if (transportType === 'httpStream') {
  console.error(`Starting MCP server on port ${port} (HTTP Stream)`);
}

server.start({
  transportType,
  httpStream: {
    endpoint: '/mcp',
    port,
    host: '0.0.0.0',
  },
});
