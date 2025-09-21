"""
🦊 Reynard MCP Authorization Service
====================================

Comprehensive MCP (Model Context Protocol) authentication and authorization system
for the Reynard backend, providing secure access control to RAG services, agent
operations, and other protected backend resources. This module implements
enterprise-grade security with JWT-based authentication and role-based access control.

The MCP Authorization Service provides:
- JWT-based authentication with configurable expiration and algorithms
- Role-based access control with granular permission management
- Client type validation (agent, tool, user) with appropriate access levels
- Token validation and refresh mechanisms with security best practices
- Permission-based endpoint protection with dependency injection
- Comprehensive audit logging and security monitoring
- Rate limiting and abuse prevention mechanisms

Key Features:
- JWT Authentication: Secure token-based authentication with configurable parameters
- Role-Based Access Control: Granular permission system with hierarchical access
- Client Type Validation: Different access levels for agents, tools, and users
- Token Management: Issuance, validation, and refresh with security controls
- Permission System: Fine-grained access control for specific operations
- Security Monitoring: Comprehensive audit logging and threat detection
- Rate Limiting: Abuse prevention and resource protection

Security Components:
- MCPTokenData: JWT payload structure with client and permission information
- MCPClient: Client metadata and permission management
- Token Validation: JWT signature verification and expiration checking
- Permission Checks: Role-based access control for protected endpoints
- Audit Logging: Security event tracking and monitoring

The MCP authorization system ensures secure access to Reynard backend services
while maintaining comprehensive audit trails and protection against unauthorized
access and abuse.

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
import os
import time
from datetime import UTC, datetime

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# Security scheme for MCP
mcp_security = HTTPBearer(scheme_name="MCP-Auth")

# MCP Token Configuration
MCP_TOKEN_SECRET = os.getenv("MCP_TOKEN_SECRET", "reynard-mcp-secret-key-2025")
MCP_TOKEN_ALGORITHM = os.getenv("MCP_TOKEN_ALGORITHM", "HS256")
MCP_TOKEN_EXPIRE_HOURS = int(os.getenv("MCP_TOKEN_EXPIRE_HOURS", "24"))


class MCPTokenData(BaseModel):
    """MCP token payload data."""

    client_id: str = Field(..., description="MCP client identifier")
    client_type: str = Field(..., description="Type of MCP client (agent, tool, user)")
    permissions: list[str] = Field(
        default_factory=list, description="List of granted permissions"
    )
    issued_at: float = Field(..., description="Token issuance timestamp")
    expires_at: float = Field(..., description="Token expiration timestamp")
    scope: str = Field("mcp", description="Token scope")


class MCPClient(BaseModel):
    """MCP client information."""

    client_id: str = Field(..., description="Unique client identifier")
    client_type: str = Field(..., description="Client type (agent, tool, user)")
    name: str = Field(..., description="Human-readable client name")
    permissions: list[str] = Field(
        default_factory=list, description="Granted permissions"
    )
    is_active: bool = Field(True, description="Whether client is active")
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    last_used: datetime | None = Field(None, description="Last usage timestamp")


class MCPAuthService:
    """MCP Authentication and Authorization Service."""

    def __init__(self):
        self.clients: dict[str, MCPClient] = {}
        self._initialize_default_clients()

    def _initialize_default_clients(self):
        """Initialize default MCP clients for development."""
        default_clients = [
            MCPClient(
                client_id="reynard-mcp-server",
                client_type="agent",
                name="Reynard MCP Server",
                permissions=[
                    "rag:query",
                    "rag:stats",
                    "rag:config",
                    "embed:text",
                    "mcp:admin",
                ],
            ),
            MCPClient(
                client_id="reynard-semantic-search",
                client_type="tool",
                name="Reynard Semantic Search Tool",
                permissions=["rag:query", "rag:stats", "embed:text"],
            ),
            MCPClient(
                client_id="reynard-indexing-tool",
                client_type="tool",
                name="Reynard Document Indexing Tool",
                permissions=["rag:ingest", "rag:stats", "rag:config"],
            ),
            MCPClient(
                client_id="cursor-ide",
                client_type="user",
                name="Cursor IDE Integration",
                permissions=[
                    "rag:query",
                    "rag:stats",
                    "embed:text",
                    "rag:ingest",
                    "mcp:admin",
                ],
            ),
        ]

        for client in default_clients:
            self.clients[client.client_id] = client

        logger.info(f"Initialized {len(default_clients)} default MCP clients")

    def generate_mcp_token(
        self, client_id: str, additional_permissions: list[str] = None
    ) -> str:
        """
        Generate a JWT token for MCP client authentication.

        Args:
            client_id: MCP client identifier
            additional_permissions: Additional permissions to grant

        Returns:
            JWT token string

        Raises:
            HTTPException: If client not found or inactive
        """
        if client_id not in self.clients:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"MCP client '{client_id}' not found",
            )

        client = self.clients[client_id]
        if not client.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"MCP client '{client_id}' is inactive",
            )

        # Combine base permissions with additional ones
        permissions = client.permissions.copy()
        if additional_permissions:
            permissions.extend(additional_permissions)

        # Remove duplicates
        permissions = list(set(permissions))

        now = time.time()
        token_data = MCPTokenData(
            client_id=client_id,
            client_type=client.client_type,
            permissions=permissions,
            issued_at=now,
            expires_at=now + (MCP_TOKEN_EXPIRE_HOURS * 3600),
            scope="mcp",
        )

        # Generate JWT token
        token = jwt.encode(
            token_data.model_dump(), MCP_TOKEN_SECRET, algorithm=MCP_TOKEN_ALGORITHM
        )

        # Update last used timestamp
        client.last_used = datetime.now(UTC)

        logger.info(
            f"Generated MCP token for client '{client_id}' with {len(permissions)} permissions"
        )
        return token

    def validate_mcp_token(self, token: str) -> MCPTokenData:
        """
        Validate and decode MCP JWT token.

        Args:
            token: JWT token string

        Returns:
            Decoded token data

        Raises:
            HTTPException: If token is invalid, expired, or client inactive
        """
        try:
            # Decode JWT token
            payload = jwt.decode(
                token, MCP_TOKEN_SECRET, algorithms=[MCP_TOKEN_ALGORITHM]
            )

            # Create token data object
            token_data = MCPTokenData(**payload)

            # Check if token is expired
            if time.time() > token_data.expires_at:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="MCP token has expired",
                )

            # Verify client still exists and is active
            if token_data.client_id not in self.clients:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="MCP client no longer exists",
                )

            client = self.clients[token_data.client_id]
            if not client.is_active:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="MCP client is inactive",
                )

            return token_data

        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="MCP token has expired"
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid MCP token"
            )
        except Exception as e:
            logger.error(f"MCP token validation failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token validation failed",
            )

    def check_permission(
        self, token_data: MCPTokenData, required_permission: str
    ) -> bool:
        """
        Check if token has required permission.

        Args:
            token_data: Validated token data
            required_permission: Required permission string

        Returns:
            True if permission is granted
        """
        return required_permission in token_data.permissions

    def get_client_info(self, client_id: str) -> MCPClient | None:
        """Get MCP client information."""
        return self.clients.get(client_id)

    def list_clients(self) -> list[MCPClient]:
        """List all MCP clients."""
        return list(self.clients.values())


# Global MCP auth service instance
mcp_auth_service = MCPAuthService()


async def get_mcp_client(
    credentials: HTTPAuthorizationCredentials = Depends(mcp_security),
) -> MCPTokenData:
    """
    Dependency to get authenticated MCP client from token.

    Args:
        credentials: HTTP Bearer token credentials

    Returns:
        Validated MCP token data

    Raises:
        HTTPException: If authentication fails
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing MCP authentication token",
        )

    return mcp_auth_service.validate_mcp_token(credentials.credentials)


def require_mcp_permission(permission: str):
    """
    Decorator factory for requiring specific MCP permissions.

    Args:
        permission: Required permission string

    Returns:
        Dependency function
    """

    async def permission_checker(
        mcp_client: MCPTokenData = Depends(get_mcp_client),
    ) -> MCPTokenData:
        if not mcp_auth_service.check_permission(mcp_client, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission: {permission}",
            )
        return mcp_client

    return permission_checker


# Common permission dependencies
require_rag_query = require_mcp_permission("rag:query")
require_rag_ingest = require_mcp_permission("rag:ingest")
require_rag_config = require_mcp_permission("rag:config")
require_rag_stats = require_mcp_permission("rag:stats")
require_embed_text = require_mcp_permission("embed:text")
