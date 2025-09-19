#!/usr/bin/env python3
"""
Tool Management Tools for MCP Server

This module provides tools for managing tool configurations, enabling/disabling tools,
and providing tool information to the FastAPI backend.
Now uses the new @register_tool decorator system for automatic registration.
"""

import logging
from typing import Any, Dict

from protocol.tool_registry import get_tool_registry, register_tool

logger = logging.getLogger(__name__)


@register_tool(
    name="get_tool_configs",
    category="management",
    description="Get all tool configurations and statistics",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def get_tool_configs(**kwargs) -> dict[str, Any]:
    """Get all tool configurations."""
    try:
        registry = get_tool_registry()
        configs = registry.get_all_tool_configs()
        # stats = registry.get_tool_stats()  # This method doesn't exist yet

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"📊 Tool Configurations ({len(configs)} tools):\n\n"
                           f"Statistics: {stats}\n\n"
                           f"Tools: {configs}"
                }
            ]
        }
    except Exception as e:
        logger.error(f"Failed to get tool configs: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Failed to retrieve tool configurations: {e!s}"
                }
            ]
        }


@register_tool(
    name="get_tool_status",
    category="management",
    description="Get status of a specific tool or all tools",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def get_tool_status(**kwargs) -> dict[str, Any]:
    """Get status of a specific tool or all tools."""
    try:
        arguments = kwargs.get("arguments", {})
        tool_name = arguments.get("tool_name")

        if tool_name:
            # Get specific tool status
            registry = get_tool_registry()
            is_registered = registry.is_tool_registered(tool_name)
            is_enabled = registry.is_tool_enabled(tool_name)
            metadata = registry.get_tool_metadata(tool_name)

            status_text = f"🔧 Tool Status: {tool_name}\n"
            status_text += f"Registered: {'✅' if is_registered else '❌'}\n"
            status_text += f"Enabled: {'✅' if is_enabled else '❌'}\n"
            
            if metadata:
                status_text += f"Category: {metadata.category}\n"
                status_text += f"Description: {metadata.description}\n"
                status_text += f"Execution Type: {metadata.execution_type.value}\n"

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
            registry = get_tool_registry()
            all_tools = registry.get_all_tools()
            enabled_tools = [name for name in all_tools if registry.is_tool_enabled(name)]
            disabled_tools = [name for name in all_tools if not registry.is_tool_enabled(name)]

            status_text = f"📊 All Tools Status:\n\n"
            status_text += f"Total Tools: {len(all_tools)}\n"
            status_text += f"Enabled: {len(enabled_tools)}\n"
            status_text += f"Disabled: {len(disabled_tools)}\n\n"
            
            if enabled_tools:
                status_text += f"✅ Enabled Tools:\n" + "\n".join(f"• {name}" for name in enabled_tools) + "\n\n"
            
            if disabled_tools:
                status_text += f"❌ Disabled Tools:\n" + "\n".join(f"• {name}" for name in disabled_tools)

            return {
                "content": [
                    {
                        "type": "text",
                        "text": status_text
                    }
                ]
            }

    except Exception as e:
        logger.error(f"Failed to get tool status: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Failed to get tool status: {e!s}"
                }
            ]
        }


@register_tool(
    name="enable_tool",
    category="management",
    description="Enable a specific tool",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def enable_tool(**kwargs) -> dict[str, Any]:
    """Enable a specific tool."""
    try:
        arguments = kwargs.get("arguments", {})
        tool_name = arguments.get("tool_name")

        if not tool_name:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Tool name is required"
                    }
                ]
            }

        registry = get_tool_registry()
        if not registry.is_tool_registered(tool_name):
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Tool '{tool_name}' is not registered"
                    }
                ]
            }

        registry = get_tool_registry()
        success = registry.enable_tool(tool_name)
        
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
                        "text": f"❌ Failed to enable tool '{tool_name}'"
                    }
                ]
            }

    except Exception as e:
        logger.error(f"Failed to enable tool: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Failed to enable tool: {e!s}"
                }
            ]
        }


@register_tool(
    name="disable_tool",
    category="management",
    description="Disable a specific tool",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def disable_tool(**kwargs) -> dict[str, Any]:
    """Disable a specific tool."""
    try:
        arguments = kwargs.get("arguments", {})
        tool_name = arguments.get("tool_name")

        if not tool_name:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Tool name is required"
                    }
                ]
            }

        registry = get_tool_registry()
        if not registry.is_tool_registered(tool_name):
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Tool '{tool_name}' is not registered"
                    }
                ]
            }

        registry = get_tool_registry()
        success = registry.disable_tool(tool_name)
        
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
                        "text": f"❌ Failed to disable tool '{tool_name}'"
                    }
                ]
            }

    except Exception as e:
        logger.error(f"Failed to disable tool: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Failed to disable tool: {e!s}"
                }
            ]
        }


@register_tool(
    name="get_tool_metadata",
    category="management",
    description="Get metadata for a specific tool",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def get_tool_metadata(**kwargs) -> dict[str, Any]:
    """Get metadata for a specific tool."""
    try:
        arguments = kwargs.get("arguments", {})
        tool_name = arguments.get("tool_name")

        if not tool_name:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "❌ Tool name is required"
                    }
                ]
            }

        registry = get_tool_registry()
        metadata = registry.get_tool_metadata(tool_name)
        
        if metadata:
            import json
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"📋 Tool Metadata for '{tool_name}':\n\n{json.dumps(metadata.to_dict(), indent=2)}"
                    }
                ]
            }
        else:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Tool '{tool_name}' not found or has no metadata"
                    }
                ]
            }

    except Exception as e:
        logger.error(f"Failed to get tool metadata: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Failed to get tool metadata: {e!s}"
                }
            ]
        }


@register_tool(
    name="list_tools_by_category",
    category="management",
    description="List tools grouped by category",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def list_tools_by_category(**kwargs) -> dict[str, Any]:
    """List tools grouped by category."""
    try:
        registry = get_tool_registry()
        all_tools = registry.get_all_tools()
        categories = {}

        for tool_name in all_tools:
            metadata = registry.get_tool_metadata(tool_name)
            if metadata:
                category = metadata.category
                if category not in categories:
                    categories[category] = []
                categories[category].append(tool_name)
        
        result_text = "📊 Tools by Category:\n\n"
        for category, tools in categories.items():
            result_text += f"🔧 {category} ({len(tools)} tools):\n"
            for tool in tools:
                enabled = "✅" if registry.is_tool_enabled(tool) else "❌"
                result_text += f"  {enabled} {tool}\n"
            result_text += "\n"
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": result_text
                }
            ]
        }

    except Exception as e:
        logger.error(f"Failed to list tools by category: {e}")
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Failed to list tools by category: {e!s}"
                }
            ]
        }