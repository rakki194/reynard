#!/usr/bin/env python3
"""
VS Code Tasks Tool Definitions
==============================

Defines all VS Code task-related MCP tools and their schemas.
Follows the 100-line axiom and modular architecture principles.
"""

from typing import Any

# Constants
WORKSPACE_PATH_DESCRIPTION = (
    "Path to the VS Code workspace (optional, defaults to current directory)"
)


def get_vscode_tasks_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get all VS Code tasks tool definitions."""
    return {
        "discover_vscode_tasks": {
            "name": "discover_vscode_tasks",
            "description": "Discover all available VS Code tasks from tasks.json",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "workspace_path": {
                        "type": "string",
                        "description": WORKSPACE_PATH_DESCRIPTION,
                        "default": ".",
                    },
                },
            },
        },
        "validate_vscode_task": {
            "name": "validate_vscode_task",
            "description": "Validate that a VS Code task exists and is executable",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "task_name": {
                        "type": "string",
                        "description": "Name of the VS Code task to validate",
                    },
                    "workspace_path": {
                        "type": "string",
                        "description": WORKSPACE_PATH_DESCRIPTION,
                        "default": ".",
                    },
                },
                "required": ["task_name"],
            },
        },
        "execute_vscode_task": {
            "name": "execute_vscode_task",
            "description": "Execute a VS Code task by name",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "task_name": {
                        "type": "string",
                        "description": "Name of the VS Code task to execute",
                    },
                    "workspace_path": {
                        "type": "string",
                        "description": WORKSPACE_PATH_DESCRIPTION,
                        "default": ".",
                    },
                },
                "required": ["task_name"],
            },
        },
        "get_vscode_task_info": {
            "name": "get_vscode_task_info",
            "description": "Get detailed information about a specific VS Code task",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "task_name": {
                        "type": "string",
                        "description": "Name of the VS Code task to get info for",
                    },
                    "workspace_path": {
                        "type": "string",
                        "description": WORKSPACE_PATH_DESCRIPTION,
                        "default": ".",
                    },
                },
                "required": ["task_name"],
            },
        },
    }
