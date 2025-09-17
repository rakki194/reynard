"""
Authentication Client for MCP-FastAPI Communication

Provides authentication and connection management for MCP servers
connecting to the FastAPI backend ECS endpoints.
"""

import logging
from dataclasses import dataclass
from typing import Dict, Optional

from aiohttp import ClientSession, ClientTimeout

logger = logging.getLogger(__name__)


@dataclass
class AuthConfig:
    """Configuration for authentication client."""

    base_url: str = "http://localhost:8000"
    username: Optional[str] = None
    password: Optional[str] = None
    api_key: Optional[str] = None
    timeout: float = 30.0


class AuthClient:
    """
    Authentication client for MCP-FastAPI communication.

    Handles authentication and provides authenticated session management
    for connecting to the FastAPI backend ECS endpoints.
    """

    def __init__(self, config: Optional[AuthConfig] = None):
        """
        Initialize the authentication client.

        Args:
            config: Authentication configuration
        """
        self.config = config or AuthConfig()
        self._session: Optional[ClientSession] = None
        self._token: Optional[str] = None
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

            # Attempt authentication if credentials provided
            if self.config.username and self.config.password:
                await self.authenticate()
            elif self.config.api_key:
                self._token = self.config.api_key

            logger.info(f"🔐 Auth Client started, connecting to {self._base_url}")

    async def close(self) -> None:
        """Close the authenticated session."""
        if self._session:
            await self._session.close()
            self._session = None
            self._token = None
            logger.info("🔐 Auth Client closed")

    async def authenticate(self) -> bool:
        """
        Authenticate with the FastAPI backend.

        Returns:
            True if authentication successful, False otherwise
        """
        if not self._session:
            await self.start()

        try:
            # Try username/password authentication
            if self.config.username and self.config.password:
                auth_data = {
                    "username": self.config.username,
                    "password": self.config.password,
                }

                async with self._session.post(
                    f"{self._base_url}/api/auth/login", json=auth_data
                ) as response:
                    if response.status == 200:
                        auth_response = await response.json()
                        self._token = auth_response.get("access_token")
                        logger.info("✅ Authentication successful")
                        return True
                    else:
                        logger.warning(f"Authentication failed: {response.status}")
                        return False

            # Try API key authentication
            elif self.config.api_key:
                self._token = self.config.api_key
                logger.info("✅ API key authentication configured")
                return True

            else:
                logger.warning("No authentication credentials provided")
                return False

        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return False

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
            headers = self.get_auth_headers()

            async with self._session.get(
                f"{self._base_url}/api/health", headers=headers
            ) as response:
                if response.status == 200:
                    logger.info("✅ Connection test successful")
                    return True
                else:
                    logger.warning(f"Connection test failed: {response.status}")
                    return False

        except Exception as e:
            logger.error(f"Connection test error: {e}")
            return False


# Global auth client instance
_auth_client: Optional[AuthClient] = None


def get_auth_client() -> AuthClient:
    """
    Get the singleton authentication client instance.

    Returns:
        The AuthClient instance
    """
    global _auth_client
    if _auth_client is None:
        _auth_client = AuthClient()
    return _auth_client


async def ensure_auth_client() -> AuthClient:
    """
    Ensure the authentication client is started and ready.

    Returns:
        Started AuthClient instance
    """
    client = get_auth_client()
    await client.start()
    return client
