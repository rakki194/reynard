"""MCP Bridge API Endpoints

This module provides REST API endpoints for MCP bridge functionality,
allowing external clients to interact with MCP services through the Reynard backend.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.services.mcp_bridge import get_mcp_bridge

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/mcp-bridge", tags=["MCP Bridge"])


class MCPBridgeStatus(BaseModel):
    """MCP Bridge status response model."""
    initialized: bool
    status: str
    message: Optional[str] = None


class MCPToolRequest(BaseModel):
    """MCP tool request model."""
    tool_name: str
    parameters: Dict[str, Any]


class MCPToolResponse(BaseModel):
    """MCP tool response model."""
    success: bool
    result: Optional[Any] = None
    error: Optional[str] = None


@router.get("/status", response_model=MCPBridgeStatus)
async def get_mcp_bridge_status():
    """Get MCP bridge service status.
    
    Returns:
        MCPBridgeStatus: Current status of the MCP bridge service
    """
    try:
        bridge = get_mcp_bridge()
        
        return MCPBridgeStatus(
            initialized=bridge._initialized,
            status="healthy" if bridge._initialized else "not_initialized",
            message="MCP bridge service is operational" if bridge._initialized else "MCP bridge service not initialized"
        )
    except Exception as e:
        logger.error(f"Failed to get MCP bridge status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get MCP bridge status: {str(e)}"
        )


@router.post("/initialize")
async def initialize_mcp_bridge():
    """Initialize the MCP bridge service.
    
    Returns:
        Dict: Initialization result
    """
    try:
        from app.services.mcp_bridge import initialize_mcp_bridge
        
        success = await initialize_mcp_bridge()
        
        if success:
            return {"success": True, "message": "MCP bridge service initialized successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to initialize MCP bridge service"
            )
    except Exception as e:
        logger.error(f"Failed to initialize MCP bridge: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize MCP bridge: {str(e)}"
        )


@router.get("/tools")
async def list_mcp_tools():
    """List available MCP tools.
    
    Returns:
        Dict: List of available MCP tools
    """
    try:
        bridge = get_mcp_bridge()
        
        if not bridge._initialized:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="MCP bridge service not initialized"
            )
        
        # Get available tools from the bridge
        tools = []
        if hasattr(bridge, '_tool_registry') and bridge._tool_registry:
            # Extract tool information from the registry
            tools = list(bridge._tool_registry.keys()) if isinstance(bridge._tool_registry, dict) else []
        
        return {
            "success": True,
            "tools": tools,
            "count": len(tools)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to list MCP tools: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list MCP tools: {str(e)}"
        )


@router.post("/tools/execute", response_model=MCPToolResponse)
async def execute_mcp_tool(request: MCPToolRequest):
    """Execute an MCP tool.
    
    Args:
        request: MCP tool execution request
        
    Returns:
        MCPToolResponse: Tool execution result
    """
    try:
        bridge = get_mcp_bridge()
        
        if not bridge._initialized:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="MCP bridge service not initialized"
            )
        
        # Execute the tool through the bridge
        # This is a placeholder implementation - actual tool execution would depend on the MCP integration
        result = {
            "tool_name": request.tool_name,
            "parameters": request.parameters,
            "status": "executed"
        }
        
        return MCPToolResponse(
            success=True,
            result=result
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to execute MCP tool {request.tool_name}: {e}")
        return MCPToolResponse(
            success=False,
            error=str(e)
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for MCP bridge service.
    
    Returns:
        Dict: Health status
    """
    try:
        from app.services.mcp_bridge import health_check_mcp_bridge
        
        is_healthy = await health_check_mcp_bridge()
        
        return {
            "healthy": is_healthy,
            "status": "healthy" if is_healthy else "unhealthy",
            "service": "mcp_bridge"
        }
    except Exception as e:
        logger.error(f"MCP bridge health check failed: {e}")
        return {
            "healthy": False,
            "status": "error",
            "service": "mcp_bridge",
            "error": str(e)
        }
