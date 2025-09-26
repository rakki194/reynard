"""Mock memory backend."""

from typing import Any

from ..main import MockUser


class MockMemoryBackend:
    """Mock memory backend for testing."""

    def __init__(self):
        self.users: dict[str, MockUser] = {}

    async def create_user(self, user_data: dict[str, Any]) -> MockUser:
        """Create a user in memory."""
        user = MockUser(
            id=len(self.users) + 1,
            username=user_data["username"],
            email=user_data["email"],
            is_active=True,
        )
        self.users[user_data["username"]] = user
        return user

    async def get_user_by_username(self, username: str) -> MockUser | None:
        """Get user by username."""
        return self.users.get(username)

    async def get_user_by_email(self, email: str) -> MockUser | None:
        """Get user by email."""
        for user in self.users.values():
            if user.email == email:
                return user
        return None


# Alias for compatibility
MemoryBackend = MockMemoryBackend

__all__ = ["MemoryBackend", "MockMemoryBackend"]
