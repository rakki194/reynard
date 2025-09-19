#!/usr/bin/env python3
"""
FastAPI Tool Endpoints
======================

FastAPI endpoints for tool discovery and synchronization with the new
tool registration system.

Follows the 140-line axiom and modular architecture principles.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from protocol.tool_registry import get_tool_registry, ToolMetadata
from protocol.tool_discovery import ToolDiscovery
from services.tool_config_service import ToolConfigService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/mcp/tools", tags=["MCP Tools"])


class ToolMetadataResponse(BaseModel):
    """Response model for tool metadata."""
    name: str
    category: str
    description: str
    execution_type: str
    enabled: bool
    dependencies: List[str]
    config: Dict[str, Any]
    source_file: Optional[str] = None
    line_number: Optional[int] = None


class ToolSyncRequest(BaseModel):
    """Request model for tool synchronization."""
    tool_name: Optional[str] = None
    force_sync: bool = False


class ToolSyncResponse(BaseModel):
    """Response model for tool synchronization."""
    success: bool
    message: str
    tools_synced: int


@router.get("/discover", response_model=List[ToolMetadataResponse])
async def discover_tools():
    """Discover all available MCP tools."""
    try:
        tools = []
        for tool_metadata in get_tool_registry().list_all_tools().values():
            tools.append(ToolMetadataResponse(
                name=tool_metadata.name,
                category=tool_metadata.category,
                description=tool_metadata.description,
                execution_type=tool_metadata.execution_type.value,
                enabled=tool_metadata.enabled,
                dependencies=tool_metadata.dependencies,
                config=tool_metadata.config,
                source_file=tool_metadata.source_file,
                line_number=tool_metadata.line_number
            ))
        
        logger.info(f"Discovered {len(tools)} tools")
        return tools
    except Exception as e:
        logger.error(f"Failed to discover tools: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to discover tools: {e}")


@router.post("/sync", response_model=ToolSyncResponse)
async def sync_tools(request: ToolSyncRequest):
    """Manually sync tools with configuration services."""
    try:
        config_service = ToolConfigService(tool_registry=tool_registry)
        
        if request.tool_name:
            # Sync specific tool
            metadata = get_tool_registry().get_tool_metadata(request.tool_name)
            if not metadata:
                raise HTTPException(status_code=404, detail=f"Tool {request.tool_name} not found")
            
            config_service.sync_tool_with_services(metadata)
            tools_synced = 1
            message = f"Synced tool {request.tool_name}"
        else:
            # Sync all tools
            config_service.auto_sync_all_tools()
            tools_synced = len(get_tool_registry().list_all_tools())
            message = f"Synced {tools_synced} tools"
        
        logger.info(message)
        return ToolSyncResponse(
            success=True,
            message=message,
            tools_synced=tools_synced
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to sync tools: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to sync tools: {e}")


@router.get("/categories/{category}", response_model=List[ToolMetadataResponse])
async def get_tools_by_category(category: str):
    """Get tools by category."""
    try:
        tools = []
        for tool_metadata in get_tool_registry().get_tools_by_category(category).values():
            tools.append(ToolMetadataResponse(
                name=tool_metadata.name,
                category=tool_metadata.category,
                description=tool_metadata.description,
                execution_type=tool_metadata.execution_type.value,
                enabled=tool_metadata.enabled,
                dependencies=tool_metadata.dependencies,
                config=tool_metadata.config,
                source_file=tool_metadata.source_file,
                line_number=tool_metadata.line_number
            ))
        
        logger.info(f"Found {len(tools)} tools in category {category}")
        return tools
    except Exception as e:
        logger.error(f"Failed to get tools by category: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get tools by category: {e}")


@router.get("/stats")
async def get_tool_stats():
    """Get tool statistics."""
    try:
        config_service = ToolConfigService(tool_registry=tool_registry)
        stats = config_service.get_tool_stats()
        
        # Add discovery stats
        discovery = ToolDiscovery(tool_registry)
        validation = discovery.validate_tool_registration()
        
        stats.update({
            "discovery_stats": validation,
            "total_registered": len(get_tool_registry().list_all_tools())
        })
        
        return stats
    except Exception as e:
        logger.error(f"Failed to get tool stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get tool stats: {e}")


@router.post("/discover-modules")
async def discover_tools_in_modules():
    """Discover tools in all modules."""
    try:
        discovery = ToolDiscovery(tool_registry)
        
        # Discover tools in the tools directory
        discovered_count = discovery.discover_and_import_tools("tools")
        
        # Get validation results
        validation = discovery.validate_tool_registration()
        
        return {
            "success": True,
            "message": f"Discovered {discovered_count} tools",
            "discovered_count": discovered_count,
            "validation": validation
        }
    except Exception as e:
        logger.error(f"Failed to discover tools in modules: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to discover tools in modules: {e}")


@router.get("/{tool_name}", response_model=ToolMetadataResponse)
async def get_tool_metadata(tool_name: str):
    """Get metadata for a specific tool."""
    try:
        metadata = get_tool_registry().get_tool_metadata(tool_name)
        if not metadata:
            raise HTTPException(status_code=404, detail=f"Tool {tool_name} not found")
        
        return ToolMetadataResponse(
            name=metadata.name,
            category=metadata.category,
            description=metadata.description,
            execution_type=metadata.execution_type.value,
            enabled=metadata.enabled,
            dependencies=metadata.dependencies,
            config=metadata.config,
            source_file=metadata.source_file,
            line_number=metadata.line_number
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get tool metadata: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get tool metadata: {e}")


@router.post("/{tool_name}/enable")
async def enable_tool(tool_name: str):
    """Enable a specific tool."""
    try:
        success = get_tool_registry().enable_tool(tool_name)
        if not success:
            raise HTTPException(status_code=404, detail=f"Tool {tool_name} not found")
        
        return {"success": True, "message": f"Tool {tool_name} enabled"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to enable tool: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to enable tool: {e}")


@router.post("/{tool_name}/disable")
async def disable_tool(tool_name: str):
    """Disable a specific tool."""
    try:
        success = get_tool_registry().disable_tool(tool_name)
        if not success:
            raise HTTPException(status_code=404, detail=f"Tool {tool_name} not found")
        
        return {"success": True, "message": f"Tool {tool_name} disabled"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to disable tool: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to disable tool: {e}")


@router.post("/{tool_name}/toggle")
async def toggle_tool(tool_name: str):
    """Toggle a tool's enabled state."""
    try:
        success = get_tool_registry().toggle_tool(tool_name)
        if not success:
            raise HTTPException(status_code=404, detail=f"Tool {tool_name} not found")
        
        enabled = get_tool_registry().is_tool_enabled(tool_name)
        return {
            "success": True, 
            "message": f"Tool {tool_name} {'enabled' if enabled else 'disabled'}",
            "enabled": enabled
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to toggle tool: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to toggle tool: {e}")
