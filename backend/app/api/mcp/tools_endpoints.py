import asyncio
import json
import logging
from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mcp/tools", tags=["mcp_tools"])

# MCP server connection settings
MCP_HOST = "localhost"
MCP_PORT = 8001  # Use a different port for MCP server
MCP_TIMEOUT = 30.0


class MCPToolCall(BaseModel):
    """Request model for calling an MCP tool."""

    method: str = Field(..., description="Name of the MCP tool to call")
    params: dict[str, Any] = Field(
        default_factory=dict, description="Arguments for the MCP tool"
    )


class MCPToolResponse(BaseModel):
    """Response model for an MCP tool call."""

    success: bool = Field(..., description="True if the tool call was successful")
    result: dict[str, Any] | None = Field(None, description="Result of the tool call")
    error: str | None = Field(None, description="Error message if the tool call failed")


async def _send_mcp_request(method: str, params: dict[str, Any]) -> Any:
    """Send a request to the external MCP server via TCP socket."""
    try:
        # Create a TCP connection to the MCP server
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(MCP_HOST, MCP_PORT), timeout=MCP_TIMEOUT
        )

        try:
            # Create the JSON-RPC request
            request = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params}

            # Send the request
            request_data = json.dumps(request) + "\n"
            writer.write(request_data.encode())
            await writer.drain()

            # Read the response
            response_data = await asyncio.wait_for(
                reader.readline(), timeout=MCP_TIMEOUT
            )

            if not response_data:
                raise Exception("No response from MCP server")

            response = json.loads(response_data.decode().strip())

            if "error" in response:
                raise Exception(f"MCP server error: {response['error']}")

            return response.get("result")

        finally:
            writer.close()
            await writer.wait_closed()

    except TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="MCP server connection timeout",
        )
    except ConnectionRefusedError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="MCP server is not running. Please start it with: cd services/mcp-server && python main.py",
        )
    except Exception as e:
        logger.error(f"MCP request failed for method {method}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"MCP request failed: {e}",
        )


@router.post("/call", response_model=MCPToolResponse)
async def call_mcp_tool(tool_call: MCPToolCall) -> MCPToolResponse:
    """
    Call an MCP tool and return its result.
    This connects to an external MCP server running on localhost:8001.
    """
    try:
        logger.info(
            f"Calling MCP tool: {tool_call.method} with params {tool_call.params}"
        )

        # Map the tool call to the appropriate MCP method
        if tool_call.method in [
            "get_simulation_status",
            "get_ecs_agent_positions",
            "create_ecs_agent",
        ]:
            # These are direct MCP tool calls
            result = await _send_mcp_request(
                "tools/call", {"name": tool_call.method, "arguments": tool_call.params}
            )
        else:
            # For other methods, try direct call first
            result = await _send_mcp_request(tool_call.method, tool_call.params)

        return MCPToolResponse(success=True, result=result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to call MCP tool {tool_call.method}: {e}")
        return MCPToolResponse(success=False, error=str(e))


@router.get("/health")
async def mcp_health_check() -> dict[str, Any]:
    """Check if the MCP server is accessible."""
    try:
        # Try to connect to the MCP server
        await _send_mcp_request("tools/list", {})
        return {
            "status": "healthy",
            "mcp_server": "connected",
            "host": MCP_HOST,
            "port": MCP_PORT,
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "mcp_server": "disconnected",
            "error": str(e),
            "host": MCP_HOST,
            "port": MCP_PORT,
        }
