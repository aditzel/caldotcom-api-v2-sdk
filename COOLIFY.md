# Deploying to Coolify

Docker Hub publication has been retired. Previously published images are no
longer updated. Build the MCP server from this repository's Dockerfile instead
of deploying `aditzel/caldotcom-mcp-server:latest`.

For a local build and run from the repository root:

```sh
docker build -t caldotcom-mcp-server:local .
docker run --rm -p 8080:8080 -e CAL_API_KEY -e MCP_TRANSPORT=httpStream caldotcom-mcp-server:local
```

Set `CAL_API_KEY` in your shell before running the container. These commands
build and run locally; they do not publish an image.

## 1. Prerequisites
- A running Coolify instance.
- A Cal.com API Key.

## 2. Deploy Service
Configure Coolify to build this repository with the root `Dockerfile`, using
the repository root as the build context. Supply repository access through
your existing Coolify integration. No prebuilt Docker Hub image is maintained.

Runtime configuration:
- **Port Mapping**: The server listens on container port `8080`. Coolify typically handles this automatically, but ensure the internal port is set to `8080`.
- **Environment Variables**: Add the following:
  - `CAL_API_KEY`: Your Cal.com API key (e.g., `cal_live_...`)
  - `MCP_TRANSPORT`: `httpStream` (Optional, default)

## 3. Verify
Once deployed, verify the service is running:
- **Status**: Should show "Running".
- **Logs**: Check logs for `Starting MCP server on port 8080 (HTTP Stream)`.
- **Endpoint**: Access `https://<your-coolify-domain>/mcp` (Should return 400 Bad Request, confirming reachability).
