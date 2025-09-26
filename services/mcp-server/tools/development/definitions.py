#!/usr/bin/env python3
"""
Development Tool Definitions
============================

Combined definitions for all development-related MCP tools.
Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any

from .git.git_automation_definitions import GIT_AUTOMATION_TOOL_DEFINITIONS
from .ide.version_vscode_definitions import get_version_vscode_tool_definitions
from .ide.vscode_tasks_definitions import get_vscode_tasks_tool_definitions


def get_linting_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get linting tool definitions."""
    return {
        "lint_frontend": {
            "name": "lint_frontend",
            "description": "Lint frontend code with ESLint",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "fix": {
                        "type": "boolean",
                        "description": "Whether to automatically fix issues where possible",
                        "default": False,
                    }
                },
            },
        },
        "format_frontend": {
            "name": "format_frontend",
            "description": "Format frontend code with Prettier",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "check_only": {
                        "type": "boolean",
                        "description": "Only check formatting without making changes",
                        "default": False,
                    }
                },
            },
        },
        "lint_python": {
            "name": "lint_python",
            "description": "Lint Python code with Flake8 and related tools",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "fix": {
                        "type": "boolean",
                        "description": "Whether to automatically fix issues where possible",
                        "default": False,
                    }
                },
            },
        },
        "format_python": {
            "name": "format_python",
            "description": "Format Python code with Black and isort",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "check_only": {
                        "type": "boolean",
                        "description": "Only check formatting without making changes",
                        "default": False,
                    }
                },
            },
        },
        "lint_markdown": {
            "name": "lint_markdown",
            "description": "Lint Markdown files with markdownlint",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "fix": {
                        "type": "boolean",
                        "description": "Whether to automatically fix issues where possible",
                        "default": False,
                    }
                },
            },
        },
        "validate_comprehensive": {
            "name": "validate_comprehensive",
            "description": "Run comprehensive validation across all components",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "fix": {
                        "type": "boolean",
                        "description": "Whether to automatically fix issues where possible",
                        "default": False,
                    }
                },
            },
        },
        "scan_security": {
            "name": "scan_security",
            "description": "Run comprehensive security scanning and auditing",
            "inputSchema": {"type": "object", "properties": {}},
        },
        "run_all_linting": {
            "name": "run_all_linting",
            "description": "Run all linting tools comprehensively across the project",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "fix": {
                        "type": "boolean",
                        "description": "Whether to automatically fix issues where possible",
                        "default": False,
                    }
                },
            },
        },
    }


def get_development_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get all development tool definitions."""
    # Combine all development tool definitions
    definitions = {}

    # Add linting tools
    definitions.update(get_linting_tool_definitions())

    # Add version and VS Code tools
    definitions.update(get_version_vscode_tool_definitions())
    definitions.update(get_vscode_tasks_tool_definitions())

    # Add git automation tools
    for tool_def in GIT_AUTOMATION_TOOL_DEFINITIONS:
        definitions[tool_def.name] = tool_def.to_dict()

    return definitions
