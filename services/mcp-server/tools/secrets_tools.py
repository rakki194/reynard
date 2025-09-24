#!/usr/bin/env python3
"""
Secrets Management Tool Handlers
=================================

Handles secrets-related MCP tool calls for accessing user secrets.
Now uses the new @register_tool decorator system for automatic registration.

Follows the 140-line axiom and modular architecture principles.
"""

import logging
import os
from typing import Any

from protocol.tool_registry import register_tool

logger = logging.getLogger(__name__)

# Available secrets registry
AVAILABLE_SECRETS = {
    "GH_TOKEN": {
        "description": "GitHub Personal Access Token for GitHub CLI and API operations",
        "usage": "Used for GitHub workflows, repository operations, and API calls",
        "env_var": "GH_TOKEN",
    }
}


@register_tool(
    name="get_secret",
    category="secrets",
    description="Retrieve a user secret by name",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def get_secret(**kwargs) -> dict[str, Any]:
    """Retrieve a user secret by name."""
    arguments = kwargs.get("arguments", {})
    secret_name = arguments.get("secret_name")
    mask_output = arguments.get("mask_output", True)

    if secret_name not in AVAILABLE_SECRETS:
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Error: Secret '{secret_name}' is not available. Available secrets: {list(AVAILABLE_SECRETS.keys())}",
                }
            ]
        }

    secret_info = AVAILABLE_SECRETS[secret_name]
    env_var = secret_info["env_var"]

    # Get the secret value from environment
    secret_value = os.getenv(env_var)

    if secret_value is None:
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Error: Secret '{secret_name}' is not set in environment variable '{env_var}'",
                }
            ]
        }

    # Mask the output if requested
    if mask_output:
        masked_value = "*" * len(secret_value) if secret_value else "Not set"
        display_value = f"{masked_value} (length: {len(secret_value)})"
    else:
        display_value = secret_value

    return {
        "content": [
            {
                "type": "text",
                "text": f"Secret '{secret_name}': {display_value}\nDescription: {secret_info['description']}\nUsage: {secret_info['usage']}",
            }
        ]
    }


@register_tool(
    name="list_secrets",
    category="secrets",
    description="List all available secrets",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def list_secrets(**kwargs) -> dict[str, Any]:
    """List all available secrets."""
    secrets_list = []

    for secret_name, secret_info in AVAILABLE_SECRETS.items():
        env_var = secret_info["env_var"]
        is_set = os.getenv(env_var) is not None
        status = "✅ Set" if is_set else "❌ Not set"

        secrets_list.append(
            f"• {secret_name} ({env_var}): {status}\n"
            f"  Description: {secret_info['description']}\n"
            f"  Usage: {secret_info['usage']}"
        )

    return {
        "content": [
            {
                "type": "text",
                "text": "Available Secrets:\n\n" + "\n\n".join(secrets_list),
            }
        ]
    }


@register_tool(
    name="check_secret",
    category="secrets",
    description="Check if a secret is available and set",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def check_secret(**kwargs) -> dict[str, Any]:
    """Check if a secret is available and set."""
    arguments = kwargs.get("arguments", {})
    secret_name = arguments.get("secret_name")

    if secret_name not in AVAILABLE_SECRETS:
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Secret '{secret_name}' is not available. Available secrets: {list(AVAILABLE_SECRETS.keys())}",
                }
            ]
        }

    secret_info = AVAILABLE_SECRETS[secret_name]
    env_var = secret_info["env_var"]
    secret_value = os.getenv(env_var)

    is_set = secret_value is not None
    status = "✅ Available and set" if is_set else "❌ Not set"

    return {
        "content": [
            {
                "type": "text",
                "text": f"Secret '{secret_name}' ({env_var}): {status}\nDescription: {secret_info['description']}",
            }
        ]
    }


@register_tool(
    name="get_secret_info",
    category="secrets",
    description="Get detailed information about a secret",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def get_secret_info(**kwargs) -> dict[str, Any]:
    """Get detailed information about a secret."""
    arguments = kwargs.get("arguments", {})
    secret_name = arguments.get("secret_name")

    if secret_name not in AVAILABLE_SECRETS:
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Secret '{secret_name}' is not available. Available secrets: {list(AVAILABLE_SECRETS.keys())}",
                }
            ]
        }

    secret_info = AVAILABLE_SECRETS[secret_name]
    env_var = secret_info["env_var"]
    secret_value = os.getenv(env_var)

    is_set = secret_value is not None
    status = "✅ Set" if is_set else "❌ Not set"
    length = len(secret_value) if secret_value else 0

    return {
        "content": [
            {
                "type": "text",
                "text": f"Secret Information: {secret_name}\n"
                f"Environment Variable: {env_var}\n"
                f"Status: {status}\n"
                f"Length: {length} characters\n"
                f"Description: {secret_info['description']}\n"
                f"Usage: {secret_info['usage']}",
            }
        ]
    }
