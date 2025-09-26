"""MCP Bridge Service

This module provides a bridge between the Reynard backend and MCP (Model Context Protocol) services.
It acts as a service layer that integrates MCP functionality with the Reynard ecosystem.
"""

import logging
from typing import Any, Dict, Optional

from .mcp_integration import MCPIntegration

logger = logging.getLogger(__name__)

# Global MCP bridge instance
_mcp_bridge: Optional[MCPIntegration] = None


def get_mcp_bridge() -> MCPIntegration:
    """Get the global MCP bridge instance.
    
    Returns:
        MCPIntegration: The MCP bridge service instance
        
    Raises:
        RuntimeError: If the MCP bridge is not initialized
    """
    global _mcp_bridge
    
    if _mcp_bridge is None:
        _mcp_bridge = MCPIntegration()
        logger.info("MCP bridge service initialized")
    
    return _mcp_bridge


async def initialize_mcp_bridge() -> bool:
    """Initialize the MCP bridge service.
    
    Returns:
        bool: True if initialization successful, False otherwise
    """
    try:
        bridge = get_mcp_bridge()
        await bridge._ensure_initialized()
        logger.info("MCP bridge service initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize MCP bridge service: {e}")
        return False


async def shutdown_mcp_bridge() -> None:
    """Shutdown the MCP bridge service."""
    global _mcp_bridge
    
    try:
        if _mcp_bridge:
            # Add any cleanup logic here if needed
            _mcp_bridge = None
            logger.info("MCP bridge service shutdown")
    except Exception as e:
        logger.error(f"Error during MCP bridge service shutdown: {e}")


async def health_check_mcp_bridge() -> bool:
    """Check MCP bridge service health.
    
    Returns:
        bool: True if service is healthy, False otherwise
    """
    try:
        bridge = get_mcp_bridge()
        return bridge._initialized
    except Exception as e:
        logger.error(f"MCP bridge health check failed: {e}")
        return False
