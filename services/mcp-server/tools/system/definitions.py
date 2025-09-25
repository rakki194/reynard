#!/usr/bin/env python3
"""
System Tool Definitions
=======================

Combined definitions for all system-related MCP tools.
Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any

from .configuration.config_definitions import get_config_tool_definitions
from .security.secrets_definitions import get_secrets_tool_definitions


def get_utility_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get utility tool definitions."""
    return {
        "get_current_time": {
            "name": "get_current_time",
            "description": "Get current date and time with timezone support",
            "inputSchema": {"type": "object", "properties": {}},
        },
        "get_current_location": {
            "name": "get_current_location",
            "description": "Get location based on IP address",
            "inputSchema": {"type": "object", "properties": {}},
        },
        "send_desktop_notification": {
            "name": "send_desktop_notification",
            "description": "Send desktop notifications using libnotify",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Notification title",
                    },
                    "message": {
                        "type": "string",
                        "description": "Notification message",
                    },
                    "urgency": {
                        "type": "string",
                        "enum": ["low", "normal", "critical"],
                        "description": "Notification urgency level",
                        "default": "normal",
                    },
                },
                "required": ["title", "message"],
            },
        },
    }


def get_management_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get tool management definitions."""
    return {
        "get_tool_configs": {
            "name": "get_tool_configs",
            "description": "Get all tool configurations and statistics",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "description": "Optional category filter for tools",
                    }
                },
            },
        },
        "get_tool_status": {
            "name": "get_tool_status",
            "description": "Get status of a specific tool or all tools",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "tool_name": {
                        "type": "string",
                        "description": "Optional name of specific tool to check status",
                    }
                },
            },
        },
        "enable_tool": {
            "name": "enable_tool",
            "description": "Enable a specific tool",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "tool_name": {
                        "type": "string",
                        "description": "Name of the tool to enable",
                    }
                },
                "required": ["tool_name"],
            },
        },
        "disable_tool": {
            "name": "disable_tool",
            "description": "Disable a specific tool",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "tool_name": {
                        "type": "string",
                        "description": "Name of the tool to disable",
                    }
                },
                "required": ["tool_name"],
            },
        },
        "get_tool_metadata": {
            "name": "get_tool_metadata",
            "description": "Get metadata for a specific tool",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "tool_name": {
                        "type": "string",
                        "description": "Name of the tool to get metadata for",
                    }
                },
                "required": ["tool_name"],
            },
        },
        "list_tools_by_category": {
            "name": "list_tools_by_category",
            "description": "List tools grouped by category",
            "inputSchema": {"type": "object", "properties": {}},
        },
    }


def get_system_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get all system tool definitions."""
    definitions = {}
    
    # Add utility tools
    definitions.update(get_utility_tool_definitions())
    
    # Add secrets tools
    definitions.update(get_secrets_tool_definitions())
    
    # Add config tools
    definitions.update(get_config_tool_definitions())
    
    # Add management tools
    definitions.update(get_management_tool_definitions())
    
    return definitions
