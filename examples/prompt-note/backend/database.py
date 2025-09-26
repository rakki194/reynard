"""Database service for Reynard Basic Backend
SQLAlchemy-based database operations with async support
"""

import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Any

from config import database_config
from models import BackgroundTask, Base, CacheEntry, Session, SystemMetric, User
from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Detect reload mode
IS_RELOAD_MODE = os.environ.get("UVICORN_RELOAD_PROCESS") == "1"


class DatabaseService:
    """Database service with SQLAlchemy async support"""

    def __init__(self):
        self.engine = None
        self.session_factory = None
        self.is_initialized = False
        self.connection_count = 0

    async def initialize(self):
        """Initialize database connection and create tables"""
        if IS_RELOAD_MODE:
            print("[INFO] Skipping database initialization during reload")
            return

        print("[INFO] Initializing database...")

        # Create async engine - use the URL from config (already has asyncpg prefix)
        database_url = database_config.url
        self.engine = create_async_engine(
            database_url,
            echo=database_config.echo,
            pool_size=database_config.pool_size,
            max_overflow=database_config.max_overflow,
            pool_pre_ping=True,
        )

        # Create session factory
        self.session_factory = async_sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )

        # Create tables
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        self.is_initialized = True
        print("[OK] SQLite database initialized")

    async def get_session(self) -> AsyncSession:
        """Get a database session"""
        if not self.is_initialized:
            raise RuntimeError("Database service not initialized")

        return self.session_factory()

    @asynccontextmanager
    async def get_session_context(self):
        """Context manager for database sessions"""
        session = await self.get_session()
        try:
            yield session
        finally:
            await session.close()

    # User operations
    async def create_user(
        self,
        username: str,
        email: str,
        password_hash: str,
        full_name: str | None = None,
    ) -> User:
        """Create a new user"""
        async with self.get_session_context() as session:
            user = User(
                username=username,
                email=email,
                password_hash=password_hash,
                full_name=full_name,
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
            return user

    async def get_user_by_username(self, username: str) -> User | None:
        """Get user by username"""
        async with self.get_session_context() as session:
            result = await session.execute(
                select(User).where(User.username == username),
            )
            return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: int) -> User | None:
        """Get user by ID"""
        async with self.get_session_context() as session:
            result = await session.execute(select(User).where(User.id == user_id))
            return result.scalar_one_or_none()

    async def get_all_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        """Get all users with pagination"""
        async with self.get_session_context() as session:
            result = await session.execute(
                select(User).order_by(User.created_at.desc()).offset(skip).limit(limit),
            )
            return result.scalars().all()

    async def update_user_last_login(self, user_id: int):
        """Update user's last login timestamp"""
        async with self.get_session_context() as session:
            await session.execute(
                update(User)
                .where(User.id == user_id)
                .values(last_login=datetime.utcnow()),
            )
            await session.commit()

    # Session operations
    async def create_session(
        self,
        user_id: int,
        token: str,
        expires_at: datetime,
    ) -> Session:
        """Create a new user session"""
        async with self.get_session_context() as session:
            session_obj = Session(user_id=user_id, token=token, expires_at=expires_at)
            session.add(session_obj)
            await session.commit()
            await session.refresh(session_obj)
            return session_obj

    async def get_session_by_token(self, token: str) -> Session | None:
        """Get session by token"""
        async with self.get_session_context() as session:
            result = await session.execute(
                select(Session)
                .where(Session.token == token)
                .where(Session.is_active == True)
                .where(Session.expires_at > datetime.utcnow()),
            )
            return result.scalar_one_or_none()

    async def deactivate_session(self, token: str):
        """Deactivate a session"""
        async with self.get_session_context() as session:
            await session.execute(
                update(Session).where(Session.token == token).values(is_active=False),
            )
            await session.commit()

    async def cleanup_expired_sessions(self):
        """Clean up expired sessions"""
        async with self.get_session_context() as session:
            await session.execute(
                update(Session)
                .where(Session.expires_at < datetime.utcnow())
                .values(is_active=False),
            )
            await session.commit()

    # Cache operations
    async def set_cache(self, key: str, value: str, ttl: int | None = None):
        """Set cache entry"""
        async with self.get_session_context() as session:
            expires_at = None
            if ttl:
                expires_at = datetime.utcnow() + timedelta(seconds=ttl)

            # Check if key exists
            result = await session.execute(
                select(CacheEntry).where(CacheEntry.key == key),
            )
            cache_entry = result.scalar_one_or_none()

            if cache_entry:
                cache_entry.value = value
                cache_entry.expires_at = expires_at
                cache_entry.updated_at = datetime.utcnow()
            else:
                cache_entry = CacheEntry(key=key, value=value, expires_at=expires_at)
                session.add(cache_entry)

            await session.commit()

    async def get_cache(self, key: str) -> str | None:
        """Get cache entry"""
        async with self.get_session_context() as session:
            result = await session.execute(
                select(CacheEntry)
                .where(CacheEntry.key == key)
                .where(
                    (CacheEntry.expires_at.is_(None))
                    | (CacheEntry.expires_at > datetime.utcnow()),
                ),
            )
            cache_entry = result.scalar_one_or_none()
            return cache_entry.value if cache_entry else None

    async def delete_cache(self, key: str):
        """Delete cache entry"""
        async with self.get_session_context() as session:
            await session.execute(delete(CacheEntry).where(CacheEntry.key == key))
            await session.commit()

    async def cleanup_expired_cache(self):
        """Clean up expired cache entries"""
        async with self.get_session_context() as session:
            await session.execute(
                delete(CacheEntry).where(CacheEntry.expires_at < datetime.utcnow()),
            )
            await session.commit()

    # System metrics
    async def record_metric(
        self,
        name: str,
        value: float,
        data: dict[str, Any] | None = None,
    ):
        """Record a system metric"""
        async with self.get_session_context() as session:
            import json

            metric = SystemMetric(
                metric_name=name,
                metric_value=value,
                metric_data=json.dumps(data) if data else None,
            )
            session.add(metric)
            await session.commit()

    async def get_metrics(self, name: str, limit: int = 100) -> list[SystemMetric]:
        """Get metrics by name"""
        async with self.get_session_context() as session:
            result = await session.execute(
                select(SystemMetric)
                .where(SystemMetric.metric_name == name)
                .order_by(SystemMetric.timestamp.desc())
                .limit(limit),
            )
            return result.scalars().all()

    # Background tasks
    async def create_background_task(
        self,
        name: str,
        data: dict[str, Any] | None = None,
    ) -> BackgroundTask:
        """Create a background task record"""
        async with self.get_session_context() as session:
            import json

            task = BackgroundTask(
                task_name=name,
                task_data=json.dumps(data) if data else None,
            )
            session.add(task)
            await session.commit()
            await session.refresh(task)
            return task

    async def update_task_status(
        self,
        task_id: int,
        status: str,
        error_message: str | None = None,
    ):
        """Update task status"""
        async with self.get_session_context() as session:
            update_data = {"status": status}
            if status == "running":
                update_data["started_at"] = datetime.utcnow()
            elif status in ["completed", "failed"]:
                update_data["completed_at"] = datetime.utcnow()
            if error_message:
                update_data["error_message"] = error_message

            await session.execute(
                update(BackgroundTask)
                .where(BackgroundTask.id == task_id)
                .values(**update_data),
            )
            await session.commit()

    async def health_check(self) -> bool:
        """Check database health"""
        if not self.is_initialized:
            return False

        try:
            async with self.get_session_context() as session:
                await session.execute(select(1))
                return True
        except Exception as e:
            print(f"[FAIL] Database health check failed: {e}")
            return False

    async def get_stats(self) -> dict[str, Any]:
        """Get database statistics"""
        if not self.is_initialized:
            return {"initialized": False}

        async with self.get_session_context() as session:
            # Count users
            user_count = await session.scalar(select(func.count(User.id)))

            # Count active sessions
            active_sessions = await session.scalar(
                select(func.count(Session.id))
                .where(Session.is_active == True)
                .where(Session.expires_at > datetime.utcnow()),
            )

            # Count cache entries
            cache_count = await session.scalar(select(func.count(CacheEntry.id)))

            return {
                "initialized": True,
                "users": user_count,
                "active_sessions": active_sessions,
                "cache_entries": cache_count,
                "pool_size": database_config.pool_size,
                "max_overflow": database_config.max_overflow,
            }

    async def close(self):
        """Close database connections"""
        if not self.is_initialized:
            return

        print("[INFO] Closing database service...")

        if self.engine:
            await self.engine.dispose()

        self.is_initialized = False
        print("[OK] Database service closed")
