#!/usr/bin/env python3
"""
Tool Configuration Management Tools
===================================

MCP tools for managing tool configuration and enable/disable states.
Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any, Dict

from config.tool_config import ToolConfigManager, ToolCategory
from protocol.tool_registry import ToolRegistry


class ConfigTools:
    """Tools for managing MCP tool configuration."""

    def __init__(self, tool_registry: ToolRegistry):
        self.tool_registry = tool_registry
        self.config_manager = tool_registry._config_manager

    async def get_tool_configs(self, category: str = None) -> dict[str, Any]:
        """Get all tool configurations, optionally filtered by category."""
        try:
            configs = self.tool_registry.get_all_tool_configs()
            
            if category:
                # Filter by category
                filtered_configs = {}
                for name, config in configs.items():
                    if config.get('category') == category:
                        filtered_configs[name] = config
                configs = filtered_configs
            
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Tool configurations{' (category: ' + category + ')' if category else ''}:\n\n" +
                               "\n".join([
                                   f"• {name}: {config.get('description', 'No description')} "
                                   f"[{'enabled' if config.get('enabled') else 'disabled'}]"
                                   for name, config in configs.items()
                               ])
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error getting tool configurations: {e}"
                    }
                ]
            }

    async def enable_tool(self, tool_name: str) -> dict[str, Any]:
        """Enable a specific tool."""
        try:
            success = self.tool_registry.enable_tool(tool_name)
            if success:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"✅ Tool '{tool_name}' enabled successfully"
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Failed to enable tool '{tool_name}' - tool not found"
                        }
                    ]
                }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error enabling tool '{tool_name}': {e}"
                    }
                ]
            }

    async def disable_tool(self, tool_name: str) -> dict[str, Any]:
        """Disable a specific tool."""
        try:
            success = self.tool_registry.disable_tool(tool_name)
            if success:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"✅ Tool '{tool_name}' disabled successfully"
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ Failed to disable tool '{tool_name}' - tool not found"
                        }
                    ]
                }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error disabling tool '{tool_name}': {e}"
                    }
                ]
            }

    async def toggle_tool(self, tool_name: str) -> dict[str, Any]:
        """Toggle a tool's enabled state."""
        try:
            new_state = self.tool_registry.toggle_tool(tool_name)
            state_text = "enabled" if new_state else "disabled"
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"✅ Tool '{tool_name}' {state_text}"
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error toggling tool '{tool_name}': {e}"
                    }
                ]
            }

    async def get_tool_status(self, tool_name: str = None) -> dict[str, Any]:
        """Get status of a specific tool or all tools."""
        try:
            if tool_name:
                # Get specific tool status
                is_enabled = self.tool_registry.is_tool_enabled(tool_name)
                is_registered = self.tool_registry.is_tool_registered(tool_name)
                config = self.tool_registry.get_tool_config(tool_name)
                
                status_text = f"Tool '{tool_name}':\n"
                status_text += f"• Registered: {'Yes' if is_registered else 'No'}\n"
                status_text += f"• Enabled: {'Yes' if is_enabled else 'No'}\n"
                if config:
                    status_text += f"• Category: {config.get('category', 'Unknown')}\n"
                    status_text += f"• Description: {config.get('description', 'No description')}\n"
                
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": status_text
                        }
                    ]
                }
            else:
                # Get all tools status
                all_tools = self.tool_registry.list_all_tools()
                enabled_tools = self.tool_registry.list_enabled_tools()
                disabled_tools = all_tools - enabled_tools
                
                status_text = f"Tool Status Summary:\n"
                status_text += f"• Total tools: {len(all_tools)}\n"
                status_text += f"• Enabled: {len(enabled_tools)}\n"
                status_text += f"• Disabled: {len(disabled_tools)}\n\n"
                
                if enabled_tools:
                    status_text += "Enabled tools:\n"
                    status_text += "\n".join([f"  • {tool}" for tool in sorted(enabled_tools)]) + "\n\n"
                
                if disabled_tools:
                    status_text += "Disabled tools:\n"
                    status_text += "\n".join([f"  • {tool}" for tool in sorted(disabled_tools)])
                
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": status_text
                        }
                    ]
                }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error getting tool status: {e}"
                    }
                ]
            }

    async def reload_config(self) -> dict[str, Any]:
        """Reload tool configuration from file."""
        try:
            self.tool_registry.reload_config()
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "✅ Tool configuration reloaded successfully"
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error reloading configuration: {e}"
                    }
                ]
            }
