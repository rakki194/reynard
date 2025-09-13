"""
Mock token manager for the Gatekeeper authentication library.
"""

from typing import Optional, Dict, Any


class TokenManager:
    """Mock token manager for testing."""
    
    def __init__(self, secret_key: str = "mock_secret"):
        self.secret_key = secret_key
    
    def create_access_token(self, data: Dict[str, Any], expires_delta=None) -> str:
        """Mock access token creation."""
        return f"mock_access_token_{data.get('sub', 'user')}"
    
    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """Mock refresh token creation."""
        return f"mock_refresh_token_{data.get('sub', 'user')}"
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Mock token verification - always returns mock user data."""
        return {
            "sub": "mock_user_id",
            "username": "mock_user",
            "email": "mock@example.com"
        }
