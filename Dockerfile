# Use the official Bun image
FROM oven/bun:1

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY packages/sdk/package.json packages/sdk/
COPY packages/mcp-server/package.json packages/mcp-server/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY packages/sdk packages/sdk
COPY packages/mcp-server packages/mcp-server
COPY tsconfig.json .

# Build the SDK and Server
RUN bun run --cwd packages/sdk build
RUN bun run --cwd packages/mcp-server build

# Expose the port (FastMCP defaults to 8080 or PORT env var)
ENV PORT=8080
EXPOSE 8080

# Start the server using the compiled output
# We use the direct file instead of 'bun start' to ensure signals are passed correctly
WORKDIR /app/packages/mcp-server
CMD ["bun", "run", "src/index.ts"]
