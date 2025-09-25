#!/usr/bin/env python3
"""
Tool Configuration Definitions
==============================

MCP tool definitions for tool configuration management.
Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any


def get_config_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get tool configuration management tool definitions."""
    return {
        "get_tool_configs": {
            "name": "get_tool_configs",
            "description": "Get all tool configurations, optionally filtered by category",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "enum": [
                            "agent",
                            "ecs",
                            "linting",
                            "formatting",
                            "search",
                            "visualization",
                            "security",
                            "utility",
                            "version",
                            "vscode",
                            "playwright",
                            "monolith",
                        ],
                        "description": "Optional category filter for tools",
                    }
                },
            },
        },
        "enable_tool": {
            "name": "enable_tool",
            "description": "Enable a specific MCP tool",
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
            "description": "Disable a specific MCP tool",
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
        "toggle_tool": {
            "name": "toggle_tool",
            "description": "Toggle a tool's enabled state",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "tool_name": {
                        "type": "string",
                        "description": "Name of the tool to toggle",
                    }
                },
                "required": ["tool_name"],
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
        "reload_config": {
            "name": "reload_config",
            "description": "Reload tool configuration from file",
            "inputSchema": {"type": "object", "properties": {}},
        },
    }
