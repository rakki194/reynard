"""
Database service for Reynard Basic Backend
Handles database connections and operations with reload optimization
"""

import asyncio
import os
from contextlib import asynccontextmanager
from typing import Any

# Detect reload mode
IS_RELOAD_MODE = os.environ.get("UVICORN_RELOAD_PROCESS") == "1"


class DatabaseService:
    """Database service with connection pooling and reload optimization"""

    def __init__(self):
        self.connection_pool = None
        self.is_initialized = False
        self.connection_count = 0

    async def initialize(self):
        """Initialize database connection pool"""
        if IS_RELOAD_MODE:
            print("[INFO] Skipping database initialization during reload")
            return

        print("[INFO] Initializing database service...")

        # Simulate database connection setup
        await asyncio.sleep(0.1)  # Simulate connection time

        self.connection_pool = {
            "url": "sqlite:///./reynard.db",
            "pool_size": 5,
            "max_overflow": 10,
            "connections": [],
        }

        self.is_initialized = True
        self.connection_count = 0

        print("[OK] Database service initialized")

    async def get_connection(self):
        """Get a database connection from the pool"""
        if not self.is_initialized:
            raise RuntimeError("Database service not initialized")

        # Simulate getting a connection
        self.connection_count += 1
        connection_id = f"conn_{self.connection_count}"

        print(f"[INFO] Database connection acquired: {connection_id}")
        return {"id": connection_id, "created_at": asyncio.get_event_loop().time()}

    async def release_connection(self, connection: dict[str, Any]):
        """Release a database connection back to the pool"""
        if not self.is_initialized:
            return

        connection_id = connection.get("id", "unknown")
        print(f"[INFO] Database connection released: {connection_id}")

    async def execute_query(
        self, query: str, params: dict[str, Any] | None = None
    ) -> list[dict[str, Any]]:
        """Execute a database query"""
        if not self.is_initialized:
            raise RuntimeError("Database service not initialized")

        # Simulate query execution
        await asyncio.sleep(0.05)  # Simulate query time

        # Return mock data
        return [
            {
                "id": 1,
                "username": "sample_user",
                "email": "user@example.com",
                "full_name": "Sample User",
                "created_at": 1757226000.0,
                "last_login": 1757226500.0,
            },
            {
                "id": 2,
                "username": "another_user",
                "email": "another@example.com",
                "full_name": "Another User",
                "created_at": 1757226100.0,
                "last_login": 1757226400.0,
            },
        ]

    async def health_check(self) -> bool:
        """Check database health"""
        if not self.is_initialized:
            return False

        try:
            # Simulate health check
            await asyncio.sleep(0.01)
            return True
        except Exception:
            return False

    async def close(self):
        """Close database connections and cleanup"""
        if not self.is_initialized:
            return

        print("[INFO] Closing database service...")

        # Simulate cleanup
        await asyncio.sleep(0.05)

        self.connection_pool = None
        self.is_initialized = False
        self.connection_count = 0

        print("[OK] Database service closed")

    @asynccontextmanager
    async def get_connection_context(self):
        """Context manager for database connections"""
        connection = await self.get_connection()
        try:
            yield connection
        finally:
            await self.release_connection(connection)

    def get_stats(self) -> dict[str, Any]:
        """Get database service statistics"""
        return {
            "initialized": self.is_initialized,
            "connection_count": self.connection_count,
            "pool_size": (
                self.connection_pool.get("pool_size", 0) if self.connection_pool else 0
            ),
            "max_overflow": (
                self.connection_pool.get("max_overflow", 0)
                if self.connection_pool
                else 0
            ),
        }
