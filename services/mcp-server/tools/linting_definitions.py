#!/usr/bin/env python3
"""
Linting Tool Definitions
========================

Defines linting and formatting MCP tools and their schemas.
Follows the 100-line axiom and modular architecture principles.
"""

from typing import Any


def get_linting_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get all linting and formatting MCP tool definitions."""

    # Common schema components
    fix_schema = {
        "type": "boolean",
        "description": "Whether to automatically fix issues where possible",
        "default": False,
    }

    check_only_schema = {
        "type": "boolean",
        "description": "Only check formatting without making changes",
        "default": False,
    }

    return {
        "lint_frontend": {
            "name": "lint_frontend",
            "description": "Lint frontend code with ESLint",
            "inputSchema": {"type": "object", "properties": {"fix": fix_schema}},
        },
        "format_frontend": {
            "name": "format_frontend",
            "description": "Format frontend code with Prettier",
            "inputSchema": {
                "type": "object",
                "properties": {"check_only": check_only_schema},
            },
        },
        "lint_python": {
            "name": "lint_python",
            "description": "Lint Python code with Flake8 and related tools",
            "inputSchema": {"type": "object", "properties": {"fix": fix_schema}},
        },
        "format_python": {
            "name": "format_python",
            "description": "Format Python code with Black and isort",
            "inputSchema": {
                "type": "object",
                "properties": {"check_only": check_only_schema},
            },
        },
        "lint_markdown": {
            "name": "lint_markdown",
            "description": "Lint Markdown files with markdownlint",
            "inputSchema": {"type": "object", "properties": {"fix": fix_schema}},
        },
        "validate_comprehensive": {
            "name": "validate_comprehensive",
            "description": "Run comprehensive validation across all components",
            "inputSchema": {"type": "object", "properties": {"fix": fix_schema}},
        },
        "scan_security": {
            "name": "scan_security",
            "description": "Run comprehensive security scanning and auditing",
            "inputSchema": {"type": "object", "properties": {}},
        },
        "run_all_linting": {
            "name": "run_all_linting",
            "description": "Run all linting tools comprehensively across the project",
            "inputSchema": {"type": "object", "properties": {"fix": fix_schema}},
        },
    }
