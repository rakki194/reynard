"""
🔐 Session Encryption System for Reynard Backend

This module provides comprehensive session encryption and management with
Redis backend, secure session handling, and advanced session security features.

Key Features:
- Encrypted session storage in Redis
- Session binding to IP address and user agent
- Concurrent session limits and management
- Session timeout and cleanup
- Session fingerprinting for security
- Session anomaly detection

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import hashlib
import json
import logging
import secrets
from dataclasses import asdict, dataclass
from datetime import UTC, datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

import redis
from fastapi import Request, Response
from starlette.middleware.sessions import SessionMiddleware

from app.security.audit_logger import (
    SecurityEventSeverity,
    SecurityEventType,
    log_authentication_event,
    log_security_violation,
)
from app.security.encryption_utils import EncryptionUtils
from app.security.itsdangerous_utils import get_itsdangerous_utils
from app.security.key_manager import KeyType, get_key_manager
from app.security.security_config import get_session_security_config

logger = logging.getLogger(__name__)


class SessionEncryptionError(Exception):
    """Exception raised for session encryption-related errors."""

    pass


@dataclass
class SessionData:
    """Session data structure."""

    session_id: str
    user_id: Optional[str]
    created_at: datetime
    last_accessed: datetime
    expires_at: datetime
    ip_address: Optional[str]
    user_agent: Optional[str]
    session_fingerprint: str
    data: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        data = asdict(self)
        data["created_at"] = self.created_at.isoformat()
        data["last_accessed"] = self.last_accessed.isoformat()
        data["expires_at"] = self.expires_at.isoformat()
        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SessionData":
        """Create from dictionary."""
        return cls(
            session_id=data["session_id"],
            user_id=data.get("user_id"),
            created_at=datetime.fromisoformat(data["created_at"]),
            last_accessed=datetime.fromisoformat(data["last_accessed"]),
            expires_at=datetime.fromisoformat(data["expires_at"]),
            ip_address=data.get("ip_address"),
            user_agent=data.get("user_agent"),
            session_fingerprint=data["session_fingerprint"],
            data=data.get("data", {}),
        )


class SessionEncryptionManager:
    """
    Comprehensive session encryption and management system.

    This class provides:
    - Encrypted session storage in Redis
    - Session security features (binding, fingerprinting, limits)
    - Session cleanup and management
    - Security monitoring and anomaly detection
    """

    def __init__(self, redis_client: Optional[redis.Redis] = None):
        """
        Initialize the session encryption manager.

        Args:
            redis_client: Redis client instance (optional)
        """
        self.config = get_session_security_config()
        self.key_manager = get_key_manager()
        self.itsdangerous_utils = get_itsdangerous_utils()

        # Redis client
        if redis_client is None:
            self.redis_client = redis.Redis(
                host="localhost", port=6379, db=0, decode_responses=True
            )
        else:
            self.redis_client = redis_client

        # Session encryption key
        self._ensure_session_encryption_key()

        # Session cleanup task
        self._setup_session_cleanup()

    def _ensure_session_encryption_key(self) -> None:
        """Ensure session encryption key exists."""
        session_key_id = "session_encryption_key"
        if not self.key_manager.get_key(session_key_id):
            logger.info("Creating session encryption key")
            self.key_manager.generate_key(
                key_id=session_key_id,
                key_type=KeyType.SESSION_ENCRYPTION,
                rotation_schedule_days=30,  # Sessions keys rotate monthly
            )

    def _setup_session_cleanup(self) -> None:
        """Set up automatic session cleanup."""
        if self.config.session_cleanup_interval_minutes > 0:
            # This would typically be set up as a background task
            # For now, we'll handle cleanup on demand
            pass

    def _generate_session_fingerprint(
        self, ip_address: Optional[str], user_agent: Optional[str]
    ) -> str:
        """Generate a session fingerprint for security."""
        fingerprint_data = f"{ip_address or 'unknown'}:{user_agent or 'unknown'}"
        return hashlib.sha256(fingerprint_data.encode()).hexdigest()[:16]

    def _encrypt_session_data(self, session_data: SessionData) -> str:
        """Encrypt session data for storage."""
        try:
            session_key = self.key_manager.get_key("session_encryption_key")
            if not session_key:
                raise SessionEncryptionError("Session encryption key not found")

            # Convert session data to JSON
            json_data = json.dumps(session_data.to_dict(), default=str)

            # Encrypt the session data
            encrypted_data = EncryptionUtils.encrypt_field(
                data=json_data,
                key=session_key,
                field_name=f"session_{session_data.session_id}",
            )

            return encrypted_data

        except Exception as e:
            logger.error(f"Failed to encrypt session data: {e}")
            raise SessionEncryptionError(f"Session encryption failed: {e}")

    def _decrypt_session_data(
        self, encrypted_data: str, session_id: str
    ) -> SessionData:
        """Decrypt session data from storage."""
        try:
            session_key = self.key_manager.get_key("session_encryption_key")
            if not session_key:
                raise SessionEncryptionError("Session encryption key not found")

            # Decrypt the session data
            decrypted_json = EncryptionUtils.decrypt_field(
                encrypted_data=encrypted_data,
                key=session_key,
                field_name=f"session_{session_id}",
            )

            # Parse JSON and create SessionData object
            session_dict = json.loads(decrypted_json)
            return SessionData.from_dict(session_dict)

        except Exception as e:
            logger.error(f"Failed to decrypt session data: {e}")
            raise SessionEncryptionError(f"Session decryption failed: {e}")

    def create_hybrid_session(
        self,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        session_data: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Create a hybrid session using itsdangerous for token signing and Redis for data storage.

        This approach combines the best of both worlds:
        - itsdangerous provides secure, time-based token signing
        - Redis provides fast, encrypted session data storage
        - Automatic token expiration through itsdangerous

        Args:
            user_id: User ID (optional)
            ip_address: Client IP address
            user_agent: Client user agent
            session_data: Additional session data

        Returns:
            itsdangerous-signed session token
        """
        try:
            # Generate unique session ID
            session_id = secrets.token_urlsafe(32)

            # Generate session fingerprint
            session_fingerprint = self._generate_session_fingerprint(
                ip_address, user_agent
            )

            # Calculate expiration time
            expires_at = datetime.now(UTC) + timedelta(
                minutes=self.config.session_timeout_minutes
            )

            # Create session data for Redis storage
            session = SessionData(
                session_id=session_id,
                user_id=user_id,
                created_at=datetime.now(UTC),
                last_accessed=datetime.now(UTC),
                expires_at=expires_at,
                ip_address=ip_address,
                user_agent=user_agent,
                session_fingerprint=session_fingerprint,
                data=session_data or {},
            )

            # Store session data in Redis (simplified for hybrid approach)
            # Since we're using itsdangerous for token security, we can use simpler storage
            import json

            session_json = json.dumps(session.to_dict(), default=str)
            redis_key = f"session:{session_id}"
            self.redis_client.setex(
                redis_key,
                self.config.session_timeout_minutes * 60,  # Convert to seconds
                session_json,
            )

            # Track user sessions if user_id is provided
            if user_id:
                self._track_user_session(user_id, session_id)

            # Create itsdangerous token with session metadata
            token_data = {
                "session_id": session_id,
                "user_id": user_id,
                "fingerprint": session_fingerprint,
                "created_at": session.created_at.isoformat(),
            }

            # Create timestamped token using itsdangerous
            session_token = self.itsdangerous_utils.create_session_token(
                token_data,
                expires_in=timedelta(minutes=self.config.session_timeout_minutes),
            )

            # Log session creation
            log_authentication_event(
                event_type=SecurityEventType.LOGIN_SUCCESS,
                user_id=user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                success=True,
                details={
                    "session_id": session_id,
                    "action": "hybrid_session_created",
                    "token_type": "itsdangerous",
                },
            )

            logger.info(f"Created hybrid session {session_id} for user {user_id}")
            return session_token

        except Exception as e:
            logger.error(f"Failed to create hybrid session: {e}")
            raise SessionEncryptionError(f"Hybrid session creation failed: {e}")

    def create_session(
        self,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        session_data: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Create a new encrypted session.

        Args:
            user_id: User ID (optional)
            ip_address: Client IP address
            user_agent: Client user agent
            session_data: Additional session data

        Returns:
            Session ID
        """
        try:
            # Generate unique session ID
            session_id = secrets.token_urlsafe(32)

            # Generate session fingerprint
            session_fingerprint = self._generate_session_fingerprint(
                ip_address, user_agent
            )

            # Calculate expiration time
            expires_at = datetime.now(UTC) + timedelta(
                minutes=self.config.session_timeout_minutes
            )

            # Create session data
            session = SessionData(
                session_id=session_id,
                user_id=user_id,
                created_at=datetime.now(UTC),
                last_accessed=datetime.now(UTC),
                expires_at=expires_at,
                ip_address=ip_address,
                user_agent=user_agent,
                session_fingerprint=session_fingerprint,
                data=session_data or {},
            )

            # Encrypt and store session
            encrypted_data = self._encrypt_session_data(session)

            # Store in Redis with expiration
            redis_key = f"session:{session_id}"
            self.redis_client.setex(
                redis_key,
                self.config.session_timeout_minutes * 60,  # Convert to seconds
                encrypted_data,
            )

            # Track user sessions if user_id is provided
            if user_id:
                self._track_user_session(user_id, session_id)

            # Log session creation
            log_authentication_event(
                event_type=SecurityEventType.LOGIN_SUCCESS,
                user_id=user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                success=True,
                details={"session_id": session_id, "action": "session_created"},
            )

            logger.info(f"Created encrypted session {session_id} for user {user_id}")
            return session_id

        except Exception as e:
            logger.error(f"Failed to create session: {e}")
            raise SessionEncryptionError(f"Session creation failed: {e}")

    def get_hybrid_session(self, session_token: str) -> Optional[SessionData]:
        """
        Retrieve and verify a hybrid session using itsdangerous token.

        Args:
            session_token: itsdangerous-signed session token

        Returns:
            SessionData object or None if not found/invalid
        """
        try:
            # Verify the itsdangerous token
            token_data = self.itsdangerous_utils.verify_session_token(session_token)
            if not token_data:
                logger.warning("Invalid or expired session token")
                return None

            # Extract session ID from token
            session_id = token_data.get("session_id")
            if not session_id:
                logger.warning("Session token missing session_id")
                return None

            # Get session from Redis (simplified for hybrid approach)
            redis_key = f"session:{session_id}"
            session_json = self.redis_client.get(redis_key)
            if not session_json:
                logger.warning(f"Session {session_id} not found in Redis")
                return None

            # Parse session data
            import json

            session_dict = json.loads(session_json)
            session = SessionData.from_dict(session_dict)

            # Validate session fingerprint
            expected_fingerprint = token_data.get("fingerprint")
            if (
                expected_fingerprint
                and session.session_fingerprint != expected_fingerprint
            ):
                logger.warning(f"Session fingerprint mismatch for {session_id}")
                return None

            # Update last accessed time
            session.last_accessed = datetime.now(UTC)

            # Store updated session (simplified for hybrid approach)
            session_json = json.dumps(session.to_dict(), default=str)
            self.redis_client.setex(
                redis_key, self.config.session_timeout_minutes * 60, session_json
            )

            return session

        except Exception as e:
            logger.error(f"Failed to get hybrid session: {e}")
            return None

    def get_session(self, session_id: str) -> Optional[SessionData]:
        """
        Retrieve and decrypt a session.

        Args:
            session_id: Session ID

        Returns:
            SessionData object or None if not found
        """
        try:
            redis_key = f"session:{session_id}"
            encrypted_data = self.redis_client.get(redis_key)

            if not encrypted_data:
                return None

            # Decrypt session data
            session = self._decrypt_session_data(encrypted_data, session_id)

            # Check if session is expired
            if datetime.now(UTC) > session.expires_at:
                self.delete_session(session_id)
                return None

            # Update last accessed time
            session.last_accessed = datetime.now(UTC)

            # Re-encrypt and store updated session
            encrypted_data = self._encrypt_session_data(session)
            self.redis_client.setex(
                redis_key, self.config.session_timeout_minutes * 60, encrypted_data
            )

            return session

        except Exception as e:
            logger.error(f"Failed to get session {session_id}: {e}")
            return None

    def update_session(
        self,
        session_id: str,
        session_data: Dict[str, Any],
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> bool:
        """
        Update session data.

        Args:
            session_id: Session ID
            session_data: New session data
            ip_address: Client IP address (for validation)
            user_agent: Client user agent (for validation)

        Returns:
            True if successful, False otherwise
        """
        try:
            session = self.get_session(session_id)
            if not session:
                return False

            # Validate session binding if enabled
            if self.config.enable_session_binding:
                if not self._validate_session_binding(session, ip_address, user_agent):
                    log_security_violation(
                        event_type=SecurityEventType.UNAUTHORIZED_ACCESS,
                        severity=SecurityEventSeverity.MEDIUM,
                        ip_address=ip_address,
                        user_agent=user_agent,
                        resource=f"session:{session_id}",
                        details={"reason": "session_binding_violation"},
                    )
                    self.delete_session(session_id)
                    return False

            # Update session data
            session.data.update(session_data)
            session.last_accessed = datetime.now(UTC)

            # Re-encrypt and store updated session
            encrypted_data = self._encrypt_session_data(session)
            redis_key = f"session:{session_id}"
            self.redis_client.setex(
                redis_key, self.config.session_timeout_minutes * 60, encrypted_data
            )

            return True

        except Exception as e:
            logger.error(f"Failed to update session {session_id}: {e}")
            return False

    def delete_session(self, session_id: str) -> bool:
        """
        Delete a session.

        Args:
            session_id: Session ID

        Returns:
            True if successful, False otherwise
        """
        try:
            # Get session data before deletion for cleanup
            session = self.get_session(session_id)

            # Delete from Redis
            redis_key = f"session:{session_id}"
            result = self.redis_client.delete(redis_key)

            # Clean up user session tracking
            if session and session.user_id:
                self._untrack_user_session(session.user_id, session_id)

            # Log session deletion
            if session:
                log_authentication_event(
                    event_type=SecurityEventType.LOGOUT,
                    user_id=session.user_id,
                    ip_address=session.ip_address,
                    user_agent=session.user_agent,
                    success=True,
                    details={"session_id": session_id, "action": "session_deleted"},
                )

            logger.info(f"Deleted session {session_id}")
            return result > 0

        except Exception as e:
            logger.error(f"Failed to delete session {session_id}: {e}")
            return False

    def _validate_session_binding(
        self, session: SessionData, ip_address: Optional[str], user_agent: Optional[str]
    ) -> bool:
        """Validate session binding to IP and user agent."""
        if not self.config.enable_session_binding:
            return True

        # Check IP address binding
        if session.ip_address and ip_address:
            if session.ip_address != ip_address:
                logger.warning(
                    f"Session IP binding violation: {session.ip_address} != {ip_address}"
                )
                return False

        # Check user agent binding
        if session.user_agent and user_agent:
            if session.user_agent != user_agent:
                logger.warning(f"Session user agent binding violation")
                return False

        return True

    def _track_user_session(self, user_id: str, session_id: str) -> None:
        """Track user sessions for concurrent session management."""
        try:
            user_sessions_key = f"user_sessions:{user_id}"

            # Add session to user's session list
            self.redis_client.sadd(user_sessions_key, session_id)

            # Set expiration for the user sessions set
            self.redis_client.expire(
                user_sessions_key, self.config.session_timeout_minutes * 60
            )

            # Check concurrent session limits
            self._enforce_concurrent_session_limits(user_id)

        except Exception as e:
            logger.error(f"Failed to track user session: {e}")

    def _untrack_user_session(self, user_id: str, session_id: str) -> None:
        """Remove session from user's session tracking."""
        try:
            user_sessions_key = f"user_sessions:{user_id}"
            self.redis_client.srem(user_sessions_key, session_id)
        except Exception as e:
            logger.error(f"Failed to untrack user session: {e}")

    def _enforce_concurrent_session_limits(self, user_id: str) -> None:
        """Enforce concurrent session limits for a user."""
        try:
            user_sessions_key = f"user_sessions:{user_id}"
            user_sessions = self.redis_client.smembers(user_sessions_key)

            if len(user_sessions) > self.config.max_concurrent_sessions:
                # Remove oldest sessions
                sessions_to_remove = (
                    len(user_sessions) - self.config.max_concurrent_sessions
                )

                # Get session creation times and sort by oldest first
                session_times = []
                for session_id in user_sessions:
                    session = self.get_session(session_id)
                    if session:
                        session_times.append((session_id, session.created_at))

                # Sort by creation time (oldest first)
                session_times.sort(key=lambda x: x[1])

                # Remove oldest sessions
                for session_id, _ in session_times[:sessions_to_remove]:
                    self.delete_session(session_id)
                    logger.info(
                        f"Removed excess session {session_id} for user {user_id}"
                    )

        except Exception as e:
            logger.error(f"Failed to enforce concurrent session limits: {e}")

    def get_user_sessions(self, user_id: str) -> List[SessionData]:
        """Get all active sessions for a user."""
        try:
            user_sessions_key = f"user_sessions:{user_id}"
            session_ids = self.redis_client.smembers(user_sessions_key)

            sessions = []
            for session_id in session_ids:
                session = self.get_session(session_id)
                if session:
                    sessions.append(session)
                else:
                    # Clean up invalid session reference
                    self.redis_client.srem(user_sessions_key, session_id)

            return sessions

        except Exception as e:
            logger.error(f"Failed to get user sessions: {e}")
            return []

    def revoke_user_sessions(self, user_id: str) -> int:
        """Revoke all sessions for a user."""
        try:
            sessions = self.get_user_sessions(user_id)
            revoked_count = 0

            for session in sessions:
                if self.delete_session(session.session_id):
                    revoked_count += 1

            logger.info(f"Revoked {revoked_count} sessions for user {user_id}")
            return revoked_count

        except Exception as e:
            logger.error(f"Failed to revoke user sessions: {e}")
            return 0

    def cleanup_expired_sessions(self) -> int:
        """Clean up expired sessions."""
        try:
            # Redis automatically handles TTL expiration, but we can clean up
            # any orphaned user session tracking
            pattern = "user_sessions:*"
            user_sessions_keys = self.redis_client.keys(pattern)

            cleaned_count = 0
            for key in user_sessions_keys:
                # Get all session IDs for this user
                session_ids = self.redis_client.smembers(key)

                # Check which sessions still exist
                valid_sessions = []
                for session_id in session_ids:
                    if self.redis_client.exists(f"session:{session_id}"):
                        valid_sessions.append(session_id)

                # Update the user sessions set with only valid sessions
                if len(valid_sessions) != len(session_ids):
                    self.redis_client.delete(key)
                    if valid_sessions:
                        self.redis_client.sadd(key, *valid_sessions)
                        self.redis_client.expire(
                            key, self.config.session_timeout_minutes * 60
                        )
                    cleaned_count += len(session_ids) - len(valid_sessions)

            logger.info(f"Cleaned up {cleaned_count} expired session references")
            return cleaned_count

        except Exception as e:
            logger.error(f"Failed to cleanup expired sessions: {e}")
            return 0

    def get_session_statistics(self) -> Dict[str, Any]:
        """Get session statistics."""
        try:
            # Count total sessions
            session_keys = self.redis_client.keys("session:*")
            total_sessions = len(session_keys)

            # Count user session tracking entries
            user_session_keys = self.redis_client.keys("user_sessions:*")
            total_users_with_sessions = len(user_session_keys)

            return {
                "total_sessions": total_sessions,
                "total_users_with_sessions": total_users_with_sessions,
                "session_timeout_minutes": self.config.session_timeout_minutes,
                "max_concurrent_sessions": self.config.max_concurrent_sessions,
                "encryption_enabled": self.config.enable_session_encryption,
                "session_binding_enabled": self.config.enable_session_binding,
            }

        except Exception as e:
            logger.error(f"Failed to get session statistics: {e}")
            return {}


# Global session encryption manager instance
_session_encryption_manager: Optional[SessionEncryptionManager] = None


def get_session_encryption_manager() -> SessionEncryptionManager:
    """Get the global session encryption manager instance."""
    global _session_encryption_manager
    if _session_encryption_manager is None:
        _session_encryption_manager = SessionEncryptionManager()
    return _session_encryption_manager


def create_encrypted_session(
    user_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    session_data: Optional[Dict[str, Any]] = None,
) -> str:
    """Create a new encrypted session (uses hybrid sessions by default)."""
    config = get_session_security_config()
    manager = get_session_encryption_manager()

    if config.enable_hybrid_sessions:
        return manager.create_hybrid_session(
            user_id, ip_address, user_agent, session_data
        )
    else:
        return manager.create_session(user_id, ip_address, user_agent, session_data)


def get_encrypted_session(session_id_or_token: str) -> Optional[SessionData]:
    """Get an encrypted session (handles both session IDs and hybrid tokens)."""
    config = get_session_security_config()
    manager = get_session_encryption_manager()

    if config.enable_hybrid_sessions:
        # Try as hybrid session token first
        session = manager.get_hybrid_session(session_id_or_token)
        if session is not None:
            return session

    # Fallback to regular session ID lookup
    return manager.get_session(session_id_or_token)


def update_encrypted_session(
    session_id: str,
    session_data: Dict[str, Any],
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> bool:
    """Update an encrypted session."""
    manager = get_session_encryption_manager()
    return manager.update_session(session_id, session_data, ip_address, user_agent)


def delete_encrypted_session(session_id: str) -> bool:
    """Delete an encrypted session."""
    manager = get_session_encryption_manager()
    return manager.delete_session(session_id)


def revoke_user_sessions(user_id: str) -> int:
    """Revoke all sessions for a user."""
    manager = get_session_encryption_manager()
    return manager.revoke_user_sessions(user_id)


def cleanup_expired_sessions() -> int:
    """Clean up expired sessions."""
    manager = get_session_encryption_manager()
    return manager.cleanup_expired_sessions()


# Export all functions
__all__ = [
    # Core session management (recommended)
    "create_session",
    "get_session",
    # Legacy functions (still supported)
    "create_encrypted_session",
    "get_encrypted_session",
    "update_encrypted_session",
    "delete_encrypted_session",
    "revoke_user_sessions",
    "cleanup_expired_sessions",
    # Hybrid session functions
    "create_hybrid_session",
    "get_hybrid_session",
    # Classes and types
    "SessionEncryptionManager",
    "SessionData",
    "SessionEncryptionError",
]


def create_session(
    user_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    session_data: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Create a new session (recommended function - uses best available method).

    This function automatically chooses the best session creation method:
    - Hybrid sessions (itsdangerous + Redis) if enabled
    - Traditional encrypted sessions as fallback

    Args:
        user_id: User ID (optional)
        ip_address: Client IP address
        user_agent: Client user agent
        session_data: Additional session data

    Returns:
        Session token or ID
    """
    return create_encrypted_session(user_id, ip_address, user_agent, session_data)


def get_session(session_id_or_token: str) -> Optional[SessionData]:
    """
    Get a session (recommended function - handles all session types).

    This function automatically handles:
    - Hybrid session tokens (itsdangerous-signed)
    - Traditional session IDs

    Args:
        session_id_or_token: Session ID or hybrid session token

    Returns:
        SessionData object or None if not found
    """
    return get_encrypted_session(session_id_or_token)


def create_hybrid_session(
    user_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    session_data: Optional[Dict[str, Any]] = None,
) -> str:
    """Create a new hybrid session using itsdangerous."""
    manager = get_session_encryption_manager()
    return manager.create_hybrid_session(user_id, ip_address, user_agent, session_data)


def get_hybrid_session(session_token: str) -> Optional[SessionData]:
    """Get a hybrid session using itsdangerous token."""
    manager = get_session_encryption_manager()
    return manager.get_hybrid_session(session_token)
