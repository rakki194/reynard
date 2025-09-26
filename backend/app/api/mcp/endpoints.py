"""MCP Management Endpoints for Reynard Backend

Endpoints for MCP client management and token generation.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from ...security.mcp_auth import (
    MCPTokenData,
    get_mcp_client,
    mcp_auth_service,
    require_mcp_permission,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mcp", tags=["mcp"])

# Permission constants
MCP_ADMIN_PERMISSION = "mcp:admin"


def _raise_client_not_found() -> None:
    """Raise HTTP 404 for client not found."""
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Client not found",
    )


class MCPTokenRequest(BaseModel):
    """Request model for MCP token generation."""

    client_id: str = Field(..., description="MCP client identifier")
    additional_permissions: list[str] = Field(
        default_factory=list,
        description="Additional permissions",
    )


class MCPTokenResponse(BaseModel):
    """Response model for MCP token generation."""

    token: str = Field(..., description="Generated JWT token")
    client_id: str = Field(..., description="Client identifier")
    permissions: list[str] = Field(..., description="Granted permissions")
    expires_at: float = Field(..., description="Token expiration timestamp")


class MCPClientResponse(BaseModel):
    """Response model for MCP client information."""

    client_id: str = Field(..., description="Client identifier")
    client_type: str = Field(..., description="Client type")
    name: str = Field(..., description="Client name")
    permissions: list[str] = Field(..., description="Granted permissions")
    is_active: bool = Field(..., description="Whether client is active")
    created_at: str = Field(..., description="Creation timestamp")
    last_used: str | None = Field(None, description="Last usage timestamp")


class MCPStatsResponse(BaseModel):
    """Response model for MCP system statistics."""

    total_clients: int = Field(..., description="Total number of clients")
    active_clients: int = Field(..., description="Number of active clients")
    client_types: dict[str, int] = Field(..., description="Count by client type")
    permissions: list[str] = Field(..., description="All available permissions")


@router.post("/token", response_model=MCPTokenResponse)
async def generate_mcp_token(
    request: MCPTokenRequest,
    _current_client: MCPTokenData = Depends(
        require_mcp_permission(MCP_ADMIN_PERMISSION),
    ),
) -> MCPTokenResponse:
    """Generate a new MCP token for a client.

    Requires mcp:admin permission.
    """
    try:
        token = mcp_auth_service.generate_mcp_token(
            client_id=request.client_id,
            additional_permissions=request.additional_permissions,
        )

        # Get client info for response
        client = mcp_auth_service.get_client_info(request.client_id)
        if not client:
            _raise_client_not_found()

        # Get token data to extract expiration
        token_data = mcp_auth_service.validate_mcp_token(token)

        return MCPTokenResponse(
            token=token,
            client_id=request.client_id,
            permissions=token_data.permissions,
            expires_at=token_data.expires_at,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to generate MCP token")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate MCP token: {e!s}",
        ) from e


@router.get("/clients", response_model=list[MCPClientResponse])
async def list_mcp_clients(
    current_client: MCPTokenData = Depends(
        require_mcp_permission(MCP_ADMIN_PERMISSION),
    ),
):
    """List all MCP clients.

    Requires mcp:admin permission.
    """
    try:
        clients = mcp_auth_service.list_clients()

        return [
            MCPClientResponse(
                client_id=client.client_id,
                client_type=client.client_type,
                name=client.name,
                permissions=client.permissions,
                is_active=client.is_active,
                created_at=client.created_at.isoformat(),
                last_used=client.last_used.isoformat() if client.last_used else None,
            )
            for client in clients
        ]

    except Exception as e:
        logger.exception("Failed to list MCP clients")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list MCP clients: {e!s}",
        ) from e


@router.get("/client/{client_id}", response_model=MCPClientResponse)
async def get_mcp_client_info(
    client_id: str,
    current_client: MCPTokenData = Depends(
        require_mcp_permission(MCP_ADMIN_PERMISSION),
    ),
):
    """Get information about a specific MCP client.

    Requires mcp:admin permission.
    """
    try:
        client = mcp_auth_service.get_client_info(client_id)
        if not client:
            _raise_client_not_found()

        return MCPClientResponse(
            client_id=client.client_id,
            client_type=client.client_type,
            name=client.name,
            permissions=client.permissions,
            is_active=client.is_active,
            created_at=client.created_at.isoformat(),
            last_used=client.last_used.isoformat() if client.last_used else None,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to get MCP client info")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get MCP client info: {e!s}",
        ) from e


@router.get("/stats", response_model=MCPStatsResponse)
async def get_mcp_stats(
    current_client: MCPTokenData = Depends(
        require_mcp_permission(MCP_ADMIN_PERMISSION),
    ),
):
    """Get MCP system statistics.

    Requires mcp:admin permission.
    """
    try:
        clients = mcp_auth_service.list_clients()

        # Calculate statistics
        total_clients = len(clients)
        active_clients = sum(1 for client in clients if client.is_active)

        # Count by client type
        client_types = {}
        for client in clients:
            client_types[client.client_type] = (
                client_types.get(client.client_type, 0) + 1
            )

        # Get all unique permissions
        all_permissions = set()
        for client in clients:
            all_permissions.update(client.permissions)

        return MCPStatsResponse(
            total_clients=total_clients,
            active_clients=active_clients,
            client_types=client_types,
            permissions=sorted(list(all_permissions)),
        )

    except Exception as e:
        logger.exception("Failed to get MCP stats")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get MCP stats: {e!s}",
        ) from e


@router.get("/validate")
async def validate_mcp_token(current_client: MCPTokenData = Depends(get_mcp_client)):
    """Validate current MCP token and return client information.

    No special permissions required - just valid token.
    """
    try:
        client = mcp_auth_service.get_client_info(current_client.client_id)
        if not client:
            _raise_client_not_found()

        return {
            "valid": True,
            "client_id": current_client.client_id,
            "client_type": current_client.client_type,
            "permissions": current_client.permissions,
            "expires_at": current_client.expires_at,
            "client_name": client.name,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to validate MCP token")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to validate MCP token: {e!s}",
        ) from e
