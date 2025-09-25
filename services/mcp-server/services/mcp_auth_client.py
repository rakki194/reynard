"""
MCP Authentication Client for Reynard MCP Server

Provides secure authentication to the FastAPI backend using the existing
MCP authentication system. This client handles token generation, validation,
and automatic refresh for seamless integration with the Reynard backend.

The MCP server authenticates as the "reynard-mcp-server" client with
full permissions for RAG operations, ECS world access, and admin functions.
"""

import asyncio
import logging
import os
import time
from dataclasses import dataclass
from typing import Any, Dict, Optional

from aiohttp import ClientSession, ClientTimeout

logger = logging.getLogger(__name__)


@dataclass
class MCPAuthConfig:
    """Configuration for MCP authentication client."""

    base_url: str = "http://localhost:8000"
    client_id: str = "reynard-mcp-server"
    client_secret: str = ""
    timeout: float = 30.0
    token_refresh_threshold: float = 300.0  # Refresh 5 minutes before expiry

    def __post_init__(self):
        """Load client secret from environment variables."""
        import os
        
        # Map client IDs to environment variable names
        client_env_mapping = {
            "reynard-mcp-server": "MCP_CLIENT_REYNARD_MCP_SERVER_SECRET",
            "cursor-ide": "MCP_CLIENT_CURSOR_IDE_SECRET",
            "reynard-semantic-search": "MCP_CLIENT_REYNARD_SEMANTIC_SEARCH_SECRET",
            "reynard-indexing-tool": "MCP_CLIENT_REYNARD_INDEXING_TOOL_SECRET",
        }
        
        # Get the environment variable name for this client
        env_var_name = client_env_mapping.get(self.client_id)
        if env_var_name:
            self.client_secret = os.getenv(env_var_name, "")
        
        # Override with environment variables if available
        self.base_url = os.getenv("BACKEND_BASE_URL", self.base_url)
        self.client_id = os.getenv("MCP_CLIENT_ID", self.client_id)
        self.timeout = float(os.getenv("BACKEND_TIMEOUT", self.timeout))
        self.token_refresh_threshold = float(os.getenv("MCP_TOKEN_REFRESH_THRESHOLD", self.token_refresh_threshold))


class MCPAuthClient:
    """
    Authentication client for MCP server to FastAPI backend communication.

    This client handles authentication using the existing MCP authentication
    system in the Reynard backend, providing secure access to all backend services.
    """

    def __init__(self, config: Optional[MCPAuthConfig] = None):
        """
        Initialize the MCP authentication client.

        Args:
            config: MCP authentication configuration
        """
        self.config = config or MCPAuthConfig()
        self._session: Optional[ClientSession] = None
        self._token: Optional[str] = None
        self._token_expires_at: Optional[float] = None
        self._base_url = self.config.base_url.rstrip("/")

    async def __aenter__(self):
        """Async context manager entry."""
        await self.start()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()

    async def start(self) -> None:
        """Start the authenticated session."""
        if self._session is None:
            timeout = ClientTimeout(total=self.config.timeout)
            self._session = ClientSession(timeout=timeout)

            # Authenticate with the backend
            await self.authenticate()

            logger.info(f"🔐 MCP Auth Client started, connecting to {self._base_url}")

    async def close(self) -> None:
        """Close the authenticated session."""
        if self._session:
            await self._session.close()
            self._session = None
            self._token = None
            self._token_expires_at = None
            logger.info("🔐 MCP Auth Client closed")

    async def authenticate(self) -> bool:
        """
        Authenticate with the FastAPI backend using MCP client credentials.

        Returns:
            True if authentication successful, False otherwise
        """
        if not self._session:
            await self.start()

        try:
            # Use bootstrap authentication for initial token generation
            bootstrap_request = {
                "client_id": self.config.client_id,
                "client_secret": self.config.client_secret
            }

            async with self._session.post(
                f"{self._base_url}/api/mcp/bootstrap/authenticate",
                json=bootstrap_request,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    token_response = await response.json()
                    self._token = token_response.get("token")
                    self._token_expires_at = token_response.get("expires_at")
                    
                    logger.info(f"✅ MCP authentication successful for {self.config.client_id}")
                    return True
                else:
                    error_text = await response.text()
                    logger.warning(f"MCP authentication failed: {response.status} - {error_text}")
                    return False

        except Exception as e:
            logger.error(f"MCP authentication error: {e}")
            return False

    async def ensure_valid_token(self) -> bool:
        """
        Ensure we have a valid, non-expired token.

        Returns:
            True if token is valid, False if authentication failed
        """
        # Check if we need to refresh the token
        if not self._token or self._is_token_expired():
            logger.info("🔄 MCP token expired or missing, re-authenticating...")
            return await self.authenticate()
        
        return True

    def _is_token_expired(self) -> bool:
        """Check if the current token is expired or near expiry."""
        if not self._token_expires_at:
            return True
        
        # Check if token expires within the refresh threshold
        current_time = time.time()
        return current_time >= (self._token_expires_at - self.config.token_refresh_threshold)

    def get_auth_headers(self) -> Dict[str, str]:
        """
        Get authentication headers for requests.

        Returns:
            Dictionary with authentication headers
        """
        headers = {"Content-Type": "application/json"}

        if self._token:
            headers["Authorization"] = f"Bearer {self._token}"

        return headers

    async def test_connection(self) -> bool:
        """
        Test the connection to the FastAPI backend.

        Returns:
            True if connection successful, False otherwise
        """
        if not self._session:
            await self.start()

        try:
            # Ensure we have a valid token
            if not await self.ensure_valid_token():
                return False

            headers = self.get_auth_headers()

            async with self._session.get(
                f"{self._base_url}/api/mcp/clients", headers=headers
            ) as response:
                if response.status == 200:
                    logger.info("✅ MCP connection test successful")
                    return True
                else:
                    logger.warning(f"MCP connection test failed: {response.status}")
                    return False

        except Exception as e:
            logger.error(f"MCP connection test error: {e}")
            return False

    async def get_client_info(self) -> Optional[Dict[str, Any]]:
        """
        Get information about the current MCP client.

        Returns:
            Client information dictionary or None if failed
        """
        if not self._session:
            await self.start()

        try:
            # Ensure we have a valid token
            if not await self.ensure_valid_token():
                return None

            headers = self.get_auth_headers()

            async with self._session.get(
                f"{self._base_url}/api/mcp/clients",
                headers=headers
            ) as response:
                if response.status == 200:
                    clients = await response.json()
                    # Find our client in the list
                    for client in clients:
                        if client.get("client_id") == self.config.client_id:
                            return client
                    return None
                else:
                    logger.warning(f"Failed to get client info: {response.status}")
                    return None

        except Exception as e:
            logger.error(f"Error getting client info: {e}")
            return None


# Global MCP auth client instance
_mcp_auth_client: Optional[MCPAuthClient] = None


def get_mcp_auth_client() -> MCPAuthClient:
    """
    Get the singleton MCP authentication client instance.

    Returns:
        The MCPAuthClient instance
    """
    global _mcp_auth_client
    if _mcp_auth_client is None:
        _mcp_auth_client = MCPAuthClient()
    return _mcp_auth_client


async def ensure_mcp_auth_client() -> MCPAuthClient:
    """
    Ensure the MCP authentication client is started and ready.

    Returns:
        Started MCPAuthClient instance
    """
    client = get_mcp_auth_client()
    await client.start()
    return client
