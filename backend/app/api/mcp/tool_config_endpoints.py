"""
Tool Configuration Management Endpoints
======================================

Endpoints for managing MCP tool configuration and enable/disable states.
"""

import logging
from datetime import UTC
from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mcp/tool-config", tags=["mcp_tool_config"])


def _generate_mcp_admin_token() -> str:
    """Generate an admin token for MCP server communication."""
    import time
    from datetime import datetime, timedelta

    import jwt

    # MCP token configuration (should match MCP server)
    MCP_JWT_SECRET = "reynard-mcp-secret-key-2025"
    MCP_JWT_ALGORITHM = "HS256"
    MCP_TOKEN_EXPIRE_HOURS = 24

    # Create token payload
    expire = datetime.now(UTC) + timedelta(hours=MCP_TOKEN_EXPIRE_HOURS)
    payload = {
        "client_id": "backend-admin",
        "permissions": [
            "mcp:admin",
            "mcp:tools:manage",
            "mcp:config:read",
            "mcp:config:write",
        ],
        "exp": expire.timestamp(),
        "iat": time.time(),
        "iss": "reynard-mcp-server",
        "aud": "reynard-backend",
    }

    # Generate token
    token = jwt.encode(payload, MCP_JWT_SECRET, algorithm=MCP_JWT_ALGORITHM)
    return token


class ToolConfigResponse(BaseModel):
    """Response model for tool configuration."""

    name: str = Field(..., description="Tool name")
    category: str = Field(..., description="Tool category")
    enabled: bool = Field(..., description="Whether tool is enabled")
    description: str = Field(..., description="Tool description")
    dependencies: list[str] = Field(
        default_factory=list, description="Tool dependencies"
    )
    config: dict[str, Any] = Field(
        default_factory=dict, description="Tool configuration"
    )


class ToolConfigUpdateRequest(BaseModel):
    """Request model for updating tool configuration."""

    tool_name: str = Field(..., description="Name of the tool to update")
    enabled: bool | None = Field(None, description="New enabled state")
    config: dict[str, Any] | None = Field(None, description="New configuration")


class ToolConfigListResponse(BaseModel):
    """Response model for tool configuration list."""

    tools: dict[str, ToolConfigResponse] = Field(
        ..., description="All tool configurations"
    )
    total_tools: int = Field(..., description="Total number of tools")
    enabled_tools: int = Field(..., description="Number of enabled tools")
    disabled_tools: int = Field(..., description="Number of disabled tools")


class ToolToggleRequest(BaseModel):
    """Request model for toggling tool state."""

    tool_name: str = Field(..., description="Name of the tool to toggle")


async def _get_mcp_tool_configs() -> dict[str, Any]:
    """Get tool configurations from MCP server."""
    try:
        # Import the MCP communication function
        from .tools_endpoints import _send_mcp_request

        # Generate admin token for MCP server communication
        admin_token = _generate_mcp_admin_token()

        # Call the MCP server to get tool configurations
        result = await _send_mcp_request(
            "tools/call",
            {"name": "get_tool_configs", "arguments": {}, "auth_token": admin_token},
        )

        if result and result.get("success"):
            # The _send_mcp_request function already extracts the result
            return result
        logger.error(f"MCP server returned error: {result}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MCP server returned error",
        )
    except Exception as e:
        logger.error(f"Failed to get MCP tool configurations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tool configurations: {e}",
        )


async def _update_mcp_tool_config(
    tool_name: str,
    enabled: bool | None = None,
    config: dict[str, Any] | None = None,
) -> bool:
    """Update tool configuration in MCP server."""
    try:
        # Import the MCP communication function
        from .tools_endpoints import _send_mcp_request

        # Generate admin token for MCP server communication
        admin_token = _generate_mcp_admin_token()

        # Determine which MCP tool to call based on the operation
        if enabled is not None:
            tool_method = "enable_tool" if enabled else "disable_tool"
            result = await _send_mcp_request(
                "tools/call",
                {
                    "name": tool_method,
                    "arguments": {"tool_name": tool_name},
                    "auth_token": admin_token,
                },
            )
        elif config is not None:
            result = await _send_mcp_request(
                "tools/call",
                {
                    "name": "update_tool_config",
                    "arguments": {"tool_name": tool_name, "config": config},
                    "auth_token": admin_token,
                },
            )
        else:
            logger.warning(f"No operation specified for tool {tool_name}")
            return False

        if result and result.get("success"):
            logger.info(
                f"Successfully updated tool {tool_name}: enabled={enabled}, config={config}"
            )
            return True
        logger.error(f"MCP server returned error for tool {tool_name}: {result}")
        return False
    except Exception as e:
        logger.error(f"Failed to update MCP tool configuration for {tool_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update tool configuration: {e}",
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

        # Extract stats from the MCP response
        stats = config_data.get("stats", {})

        return ToolConfigListResponse(
            tools=tools,
            total_tools=stats.get("total_tools", 0),
            enabled_tools=stats.get("enabled_tools", 0),
            disabled_tools=stats.get("disabled_tools", 0),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to get tool configurations")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tool configurations: {e}",
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
                detail=f"Tool '{tool_name}' not found",
            )

        tool_config = config_data["tools"][tool_name]
        return ToolConfigResponse(**tool_config)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to get tool configuration for {tool_name}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tool configuration: {e}",
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
                detail=f"Tool '{tool_name}' not found",
            )

        # Update the tool configuration
        success = await _update_mcp_tool_config(
            tool_name=tool_name, enabled=request.enabled, config=request.config
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update tool configuration",
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
            detail=f"Failed to update tool configuration: {e}",
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
                detail=f"Tool '{tool_name}' not found",
            )

        current_config = config_data["tools"][tool_name]
        new_enabled_state = not current_config["enabled"]

        # Update the tool configuration
        success = await _update_mcp_tool_config(
            tool_name=tool_name, enabled=new_enabled_state
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to toggle tool state",
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
            detail=f"Failed to toggle tool: {e}",
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
                detail=f"Tool '{tool_name}' not found",
            )

        current_config = config_data["tools"][tool_name]
        if current_config["enabled"]:
            # Tool is already enabled
            return ToolConfigResponse(**current_config)

        # Enable the tool
        success = await _update_mcp_tool_config(tool_name=tool_name, enabled=True)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to enable tool",
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
            detail=f"Failed to enable tool: {e}",
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
                detail=f"Tool '{tool_name}' not found",
            )

        current_config = config_data["tools"][tool_name]
        if not current_config["enabled"]:
            # Tool is already disabled
            return ToolConfigResponse(**current_config)

        # Disable the tool
        success = await _update_mcp_tool_config(tool_name=tool_name, enabled=False)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to disable tool",
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
            detail=f"Failed to disable tool: {e}",
        )


@router.get("/category/{category}", response_model=dict[str, ToolConfigResponse])
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
            detail=f"Failed to get tools by category: {e}",
        )
