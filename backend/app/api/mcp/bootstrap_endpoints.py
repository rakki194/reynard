"""MCP Bootstrap Endpoints for Reynard Backend

Bootstrap endpoints for initial MCP authentication without requiring
existing authentication. These endpoints are used for the initial
authentication setup and should be secured appropriately.
"""

import logging
import time
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from ...security.mcp_auth import MCPTokenData, mcp_auth_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mcp/bootstrap", tags=["mcp_bootstrap"])


class MCPBootstrapRequest(BaseModel):
    """Request model for MCP bootstrap authentication."""

    client_id: str = Field(..., description="MCP client identifier")
    client_secret: str = Field(..., description="Client secret for bootstrap authentication")


class MCPBootstrapResponse(BaseModel):
    """Response model for MCP bootstrap authentication."""

    token: str = Field(..., description="JWT token for MCP authentication")
    client_id: str = Field(..., description="MCP client identifier")
    permissions: list[str] = Field(..., description="Granted permissions")
    expires_at: float = Field(..., description="Token expiration timestamp")


def _validate_bootstrap_credentials(client_id: str, client_secret: str) -> bool:
    """
    Validate bootstrap credentials for MCP client.
    
    Credentials are loaded from environment variables for security.
    In production, these should be stored in a secure credential store.
    
    Args:
        client_id: MCP client identifier
        client_secret: Client secret
        
    Returns:
        True if credentials are valid
    """
    import os
    
    # Map client IDs to environment variable names
    client_env_mapping = {
        "reynard-mcp-server": "MCP_CLIENT_REYNARD_MCP_SERVER_SECRET",
        "cursor-ide": "MCP_CLIENT_CURSOR_IDE_SECRET",
        "reynard-semantic-search": "MCP_CLIENT_REYNARD_SEMANTIC_SEARCH_SECRET",
        "reynard-indexing-tool": "MCP_CLIENT_REYNARD_INDEXING_TOOL_SECRET",
    }
    
    # Get the environment variable name for this client
    env_var_name = client_env_mapping.get(client_id)
    if not env_var_name:
        logger.warning(f"No environment variable mapping found for client: {client_id}")
        return False
    
    # Get the expected secret from environment
    expected_secret = os.getenv(env_var_name)
    if not expected_secret:
        logger.warning(f"Environment variable {env_var_name} not set for client: {client_id}")
        return False
    
    # Validate the provided secret
    return expected_secret == client_secret


@router.post("/authenticate", response_model=MCPBootstrapResponse)
async def bootstrap_mcp_authentication(request: MCPBootstrapRequest) -> MCPBootstrapResponse:
    """
    Bootstrap MCP authentication for initial setup.
    
    This endpoint allows MCP clients to authenticate without requiring
    existing authentication, using client credentials (client_id + client_secret).
    
    Args:
        request: Bootstrap authentication request
        
    Returns:
        MCP authentication token and client information
        
    Raises:
        HTTPException: If authentication fails
    """
    try:
        # Validate bootstrap credentials
        if not _validate_bootstrap_credentials(request.client_id, request.client_secret):
            logger.warning(f"Invalid bootstrap credentials for client: {request.client_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid client credentials",
            )
        
        # Check if client exists in MCP auth service
        client = mcp_auth_service.get_client_info(request.client_id)
        if not client:
            logger.warning(f"Bootstrap authentication failed: client '{request.client_id}' not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Client '{request.client_id}' not found",
            )
        
        if not client.is_active:
            logger.warning(f"Bootstrap authentication failed: client '{request.client_id}' is inactive")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Client '{request.client_id}' is inactive",
            )
        
        # Generate MCP token using the auth service
        token = mcp_auth_service.generate_mcp_token(request.client_id)
        
        # Get token data to extract expiration and permissions
        token_data = mcp_auth_service.validate_mcp_token(token)
        
        logger.info(f"Bootstrap authentication successful for client: {request.client_id}")
        
        return MCPBootstrapResponse(
            token=token,
            client_id=request.client_id,
            permissions=token_data.permissions,
            expires_at=token_data.expires_at,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Bootstrap authentication failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bootstrap authentication failed: {e!s}",
        ) from e


@router.get("/health")
async def bootstrap_health_check():
    """
    Health check endpoint for MCP bootstrap service.
    
    Returns:
        Health status information
    """
    try:
        # Check if MCP auth service is available
        clients = mcp_auth_service.list_clients()
        
        return {
            "status": "healthy",
            "service": "mcp_bootstrap",
            "clients_available": len(clients),
            "timestamp": datetime.now(UTC).isoformat(),
        }
        
    except Exception as e:
        logger.error(f"Bootstrap health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Bootstrap service unhealthy: {e!s}",
        ) from e
