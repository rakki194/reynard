"""
Tool Configuration Management Endpoints
======================================

Endpoints for managing MCP tool configuration and enable/disable states.
"""

import json
import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mcp/tool-config", tags=["mcp_tool_config"])


class ToolConfigResponse(BaseModel):
    """Response model for tool configuration."""
    
    name: str = Field(..., description="Tool name")
    category: str = Field(..., description="Tool category")
    enabled: bool = Field(..., description="Whether tool is enabled")
    description: str = Field(..., description="Tool description")
    dependencies: List[str] = Field(default_factory=list, description="Tool dependencies")
    config: Dict[str, Any] = Field(default_factory=dict, description="Tool configuration")


class ToolConfigUpdateRequest(BaseModel):
    """Request model for updating tool configuration."""
    
    tool_name: str = Field(..., description="Name of the tool to update")
    enabled: Optional[bool] = Field(None, description="New enabled state")
    config: Optional[Dict[str, Any]] = Field(None, description="New configuration")


class ToolConfigListResponse(BaseModel):
    """Response model for tool configuration list."""
    
    tools: Dict[str, ToolConfigResponse] = Field(..., description="All tool configurations")
    total_tools: int = Field(..., description="Total number of tools")
    enabled_tools: int = Field(..., description="Number of enabled tools")
    disabled_tools: int = Field(..., description="Number of disabled tools")


class ToolToggleRequest(BaseModel):
    """Request model for toggling tool state."""
    
    tool_name: str = Field(..., description="Name of the tool to toggle")


async def _get_mcp_tool_configs() -> Dict[str, Any]:
    """Get tool configurations from MCP server."""
    try:
        # This would connect to the MCP server to get configurations
        # For now, we'll return a mock response
        return {
            "tools": {
                "generate_agent_name": {
                    "name": "generate_agent_name",
                    "category": "agent",
                    "enabled": True,
                    "description": "Generate robot names with animal spirit themes",
                    "dependencies": [],
                    "config": {}
                },
                "lint_frontend": {
                    "name": "lint_frontend",
                    "category": "linting",
                    "enabled": True,
                    "description": "ESLint for TypeScript/JavaScript (with auto-fix)",
                    "dependencies": [],
                    "config": {}
                },
                "get_ecs_agent_status": {
                    "name": "get_ecs_agent_status",
                    "category": "ecs",
                    "enabled": True,
                    "description": "Get status of all agents in the ECS system",
                    "dependencies": [],
                    "config": {}
                }
            },
            "total_tools": 3,
            "enabled_tools": 3,
            "disabled_tools": 0
        }
    except Exception as e:
        logger.error(f"Failed to get MCP tool configurations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tool configurations: {e}"
        )


async def _update_mcp_tool_config(tool_name: str, enabled: Optional[bool] = None, config: Optional[Dict[str, Any]] = None) -> bool:
    """Update tool configuration in MCP server."""
    try:
        # This would connect to the MCP server to update configurations
        # For now, we'll simulate success
        logger.info(f"Updating tool {tool_name}: enabled={enabled}, config={config}")
        return True
    except Exception as e:
        logger.error(f"Failed to update MCP tool configuration for {tool_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update tool configuration: {e}"
        )


@router.get("/", response_model=ToolConfigListResponse)
async def get_tool_configurations():
    """
    Get all tool configurations.
    
    Returns the current state of all MCP tools including their enabled/disabled status.
    """
    try:
        config_data = await _get_mcp_tool_configs()
        
        # Convert to response format
        tools = {}
        for name, config in config_data["tools"].items():
            tools[name] = ToolConfigResponse(**config)
        
        return ToolConfigListResponse(
            tools=tools,
            total_tools=config_data["total_tools"],
            enabled_tools=config_data["enabled_tools"],
            disabled_tools=config_data["disabled_tools"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to get tool configurations")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tool configurations: {e}"
        )


@router.get("/{tool_name}", response_model=ToolConfigResponse)
async def get_tool_configuration(tool_name: str):
    """
    Get configuration for a specific tool.
    
    Returns the configuration and status for the specified tool.
    """
    try:
        config_data = await _get_mcp_tool_configs()
        
        if tool_name not in config_data["tools"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tool '{tool_name}' not found"
            )
        
        tool_config = config_data["tools"][tool_name]
        return ToolConfigResponse(**tool_config)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to get tool configuration for {tool_name}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tool configuration: {e}"
        )


