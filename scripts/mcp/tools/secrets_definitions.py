#!/usr/bin/env python3
"""
Secrets Management Tool Definitions
===================================

Defines MCP tools for managing and accessing user secrets.
Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any


def get_secrets_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get secrets management tool definitions."""
    return {
        "get_secret": {
            "name": "get_secret",
            "description": "Retrieve a user secret by name (e.g., GH_TOKEN for GitHub operations)",
            "parameters": {
                "type": "object",
                "properties": {
                    "secret_name": {
                        "type": "string",
                        "description": "Name of the secret to retrieve (e.g., 'GH_TOKEN')",
                        "enum": ["GH_TOKEN"]
                    },
                    "mask_output": {
                        "type": "boolean",
                        "description": "Whether to mask the secret value in output (default: true)",
                        "default": True
                    }
                },
                "required": ["secret_name"]
            }
        },
        "list_available_secrets": {
            "name": "list_available_secrets",
            "description": "List all available secrets that agents can access",
            "parameters": {
                "type": "object",
                "properties": {
                    "include_descriptions": {
                        "type": "boolean",
                        "description": "Whether to include descriptions of what each secret is used for",
                        "default": True
                    }
                },
                "required": []
            }
        },
        "validate_secret": {
            "name": "validate_secret",
            "description": "Validate that a secret is properly configured and accessible",
            "parameters": {
                "type": "object",
                "properties": {
                    "secret_name": {
                        "type": "string",
                        "description": "Name of the secret to validate",
                        "enum": ["GH_TOKEN"]
                    }
                },
                "required": ["secret_name"]
            }
        }
    }
