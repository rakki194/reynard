#!/usr/bin/env python3
"""
Secrets Management Tool Handlers
=================================

Handles secrets-related MCP tool calls for accessing user secrets.
Follows the 140-line axiom and modular architecture principles.
"""

import logging
import os
from typing import Any

logger = logging.getLogger(__name__)


class SecretsTools:
    """Handles secrets-related tool operations."""

    def __init__(self):
        """Initialize secrets tools with available secrets registry."""
        self.available_secrets = {
            "GH_TOKEN": {
                "description": "GitHub Personal Access Token for GitHub CLI and API operations",
                "usage": "Used for GitHub workflows, repository operations, and API calls",
                "env_var": "GH_TOKEN"
            }
        }

    def get_secret(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Retrieve a user secret by name."""
        secret_name = arguments.get("secret_name")
        mask_output = arguments.get("mask_output", True)

        if secret_name not in self.available_secrets:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error: Secret '{secret_name}' is not available. Available secrets: {list(self.available_secrets.keys())}"
                    }
                ]
            }

        secret_info = self.available_secrets[secret_name]
        env_var = secret_info["env_var"]

        # Get the secret value from environment
        secret_value = os.getenv(env_var)

        if not secret_value:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error: Secret '{secret_name}' is not set in environment variable '{env_var}'"
                    }
                ]
            }

        # Format the response
        if mask_output:
            masked_value = secret_value[:8] + "*" * (len(secret_value) - 8) if len(secret_value) > 8 else "*" * len(secret_value)
            response_text = f"Secret '{secret_name}' is available and configured (masked: {masked_value})"
        else:
            response_text = f"Secret '{secret_name}': {secret_value}"

        return {
            "content": [
                {
                    "type": "text",
                    "text": response_text
                }
            ]
        }

    def list_available_secrets(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """List all available secrets that agents can access."""
        include_descriptions = arguments.get("include_descriptions", True)

        if not include_descriptions:
            secret_names = list(self.available_secrets.keys())
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Available secrets: {', '.join(secret_names)}"
                    }
                ]
            }

        # Build detailed list with descriptions
        response_lines = ["Available secrets:"]
        for secret_name, secret_info in self.available_secrets.items():
            env_var = secret_info["env_var"]
            description = secret_info["description"]
            usage = secret_info["usage"]

            # Check if secret is actually set
            is_set = bool(os.getenv(env_var))
            status = "✓ Set" if is_set else "✗ Not set"

            response_lines.append(f"\n• {secret_name} ({status})")
            response_lines.append(f"  Description: {description}")
            response_lines.append(f"  Usage: {usage}")
            response_lines.append(f"  Environment variable: {env_var}")

        return {
            "content": [
                {
                    "type": "text",
                    "text": "\n".join(response_lines)
                }
            ]
        }

    def validate_secret(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Validate that a secret is properly configured and accessible."""
        secret_name = arguments.get("secret_name")

        if secret_name not in self.available_secrets:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error: Secret '{secret_name}' is not available. Available secrets: {list(self.available_secrets.keys())}"
                    }
                ]
            }

        secret_info = self.available_secrets[secret_name]
        env_var = secret_info["env_var"]
        secret_value = os.getenv(env_var)

        if not secret_value:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Validation failed: Secret '{secret_name}' is not set in environment variable '{env_var}'"
                    }
                ]
            }

        # Basic validation - check if it looks like a valid token
        validation_checks = []

        if secret_name == "GH_TOKEN":
            # GitHub tokens are typically 40 characters (classic) or start with ghp_ (fine-grained)
            if len(secret_value) == 40 and secret_value.isalnum():
                validation_checks.append("✓ Format appears to be a classic GitHub token")
            elif secret_value.startswith("ghp_"):
                validation_checks.append("✓ Format appears to be a fine-grained GitHub token")
            elif len(secret_value) >= 40:
                validation_checks.append("✓ Format appears to be a valid GitHub token")
            else:
                validation_checks.append("⚠ Format doesn't match expected GitHub token patterns")

        validation_result = f"Secret '{secret_name}' validation:\n" + "\n".join(validation_checks)

        return {
            "content": [
                {
                    "type": "text",
                    "text": validation_result
                }
            ]
        }