@router.put("/{tool_name}", response_model=ToolConfigResponse)
async def update_tool_configuration(tool_name: str, request: ToolConfigUpdateRequest):
    """
    Update configuration for a specific tool.
    
    Updates the enabled state and/or configuration for the specified tool.
    """
    try:
        # Validate tool exists
        config_data = await _get_mcp_tool_configs()
        if tool_name not in config_data["tools"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tool '{tool_name}' not found"
            )
        
        # Update the tool configuration
        success = await _update_mcp_tool_config(
            tool_name=tool_name,
            enabled=request.enabled,
            config=request.config
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update tool configuration"
            )
        
        # Get updated configuration
        updated_config_data = await _get_mcp_tool_configs()
        updated_config = updated_config_data["tools"][tool_name]
        
        return ToolConfigResponse(**updated_config)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to update tool configuration for {tool_name}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update tool configuration: {e}"
        )


@router.post("/{tool_name}/toggle", response_model=ToolConfigResponse)
async def toggle_tool(tool_name: str):
    """
    Toggle the enabled state of a tool.
    
    Switches the enabled/disabled state of the specified tool.
    """
    try:
        # Get current configuration
        config_data = await _get_mcp_tool_configs()
        if tool_name not in config_data["tools"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tool '{tool_name}' not found"
            )
        
        current_config = config_data["tools"][tool_name]
        new_enabled_state = not current_config["enabled"]
        
        # Update the tool configuration
        success = await _update_mcp_tool_config(
            tool_name=tool_name,
            enabled=new_enabled_state
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to toggle tool state"
            )
        
        # Get updated configuration
        updated_config_data = await _get_mcp_tool_configs()
        updated_config = updated_config_data["tools"][tool_name]
        
        return ToolConfigResponse(**updated_config)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to toggle tool {tool_name}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle tool: {e}"
        )


@router.post("/{tool_name}/enable", response_model=ToolConfigResponse)
async def enable_tool(tool_name: str):
    """
    Enable a specific tool.
    
    Enables the specified tool if it's currently disabled.
    """
    try:
        # Get current configuration
        config_data = await _get_mcp_tool_configs()
        if tool_name not in config_data["tools"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tool '{tool_name}' not found"
            )
        
        current_config = config_data["tools"][tool_name]
        if current_config["enabled"]:
            # Tool is already enabled
            return ToolConfigResponse(**current_config)
        
        # Enable the tool
        success = await _update_mcp_tool_config(
            tool_name=tool_name,
            enabled=True
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to enable tool"
            )
        
        # Get updated configuration
        updated_config_data = await _get_mcp_tool_configs()
        updated_config = updated_config_data["tools"][tool_name]
        
        return ToolConfigResponse(**updated_config)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to enable tool {tool_name}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enable tool: {e}"
        )


@router.post("/{tool_name}/disable", response_model=ToolConfigResponse)
async def disable_tool(tool_name: str):
    """
    Disable a specific tool.
    
    Disables the specified tool if it's currently enabled.
    """
    try:
        # Get current configuration
        config_data = await _get_mcp_tool_configs()
        if tool_name not in config_data["tools"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tool '{tool_name}' not found"
            )
        
        current_config = config_data["tools"][tool_name]
        if not current_config["enabled"]:
            # Tool is already disabled
            return ToolConfigResponse(**current_config)
        
        # Disable the tool
        success = await _update_mcp_tool_config(
            tool_name=tool_name,
            enabled=False
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to disable tool"
            )
        
        # Get updated configuration
        updated_config_data = await _get_mcp_tool_configs()
        updated_config = updated_config_data["tools"][tool_name]
        
        return ToolConfigResponse(**updated_config)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to disable tool {tool_name}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to disable tool: {e}"
        )


@router.get("/category/{category}", response_model=Dict[str, ToolConfigResponse])
async def get_tools_by_category(category: str):
    """
    Get all tools in a specific category.
    
    Returns all tools that belong to the specified category.
    """
    try:
        config_data = await _get_mcp_tool_configs()
        
        # Filter tools by category
        category_tools = {}
        for name, config in config_data["tools"].items():
            if config["category"] == category:
                category_tools[name] = ToolConfigResponse(**config)
        
        return category_tools
        
    except Exception as e:
        logger.exception(f"Failed to get tools for category {category}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tools by category: {e}"
        )
