# Deploying to Coolify

You can easily deploy this MCP server to your self-hosted [Coolify](https://coolify.io/) instance using the public Docker Hub image.

## 1. Prerequisites
- A running Coolify instance.
- A Cal.com API Key.

## 2. Deploy Service
In your Coolify dashboard:
1.  **Select Project**: Choose your project and environment.
2.  **Add Resource**: Click "+ New" -> "Docker Image".
3.  **Docker Image**: Enter `aditzel/caldotcom-mcp-server:latest`.
4.  **Configuration**:
    *   **Port Mapping**: The server listens on container port `8080`. Coolify typically handles this automatically, but ensure the internal port is set to `8080`.
    *   **Environment Variables**: Add the following:
        *   `CAL_API_KEY`: Your Cal.com API key (e.g., `cal_live_...`)
        *   `MCP_TRANSPORT`: `httpStream` (Optional, default)

## 3. Verify
Once deployed, verify the service is running:
- **Status**: Should show "Running".
- **Logs**: Check logs for `Starting MCP server on port 8080 (HTTP Stream)`.
- **Endpoint**: Access `https://<your-coolify-domain>/mcp` (Should return 400 Bad Request, confirming reachability).
