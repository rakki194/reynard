"""
Mock auth manager for the Gatekeeper authentication library.
"""

from typing import Optional, Dict, Any


class AuthManager:
    """Mock auth manager for testing."""
    
    def __init__(self, backend=None, token_manager=None, password_manager=None):
        self.backend = backend
        self.token_manager = token_manager
        self.password_manager = password_manager
    
    async def authenticate_user(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """Mock user authentication - always returns a mock user."""
        return {
            "id": "mock_user_id",
            "username": username,
            "email": f"{username}@example.com",
            "is_active": True
        }
    
    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Mock user creation - returns the user data with an ID."""
        return {
            "id": "mock_user_id",
            **user_data
        }
