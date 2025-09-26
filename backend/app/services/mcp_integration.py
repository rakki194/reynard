"""MCP Integration Service
"""

import asyncio
import json
import logging
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class MCPIntegration:
    """MCP functionality integrated directly into the backend."""
    
    def __init__(self):
        """Initialize the MCP integration."""
        self._initialized = False
        self._tool_registry = None
        self._tool_config_service = None
        self._tool_discovery = None
        
    async def _ensure_initialized(self):
        """Ensure the MCP integration is initialized."""
        if self._initialized:
            return
            
        try:
            # Add MCP server to Python path
            mcp_server_path = Path(__file__).parent.parent.parent.parent / "services" / "mcp-server"
            if str(mcp_server_path) not in sys.path:
                sys.path.insert(0, str(mcp_server_path))
            
            # Import MCP server components
            from protocol.tool_registry import get_tool_registry
            from protocol.tool_discovery import ToolDiscovery
            from services.postgresql_tool_config_service import ToolConfigService
            
            # Initialize MCP components
            self._tool_registry = get_tool_registry()
            self._tool_config_service = ToolConfigService(tool_registry=self._tool_registry)
            self._tool_discovery = ToolDiscovery(self._tool_registry)
            
            # Auto-discover and register tools
            logger.info("Initializing MCP integration with tool discovery...")
            count = self._tool_discovery.import_and_register_tools('tools/development/git/git_tool.py')
            logger.info(f"Registered {count} tools in MCP integration")
            
            self._initialized = True
            logger.info("MCP integration initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize MCP integration: {e}")
            raise
    
    async def list_tools(self) -> Dict[str, Any]:
        """List all available tools."""
        await self._ensure_initialized()
        
        try:
            # Get all tools from registry
            all_tools = self._tool_registry.list_all_tools()
            
            # Convert to MCP format
            tools = []
            for tool_name in all_tools:
                tool_metadata = self._tool_registry.get_tool_metadata(tool_name)
                if tool_metadata and await self._tool_registry.is_tool_enabled(tool_name):
                    tool_def = {
                        "name": tool_name,
                        "description": tool_metadata.description,
                        "inputSchema": tool_metadata.config.get("input_schema", {})
                    }
                    tools.append(tool_def)
            
            return {"tools": tools}
            
        except Exception as e:
            logger.error(f"Failed to list tools: {e}")
            raise
    
    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call a specific tool."""
        await self._ensure_initialized()
        
        try:
            # Check if tool exists and is enabled
            if not await self._tool_registry.is_tool_enabled(tool_name):
                raise Exception(f"Tool '{tool_name}' is not enabled")
            
            # Get tool handler
            tool_metadata = self._tool_registry.get_handler(tool_name)
            if not tool_metadata:
                raise Exception(f"Tool '{tool_name}' not found")
            
            # Get the actual handler function
            handler_func = tool_metadata.handler_method
            
            # Execute the tool
            result = await handler_func(**arguments)
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to call tool {tool_name}: {e}")
            raise
    
    async def health_check(self) -> Dict[str, Any]:
        """Check the health of the MCP integration."""
        try:
            await self._ensure_initialized()
            
            # Get basic stats
            all_tools = self._tool_registry.list_all_tools()
            enabled_tools = [t for t in all_tools if await self._tool_registry.is_tool_enabled(t)]
            
            return {
                "status": "healthy",
                "service": "mcp-integrated",
                "total_tools": len(all_tools),
                "enabled_tools": len(enabled_tools),
                "initialized": self._initialized
            }
            
        except Exception as e:
            return {
                "status": "unhealthy",
                "service": "mcp-integrated",
                "error": str(e),
                "initialized": self._initialized
            }


# Global MCP integration instance
_mcp_integration: Optional[MCPIntegration] = None


def get_mcp_integration() -> MCPIntegration:
    """Get the global MCP integration instance."""
    global _mcp_integration
    if _mcp_integration is None:
        _mcp_integration = MCPIntegration()
    return _mcp_integration
