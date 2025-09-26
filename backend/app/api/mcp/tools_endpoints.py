import logging
from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from ...services.mcp_integration import get_mcp_integration

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mcp/tools", tags=["mcp_tools"])


class MCPToolCall(BaseModel):
    """Request model for calling an MCP tool."""

    method: str = Field(..., description="Name of the MCP tool to call")
    params: dict[str, Any] = Field(
        default_factory=dict,
        description="Arguments for the MCP tool",
    )


class MCPToolResponse(BaseModel):
    """Response model for an MCP tool call."""

    success: bool = Field(..., description="True if the tool call was successful")
    result: dict[str, Any] | None = Field(None, description="Result of the tool call")
    error: str | None = Field(None, description="Error message if the tool call failed")


# MCP integration - no external connections needed


@router.post("/call", response_model=MCPToolResponse)
async def call_mcp_tool(tool_call: MCPToolCall) -> MCPToolResponse:
    """Call an MCP tool and return its result using integrated MCP service."""
    try:
        logger.info(
            f"Calling MCP tool: {tool_call.method} with params {tool_call.params}",
        )

        # Get MCP integration
        mcp_integration = get_mcp_integration()

        # Call the tool
        result = await mcp_integration.call_tool(tool_call.method, tool_call.params)

        return MCPToolResponse(success=True, result=result)

    except Exception as e:
        logger.error(f"Failed to call MCP tool {tool_call.method}: {e}")
        return MCPToolResponse(success=False, error=str(e))


@router.get("/list")
async def list_mcp_tools() -> dict[str, Any]:
    """List all available MCP tools."""
    try:
        logger.info("Listing MCP tools")

        # Get MCP integration
        mcp_integration = get_mcp_integration()

        # Get tools list
        result = await mcp_integration.list_tools()

        return {
            "success": True,
            "result": result,
        }
    except Exception as e:
        logger.error(f"Failed to list MCP tools: {e}")
        return {
            "success": False,
            "error": str(e),
        }


@router.get("/health")
async def mcp_health_check() -> dict[str, Any]:
    """Check if the MCP integration is accessible."""
    try:
        # Get MCP integration
        mcp_integration = get_mcp_integration()

        # Check health
        health = await mcp_integration.health_check()

        return health
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "mcp-integrated",
            "error": str(e),
        }
