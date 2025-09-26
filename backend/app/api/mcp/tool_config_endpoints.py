#!/usr/bin/env python3
"""
Tool Configuration API Endpoints
================================

FastAPI endpoints for managing tool configurations via PostgreSQL.
Provides REST API for tool CRUD operations, statistics, and configuration management.

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db_session
from app.services.tool_config_service import ToolConfigService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/mcp/tool-config", tags=["tool-configuration"])


# Pydantic Models
class ToolConfigRequest(BaseModel):
    """Request model for tool configuration."""

    name: str = Field(..., description="Tool name")
    category: str = Field(..., description="Tool category")
    enabled: bool = Field(default=True, description="Whether tool is enabled")
    description: str = Field(..., description="Tool description")
    dependencies: List[str] = Field(default=[], description="Tool dependencies")
    config: Dict[str, Any] = Field(default={}, description="Tool configuration")
    version: str = Field(default="1.0.0", description="Tool version")
    is_system_tool: bool = Field(
        default=False, description="Whether tool is a system tool"
    )
    execution_type: str = Field(default="sync", description="Execution type")
    timeout_seconds: Optional[int] = Field(default=30, description="Timeout in seconds")
    max_concurrent: Optional[int] = Field(
        default=1, description="Max concurrent executions"
    )


class ToolUpdateRequest(BaseModel):
    """Request model for updating tool configuration."""

    description: Optional[str] = Field(None, description="Tool description")
    dependencies: Optional[List[str]] = Field(None, description="Tool dependencies")
    config: Optional[Dict[str, Any]] = Field(None, description="Tool configuration")
    version: Optional[str] = Field(None, description="Tool version")
    execution_type: Optional[str] = Field(None, description="Execution type")
    timeout_seconds: Optional[int] = Field(None, description="Timeout in seconds")
    max_concurrent: Optional[int] = Field(None, description="Max concurrent executions")


class ToolToggleRequest(BaseModel):
    """Request model for toggling tool state."""

    enabled: bool = Field(..., description="New enabled state")


class JSONSyncRequest(BaseModel):
    """Request model for syncing from JSON."""

    json_data: Dict[str, Any] = Field(..., description="JSON configuration data")


class GlobalConfigRequest(BaseModel):
    """Request model for global configuration."""

    auto_sync_enabled: Optional[bool] = Field(None, description="Enable auto-sync")
    default_timeout: Optional[int] = Field(None, description="Default timeout")
    max_concurrent_tools: Optional[int] = Field(
        None, description="Max concurrent tools"
    )
    cache_ttl_seconds: Optional[int] = Field(None, description="Cache TTL")
    settings: Optional[Dict[str, Any]] = Field(None, description="Additional settings")


# Dependency
def get_tool_config_service(db: Session = Depends(get_db_session)) -> ToolConfigService:
    """Get tool configuration service."""
    return ToolConfigService(db_session=db)


# Endpoints
@router.get("/tools", response_model=List[Dict[str, Any]])
async def get_all_tools(
    include_disabled: bool = Query(default=False, description="Include disabled tools"),
    service: ToolConfigService = Depends(get_tool_config_service),
) -> List[Dict[str, Any]]:
    """Get all tools with optional filtering."""
    try:
        tools = service.get_all_tools(include_disabled=include_disabled)
        return tools
    except Exception as e:
        logger.error(f"Failed to get all tools: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tools: {str(e)}",
        )


@router.get("/tools/{tool_name}", response_model=Dict[str, Any])
async def get_tool(
    tool_name: str, service: ToolConfigService = Depends(get_tool_config_service)
) -> Dict[str, Any]:
    """Get a specific tool by name."""
    try:
        tool = service.get_tool_by_name(tool_name)
        if not tool:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tool '{tool_name}' not found",
            )
        return tool
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get tool {tool_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tool: {str(e)}",
        )


@router.get("/tools/category/{category}", response_model=List[Dict[str, Any]])
async def get_tools_by_category(
    category: str,
    include_disabled: bool = Query(default=False, description="Include disabled tools"),
    service: ToolConfigService = Depends(get_tool_config_service),
) -> List[Dict[str, Any]]:
    """Get tools by category."""
    try:
        tools = service.get_tools_by_category(
            category, include_disabled=include_disabled
        )
        return tools
    except Exception as e:
        logger.error(f"Failed to get tools by category {category}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tools by category: {str(e)}",
        )


@router.get("/tools/enabled", response_model=List[str])
async def get_enabled_tools(
    service: ToolConfigService = Depends(get_tool_config_service),
) -> List[str]:
    """Get list of enabled tool names."""
    try:
        enabled_tools = service.get_enabled_tools()
        return list(enabled_tools)
    except Exception as e:
        logger.error(f"Failed to get enabled tools: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get enabled tools: {str(e)}",
        )


@router.post("/tools", response_model=Dict[str, Any])
async def create_tool(
    tool_data: ToolConfigRequest,
    service: ToolConfigService = Depends(get_tool_config_service),
) -> Dict[str, Any]:
    """Create a new tool."""
    try:
        logger.info(f"Creating tool: {tool_data.name}")
        logger.info(f"Tool data: {tool_data.dict()}")
        result = service.create_tool(tool_data.dict(), changed_by="api")
        logger.info(f"Service result: {result}")
        logger.info(f"Result type: {type(result)}")
        logger.info(f"Result is None: {result is None}")
        if not result:
            logger.error(f"Service returned falsy result: {result}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create tool '{tool_data.name}'",
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create tool {tool_data.name}: {e}")
        import traceback

        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create tool: {str(e)}",
        )


@router.put("/tools/{tool_name}", response_model=Dict[str, Any])
async def update_tool(
    tool_name: str,
    tool_data: ToolUpdateRequest,
    service: ToolConfigService = Depends(get_tool_config_service),
) -> Dict[str, Any]:
    """Update an existing tool."""
    try:
        # Filter out None values
        update_data = {k: v for k, v in tool_data.dict().items() if v is not None}

        result = service.update_tool(tool_name, update_data, changed_by="api")
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tool '{tool_name}' not found or update failed",
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update tool {tool_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update tool: {str(e)}",
        )


@router.delete("/tools/{tool_name}", response_model=Dict[str, str])
async def delete_tool(
    tool_name: str, service: ToolConfigService = Depends(get_tool_config_service)
) -> Dict[str, str]:
    """Delete a tool."""
    try:
        success = service.delete_tool(tool_name, changed_by="api")
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tool '{tool_name}' not found",
            )
        return {"message": f"Tool '{tool_name}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete tool {tool_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete tool: {str(e)}",
        )


@router.post("/tools/{tool_name}/enable", response_model=Dict[str, str])
async def enable_tool(
    tool_name: str, service: ToolConfigService = Depends(get_tool_config_service)
) -> Dict[str, str]:
    """Enable a tool."""
    try:
        success = service.enable_tool(tool_name, changed_by="api")
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tool '{tool_name}' not found",
            )
        return {"message": f"Tool '{tool_name}' enabled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to enable tool {tool_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enable tool: {str(e)}",
        )


@router.post("/tools/{tool_name}/disable", response_model=Dict[str, str])
async def disable_tool(
    tool_name: str, service: ToolConfigService = Depends(get_tool_config_service)
) -> Dict[str, str]:
    """Disable a tool."""
    try:
        success = service.disable_tool(tool_name, changed_by="api")
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tool '{tool_name}' not found",
            )
        return {"message": f"Tool '{tool_name}' disabled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to disable tool {tool_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to disable tool: {str(e)}",
        )


@router.post("/tools/{tool_name}/toggle", response_model=Dict[str, Any])
async def toggle_tool(
    tool_name: str, service: ToolConfigService = Depends(get_tool_config_service)
) -> Dict[str, Any]:
    """Toggle a tool's enabled state."""
    try:
        new_state = service.toggle_tool(tool_name, changed_by="api")
        return {
            "message": f"Tool '{tool_name}' toggled successfully",
            "enabled": new_state,
        }
    except Exception as e:
        logger.error(f"Failed to toggle tool {tool_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle tool: {str(e)}",
        )


