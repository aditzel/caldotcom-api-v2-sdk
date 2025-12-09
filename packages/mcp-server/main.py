from fastmcp import FastMCP
import subprocess
import json
import os
from typing import Optional, Literal

mcp = FastMCP("Cal.com API v2")

@mcp.tool()
def list_bookings(
    limit: int = 10,
    status: Optional[Literal['upcoming', 'recurring', 'past', 'cancelled', 'unconfirmed']] = None
) -> str:
    """
    List bookings from Cal.com
    """
    # Prepare arguments for the CLI adapter
    args = {"limit": limit}
    if status:
        args["status"] = status
    
    args_json = json.dumps(args)
    
    # Path to the compiled adapter binary
    adapter_path = os.path.join(os.path.dirname(__file__), "adapter")
    
    try:
        # Run the adapter binary
        # We pass the environment variables (including CAL_API_KEY) to the subprocess
        result = subprocess.run(
            [adapter_path, "list_bookings", args_json],
            capture_output=True,
            text=True,
            env=os.environ,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        return f"Error executing tool: {e.stderr}"
    except Exception as e:
        return f"Unexpected error: {str(e)}"

if __name__ == "__main__":
    mcp.run()
