"""
Authentication Service for MCP Server

This service provides authentication and authorization for MCP server access,
integrating with the FastAPI backend's authentication system.
"""

import logging
import os
import time
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

import jwt

logger = logging.getLogger(__name__)

# MCP Authentication Configuration
MCP_JWT_SECRET = os.getenv(
    "MCP_TOKEN_SECRET", "reynard-mcp-secret-key-2025-dev"
)  # Use env var in production
MCP_JWT_ALGORITHM = "HS256"
MCP_TOKEN_EXPIRE_HOURS = 24

# Default MCP client permissions
DEFAULT_MCP_PERMISSIONS = ["mcp:tools:read", "mcp:tools:execute", "mcp:config:read"]

ADMIN_MCP_PERMISSIONS = [
    "mcp:tools:read",
    "mcp:tools:execute",
    "mcp:tools:manage",
    "mcp:config:read",
    "mcp:config:write",
    "mcp:admin",
]


class MCPAuthService:
    """Service for MCP authentication and authorization."""

    def __init__(self):
        """Initialize the MCP authentication service."""
        self.secret_key = MCP_JWT_SECRET
        self.algorithm = MCP_JWT_ALGORITHM
        self.token_expire_hours = MCP_TOKEN_EXPIRE_HOURS

    def generate_mcp_token(
        self, client_id: str, permissions: Optional[List[str]] = None
    ) -> str:
        """
        Generate a JWT token for MCP access.

        Args:
            client_id: Unique identifier for the MCP client
            permissions: List of permissions to grant (defaults to basic permissions)

        Returns:
            JWT token string
        """
        try:
            if permissions is None:
                permissions = DEFAULT_MCP_PERMISSIONS.copy()

            # Set expiration time
            expire = datetime.now(timezone.utc) + timedelta(
                hours=self.token_expire_hours
            )

            # Create token payload
            payload = {
                "client_id": client_id,
                "permissions": permissions,
                "exp": expire.timestamp(),
                "iat": time.time(),
                "iss": "reynard-mcp-server",
                "aud": "reynard-backend",
            }

            # Generate token
            token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

            logger.info(f"Generated MCP token for client: {client_id}")
            return token

        except Exception as e:
            logger.error(f"Failed to generate MCP token for {client_id}: {e}")
            raise

    def validate_mcp_token(self, token: str) -> Dict[str, Any]:
        """
        Validate a MCP JWT token.

        Args:
            token: JWT token to validate

        Returns:
            Token payload if valid

        Raises:
            Exception: If token is invalid or expired
        """
        try:
            # Decode and validate token
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                audience="reynard-backend",
                issuer="reynard-mcp-server",
            )

            # Check expiration
            if payload.get("exp", 0) < time.time():
                raise Exception("Token has expired")

            logger.debug(f"Validated MCP token for client: {payload.get('client_id')}")
            return payload

        except jwt.ExpiredSignatureError:
            raise Exception("Token has expired")
        except jwt.InvalidTokenError as e:
            raise Exception(f"Invalid token: {e}")
        except Exception as e:
            logger.error(f"Failed to validate MCP token: {e}")
            raise

    def has_permission(
        self, token_payload: Dict[str, Any], required_permission: str
    ) -> bool:
        """
        Check if a token has a specific permission.

        Args:
            token_payload: Decoded token payload
            required_permission: Permission to check for

        Returns:
            True if permission is granted
        """
        permissions = token_payload.get("permissions", [])
        return required_permission in permissions

    def is_admin(self, token_payload: Dict[str, Any]) -> bool:
        """
        Check if a token has admin permissions.

        Args:
            token_payload: Decoded token payload

        Returns:
            True if admin permissions are granted
        """
        return self.has_permission(token_payload, "mcp:admin")

    def can_manage_tools(self, token_payload: Dict[str, Any]) -> bool:
        """
        Check if a token can manage tools.

        Args:
            token_payload: Decoded token payload

        Returns:
            True if tool management permissions are granted
        """
        return self.has_permission(token_payload, "mcp:tools:manage") or self.is_admin(
            token_payload
        )

    def can_execute_tools(self, token_payload: Dict[str, Any]) -> bool:
        """
        Check if a token can execute tools.

        Args:
            token_payload: Decoded token payload

        Returns:
            True if tool execution permissions are granted
        """
        return self.has_permission(
            token_payload, "mcp:tools:execute"
        ) or self.can_manage_tools(token_payload)

    def can_read_config(self, token_payload: Dict[str, Any]) -> bool:
        """
        Check if a token can read configuration.

        Args:
            token_payload: Decoded token payload

        Returns:
            True if config read permissions are granted
        """
        return self.has_permission(
            token_payload, "mcp:config:read"
        ) or self.can_manage_tools(token_payload)

    def can_write_config(self, token_payload: Dict[str, Any]) -> bool:
        """
        Check if a token can write configuration.

        Args:
            token_payload: Decoded token payload

        Returns:
            True if config write permissions are granted
        """
        return self.has_permission(token_payload, "mcp:config:write") or self.is_admin(
            token_payload
        )


# Global instance
mcp_auth_service = MCPAuthService()
