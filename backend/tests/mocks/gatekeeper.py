"""
Mock gatekeeper module for testing.
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel


class User(BaseModel):
    """Mock user model."""
    id: str
    username: str
    email: str
    is_active: bool = True


class MockUserService:
    """Mock user service."""
    
    def __init__(self):
        self.users: Dict[str, User] = {}
    
    def get_user(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        return self.users.get(user_id)
    
    def create_user(self, username: str, email: str, password: str) -> User:
        """Create a new user."""
        user_id = f"user_{len(self.users) + 1}"
        user = User(id=user_id, username=username, email=email)
        self.users[user_id] = user
        return user


# Global mock user service
_mock_user_service = MockUserService()


def get_current_user() -> User:
    """Mock dependency to get current user."""
    # Return a default test user
    return User(
        id="test_user_1",
        username="testuser",
        email="test@example.com",
        is_active=True
    )


def require_active_user() -> User:
    """Mock dependency to require active user."""
    user = get_current_user()
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is not active")
    return user


def create_auth_router() -> APIRouter:
    """Create mock auth router."""
    router = APIRouter(prefix="/auth", tags=["auth"])
    
    @router.post("/register")
    async def register(username: str, email: str, password: str):
        """Mock registration endpoint."""
        user = _mock_user_service.create_user(username, email, password)
        return {"user": user, "message": "User created successfully"}
    
    @router.post("/login")
    async def login(username: str, password: str):
        """Mock login endpoint."""
        return {"access_token": "mock_token", "token_type": "bearer"}
    
    return router


# Mock gatekeeper API routes
class MockGatekeeperAPI:
    """Mock gatekeeper API."""
    
    @staticmethod
    def create_auth_router():
        return create_auth_router()


# Create mock module structure
api = MockGatekeeperAPI()
routes = MockGatekeeperAPI()
