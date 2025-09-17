"""
Tool Management Tools for MCP Server

This module provides tools for managing tool configurations, enabling/disabling tools,
and providing tool information to the FastAPI backend.
"""

import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)


class ToolManagementTools:
    """Tools for managing MCP tool configurations."""

    def __init__(self, tool_registry):
        """Initialize tool management tools."""
        self.tool_registry = tool_registry

    def get_tool_configs(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Get all tool configurations."""
        try:
            configs = self.tool_registry.get_tool_configs()
            stats = self.tool_registry.get_tool_stats()

            return {
                "success": True,
                "tools": configs,
                "stats": stats,
                "message": f"Retrieved {len(configs)} tool configurations",
            }
        except Exception as e:
            logger.error(f"Failed to get tool configs: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to retrieve tool configurations",
            }

    def get_tool_status(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Get status of a specific tool or all tools."""
        try:
            tool_name = arguments.get("tool_name")

            if tool_name:
                # Get specific tool status
                is_registered = self.tool_registry.is_tool_registered(tool_name)
                is_enabled = (
                    self.tool_registry.is_tool_enabled(tool_name)
                    if is_registered
                    else False
                )
                config = (
                    self.tool_registry.get_tool_config(tool_name)
                    if is_registered
                    else None
                )

                return {
                    "success": True,
                    "tool_name": tool_name,
                    "is_registered": is_registered,
                    "is_enabled": is_enabled,
                    "config": config,
                    "message": f"Tool '{tool_name}' is {'enabled' if is_enabled else 'disabled'}",
                }
            else:
                # Get all tools status
                all_tools = self.tool_registry.list_all_tools()
                tool_statuses = {}

                for tool_name in all_tools:
                    tool_statuses[tool_name] = {
                        "is_registered": True,
                        "is_enabled": self.tool_registry.is_tool_enabled(tool_name),
                        "config": self.tool_registry.get_tool_config(tool_name),
                    }

                return {
                    "success": True,
                    "tools": tool_statuses,
                    "message": f"Retrieved status for {len(tool_statuses)} tools",
                }
        except Exception as e:
            logger.error(f"Failed to get tool status: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to retrieve tool status",
            }

    def enable_tool(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Enable a specific tool."""
        try:
            tool_name = arguments.get("tool_name")
            if not tool_name:
                return {
                    "success": False,
                    "error": "tool_name is required",
                    "message": "Tool name must be provided",
                }

            success = self.tool_registry.enable_tool(tool_name)

            if success:
                return {
                    "success": True,
                    "tool_name": tool_name,
                    "enabled": True,
                    "message": f"Tool '{tool_name}' has been enabled",
                }
            else:
                return {
                    "success": False,
                    "tool_name": tool_name,
                    "error": "Tool not found or already enabled",
                    "message": f"Failed to enable tool '{tool_name}'",
                }
        except Exception as e:
            logger.error(f"Failed to enable tool: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to enable tool",
            }

    def disable_tool(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Disable a specific tool."""
        try:
            tool_name = arguments.get("tool_name")
            if not tool_name:
                return {
                    "success": False,
                    "error": "tool_name is required",
                    "message": "Tool name must be provided",
                }

            success = self.tool_registry.disable_tool(tool_name)

            if success:
                return {
                    "success": True,
                    "tool_name": tool_name,
                    "enabled": False,
                    "message": f"Tool '{tool_name}' has been disabled",
                }
            else:
                return {
                    "success": False,
                    "tool_name": tool_name,
                    "error": "Tool not found or already disabled",
                    "message": f"Failed to disable tool '{tool_name}'",
                }
        except Exception as e:
            logger.error(f"Failed to disable tool: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to disable tool",
            }

    def toggle_tool(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Toggle a tool's enabled state."""
        try:
            tool_name = arguments.get("tool_name")
            if not tool_name:
                return {
                    "success": False,
                    "error": "tool_name is required",
                    "message": "Tool name must be provided",
                }

            success = self.tool_registry.toggle_tool(tool_name)

            if success:
                new_state = self.tool_registry.is_tool_enabled(tool_name)
                return {
                    "success": True,
                    "tool_name": tool_name,
                    "enabled": new_state,
                    "message": f"Tool '{tool_name}' has been {'enabled' if new_state else 'disabled'}",
                }
            else:
                return {
                    "success": False,
                    "tool_name": tool_name,
                    "error": "Tool not found",
                    "message": f"Failed to toggle tool '{tool_name}'",
                }
        except Exception as e:
            logger.error(f"Failed to toggle tool: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to toggle tool",
            }

    def get_tools_by_category(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Get tools by category."""
        try:
            category = arguments.get("category")
            if not category:
                return {
                    "success": False,
                    "error": "category is required",
                    "message": "Category must be provided",
                }

            tools = self.tool_registry.get_tools_by_category(category)

            return {
                "success": True,
                "category": category,
                "tools": tools,
                "count": len(tools),
                "message": f"Found {len(tools)} tools in category '{category}'",
            }
        except Exception as e:
            logger.error(f"Failed to get tools by category: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to retrieve tools by category",
            }

    def update_tool_config(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Update tool configuration."""
        try:
            tool_name = arguments.get("tool_name")
            config = arguments.get("config", {})

            if not tool_name:
                return {
                    "success": False,
                    "error": "tool_name is required",
                    "message": "Tool name must be provided",
                }

            success = self.tool_registry.update_tool_config(tool_name, config)

            if success:
                return {
                    "success": True,
                    "tool_name": tool_name,
                    "config": config,
                    "message": f"Configuration updated for tool '{tool_name}'",
                }
            else:
                return {
                    "success": False,
                    "tool_name": tool_name,
                    "error": "Tool not found",
                    "message": f"Failed to update configuration for tool '{tool_name}'",
                }
        except Exception as e:
            logger.error(f"Failed to update tool config: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to update tool configuration",
            }

    def reload_config(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Reload tool configuration from file."""
        try:
            self.tool_registry.reload_config()

            return {
                "success": True,
                "message": "Tool configuration reloaded successfully",
            }
        except Exception as e:
            logger.error(f"Failed to reload config: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to reload tool configuration",
            }