@router.get("/categories", response_model=List[Dict[str, Any]])
async def get_categories(
    service: ToolConfigService = Depends(get_tool_config_service),
) -> List[Dict[str, Any]]:
    """Get all tool categories."""
    try:
        categories = service.get_tool_categories()
        return categories
    except Exception as e:
        logger.error(f"Failed to get categories: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get categories: {str(e)}",
        )


@router.get("/statistics", response_model=Dict[str, Any])
async def get_statistics(
    service: ToolConfigService = Depends(get_tool_config_service),
) -> Dict[str, Any]:
    """Get tool configuration statistics."""
    try:
        stats = service.get_tool_statistics()
        return stats
    except Exception as e:
        logger.error(f"Failed to get statistics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}",
        )


@router.get("/tools/{tool_name}/history", response_model=List[Dict[str, Any]])
async def get_tool_history(
    tool_name: str,
    limit: int = Query(
        default=50, ge=1, le=100, description="Number of history entries to return"
    ),
    service: ToolConfigService = Depends(get_tool_config_service),
) -> List[Dict[str, Any]]:
    """Get change history for a tool."""
    try:
        history = service.get_tool_history(tool_name, limit=limit)
        return history
    except Exception as e:
        logger.error(f"Failed to get tool history for {tool_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tool history: {str(e)}",
        )


@router.post("/sync-from-json", response_model=Dict[str, Any])
async def sync_from_json(
    sync_request: JSONSyncRequest,
    service: ToolConfigService = Depends(get_tool_config_service),
) -> Dict[str, Any]:
    """Sync tools from JSON configuration."""
    try:
        results = service.sync_from_json(sync_request.json_data, changed_by="api")
        return results
    except Exception as e:
        logger.error(f"Failed to sync from JSON: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync from JSON: {str(e)}",
        )


@router.get("/configuration", response_model=Dict[str, Any])
async def get_global_configuration(
    service: ToolConfigService = Depends(get_tool_config_service),
) -> Dict[str, Any]:
    """Get global tool configuration."""
    try:
        config = service.get_global_configuration()
        return config
    except Exception as e:
        logger.error(f"Failed to get global configuration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get global configuration: {str(e)}",
        )


@router.put("/configuration", response_model=Dict[str, str])
async def update_global_configuration(
    config_data: GlobalConfigRequest,
    service: ToolConfigService = Depends(get_tool_config_service),
) -> Dict[str, str]:
    """Update global tool configuration."""
    try:
        # Filter out None values
        update_data = {k: v for k, v in config_data.dict().items() if v is not None}

        success = service.update_global_configuration(update_data, changed_by="api")
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update global configuration",
            )
        return {"message": "Global configuration updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update global configuration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update global configuration: {str(e)}",
        )


@router.get("/health", response_model=Dict[str, str])
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy", "service": "tool-configuration"}
