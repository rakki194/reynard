#!/usr/bin/env python3
"""
Enhanced Tool Definitions
=========================

Defines enhanced MCP tools including version detection and VS Code integration.
Follows the 100-line axiom and modular architecture principles.
"""

from typing import Any


def get_version_vscode_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get version and VS Code MCP tool definitions."""

    return {
        "get_versions": {
            "name": "get_versions",
            "description": "Get versions of Python, Node.js, npm, pnpm, and TypeScript",
            "inputSchema": {"type": "object", "properties": {}},
        },
        "get_python_version": {
            "name": "get_python_version",
            "description": "Get Python version information",
            "inputSchema": {"type": "object", "properties": {}},
        },
        "get_node_version": {
            "name": "get_node_version",
            "description": "Get Node.js version information",
            "inputSchema": {"type": "object", "properties": {}},
        },
        "get_typescript_version": {
            "name": "get_typescript_version",
            "description": "Get TypeScript version information",
            "inputSchema": {"type": "object", "properties": {}},
        },
        "get_vscode_active_file": {
            "name": "get_vscode_active_file",
            "description": "Get currently active file path in VS Code",
            "inputSchema": {"type": "object", "properties": {}},
        },
        "get_vscode_workspace_info": {
            "name": "get_vscode_workspace_info",
            "description": "Get VS Code workspace information and settings",
            "inputSchema": {"type": "object", "properties": {}},
        },
        "get_vscode_extensions": {
            "name": "get_vscode_extensions",
            "description": "Get list of installed VS Code extensions",
            "inputSchema": {"type": "object", "properties": {}},
        },
        "scan_security_fast": {
            "name": "scan_security_fast",
            "description": "Run fast security scanning (skips slow Bandit checks)",
            "inputSchema": {"type": "object", "properties": {}},
        },
        "scan_security_full": {
            "name": "scan_security_full",
            "description": "Run comprehensive security scanning including Bandit",
            "inputSchema": {"type": "object", "properties": {}},
        },
    }
