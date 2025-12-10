# Cal.com API v2 MCP Server

This is an MCP server for the Cal.com API v2, built using FastMCP and the Cal.com SDK.

## Prerequisites

- [Bun](https://bun.sh)
- Cal.com API Key (Get it from your Cal.com settings)

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set your API key:
   ```bash
   export CAL_API_KEY=your_api_key
   ```

## Running

### HTTP Mode (Default)
Runs an HTTP server with an endpoint at `/mcp`.
```bash
# Default: port 8080
bun start

# Custom port
PORT=3000 bun start
```

### STDIO Mode
Standard mode for connecting to local clients (e.g., Claude Desktop).
```bash
MCP_TRANSPORT=stdio bun start
```

## Tools

- `list_bookings`: List your bookings with optional status filter and limit.
