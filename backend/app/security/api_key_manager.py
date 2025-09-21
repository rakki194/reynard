"""
🔐 API Key Management System for Reynard Backend

This module provides comprehensive API key management with encryption,
rotation, scoping, and usage tracking for secure API access.

Key Features:
- Secure API key generation and storage
- API key encryption at rest
- Key rotation and lifecycle management
- API key scoping and permissions
- Usage tracking and analytics
- Rate limiting per API key
- Key revocation and cleanup

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import json
import logging
import secrets
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Tuple
from dataclasses import dataclass, asdict

from app.security.key_manager import get_key_manager, KeyType
from app.security.encryption_utils import EncryptionUtils
from app.security.security_config import get_api_security_config
from app.security.audit_logger import (
    log_security_event, SecurityEvent, SecurityEventType, SecurityEventSeverity
)

logger = logging.getLogger(__name__)


class APIKeyStatus(Enum):
    """API key status."""
    
    ACTIVE = "active"
    SUSPENDED = "suspended"
    REVOKED = "revoked"
    EXPIRED = "expired"


class APIKeyScope(Enum):
    """API key scopes/permissions."""
    
    # Read permissions
    READ_USERS = "read:users"
    READ_SESSIONS = "read:sessions"
    READ_API_KEYS = "read:api_keys"
    READ_AUDIT_LOGS = "read:audit_logs"
    READ_AGENT_EMAILS = "read:agent_emails"
    READ_EMAIL_ANALYTICS = "read:email_analytics"
    READ_CAPTIONS = "read:captions"
    
    # Write permissions
    WRITE_USERS = "write:users"
    WRITE_SESSIONS = "write:sessions"
    WRITE_API_KEYS = "write:api_keys"
    WRITE_AUDIT_LOGS = "write:audit_logs"
    WRITE_AGENT_EMAILS = "write:agent_emails"
    WRITE_EMAIL_ANALYTICS = "write:email_analytics"
    WRITE_CAPTIONS = "write:captions"
    
    # Admin permissions
    ADMIN_USERS = "admin:users"
    ADMIN_SESSIONS = "admin:sessions"
    ADMIN_API_KEYS = "admin:api_keys"
    ADMIN_SYSTEM = "admin:system"
    
    # Special permissions
    FULL_ACCESS = "full_access"
    READ_ONLY = "read_only"


@dataclass
class APIKeyMetadata:
    """API key metadata."""
    
    key_id: str
    name: str
    description: Optional[str]
    user_id: Optional[str]
    status: APIKeyStatus
    scopes: Set[APIKeyScope]
    created_at: datetime
    expires_at: Optional[datetime]
    last_used: Optional[datetime]
    usage_count: int
    rate_limit_per_minute: int
    rate_limit_burst: int
    ip_whitelist: Optional[List[str]]
    ip_blacklist: Optional[List[str]]
    metadata: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        data = asdict(self)
        data["status"] = self.status.value
        data["scopes"] = [scope.value for scope in self.scopes]
        data["created_at"] = self.created_at.isoformat()
        data["expires_at"] = self.expires_at.isoformat() if self.expires_at else None
        data["last_used"] = self.last_used.isoformat() if self.last_used else None
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "APIKeyMetadata":
        """Create from dictionary."""
        return cls(
            key_id=data["key_id"],
            name=data["name"],
            description=data.get("description"),
            user_id=data.get("user_id"),
            status=APIKeyStatus(data["status"]),
            scopes={APIKeyScope(scope) for scope in data["scopes"]},
            created_at=datetime.fromisoformat(data["created_at"]),
            expires_at=datetime.fromisoformat(data["expires_at"]) if data.get("expires_at") else None,
            last_used=datetime.fromisoformat(data["last_used"]) if data.get("last_used") else None,
            usage_count=data.get("usage_count", 0),
            rate_limit_per_minute=data.get("rate_limit_per_minute", 60),
            rate_limit_burst=data.get("rate_limit_burst", 100),
            ip_whitelist=data.get("ip_whitelist"),
            ip_blacklist=data.get("ip_blacklist"),
            metadata=data.get("metadata", {})
        )


class APIKeyManager:
    """
    Comprehensive API key management system.
    
    This class provides:
    - Secure API key generation and storage
    - API key encryption and decryption
    - Key lifecycle management (creation, rotation, revocation)
    - Usage tracking and analytics
    - Rate limiting and access control
    - IP whitelisting/blacklisting
    """
    
    def __init__(self):
        """Initialize the API key manager."""
        self.config = get_api_security_config()
        self.key_manager = get_key_manager()
        
        # In-memory storage for API key metadata (in production, this would be a database)
        self._api_key_metadata: Dict[str, APIKeyMetadata] = {}
        self._api_key_usage: Dict[str, List[datetime]] = {}
        
        # Ensure API key encryption key exists
        self._ensure_api_key_encryption_key()
    
    def _ensure_api_key_encryption_key(self) -> None:
        """Ensure API key encryption key exists."""
        api_key_encryption_key_id = "api_key_encryption_key"
        if not self.key_manager.get_key(api_key_encryption_key_id):
            logger.info("Creating API key encryption key")
            self.key_manager.generate_key(
                key_id=api_key_encryption_key_id,
                key_type=KeyType.API_KEY_ENCRYPTION,
                rotation_schedule_days=self.config.api_key_rotation_days
            )
    
    def _generate_api_key(self) -> str:
        """Generate a secure API key."""
        # Generate a cryptographically secure API key
        return f"rk_{secrets.token_urlsafe(32)}"
    
    def _encrypt_api_key(self, api_key: str, key_id: str) -> str:
        """Encrypt an API key for storage."""
        try:
            encryption_key = self.key_manager.get_key("api_key_encryption_key")
            if not encryption_key:
                raise ValueError("API key encryption key not found")
            
            encrypted_key = EncryptionUtils.encrypt_field(
                data=api_key,
                key=encryption_key,
                field_name=f"api_key_{key_id}"
            )
            
            return encrypted_key
            
        except Exception as e:
            logger.error(f"Failed to encrypt API key: {e}")
            raise
    
    def _decrypt_api_key(self, encrypted_key: str, key_id: str) -> str:
        """Decrypt an API key from storage."""
        try:
            encryption_key = self.key_manager.get_key("api_key_encryption_key")
            if not encryption_key:
                raise ValueError("API key encryption key not found")
            
            decrypted_key = EncryptionUtils.decrypt_field(
                encrypted_data=encrypted_key,
                key=encryption_key,
                field_name=f"api_key_{key_id}"
            )
            
            return decrypted_key
            
        except Exception as e:
            logger.error(f"Failed to decrypt API key: {e}")
            raise
    
    def create_api_key(
        self,
        name: str,
        description: Optional[str] = None,
        user_id: Optional[str] = None,
        scopes: Optional[Set[APIKeyScope]] = None,
        expires_in_days: Optional[int] = None,
        rate_limit_per_minute: Optional[int] = None,
        rate_limit_burst: Optional[int] = None,
        ip_whitelist: Optional[List[str]] = None,
        ip_blacklist: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, APIKeyMetadata]:
        """
        Create a new API key.
        
        Args:
            name: Human-readable name for the API key
            description: Description of the API key's purpose
            user_id: User ID who owns the API key
            scopes: Set of permissions/scopes for the API key
            expires_in_days: Days until the key expires (None for no expiration)
            rate_limit_per_minute: Rate limit per minute
            rate_limit_burst: Burst rate limit
            ip_whitelist: List of allowed IP addresses
            ip_blacklist: List of blocked IP addresses
            metadata: Additional metadata
            
        Returns:
            Tuple of (api_key, metadata)
        """
        try:
            # Generate unique key ID
            key_id = f"api_key_{secrets.token_urlsafe(16)}"
            
            # Generate API key
            api_key = self._generate_api_key()
            
            # Set default scopes if not provided
            if scopes is None:
                scopes = {APIKeyScope.READ_ONLY}
            
            # Set default rate limits if not provided
            if rate_limit_per_minute is None:
                rate_limit_per_minute = self.config.rate_limit_requests_per_minute
            if rate_limit_burst is None:
                rate_limit_burst = self.config.rate_limit_burst_size
            
            # Calculate expiration date
            expires_at = None
            if expires_in_days:
                expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
            
            # Create metadata
            metadata_obj = APIKeyMetadata(
                key_id=key_id,
                name=name,
                description=description,
                user_id=user_id,
                status=APIKeyStatus.ACTIVE,
                scopes=scopes,
                created_at=datetime.utcnow(),
                expires_at=expires_at,
                last_used=None,
                usage_count=0,
                rate_limit_per_minute=rate_limit_per_minute,
                rate_limit_burst=rate_limit_burst,
                ip_whitelist=ip_whitelist,
                ip_blacklist=ip_blacklist,
                metadata=metadata or {}
            )
            
            # Encrypt and store API key
            encrypted_key = self._encrypt_api_key(api_key, key_id)
            
            # Store metadata (in production, this would be in a database)
            self._api_key_metadata[key_id] = metadata_obj
            
            # Initialize usage tracking
            self._api_key_usage[key_id] = []
            
            # Log API key creation
            log_security_event(SecurityEvent(
                event_id=f"api_key_created_{key_id}",
                event_type=SecurityEventType.API_KEY_CREATED,
                severity=SecurityEventSeverity.LOW,
                timestamp=datetime.utcnow(),
                user_id=user_id,
                resource=f"api_key:{key_id}",
                action="create",
                result="success",
                details={
                    "key_name": name,
                    "scopes": [scope.value for scope in scopes],
                    "expires_at": expires_at.isoformat() if expires_at else None
                }
            ))
            
            logger.info(f"Created API key {key_id} for user {user_id}")
            return api_key, metadata_obj
            
        except Exception as e:
            logger.error(f"Failed to create API key: {e}")
            raise
    
    def validate_api_key(
        self,
        api_key: str,
        required_scopes: Optional[Set[APIKeyScope]] = None,
        ip_address: Optional[str] = None
    ) -> Optional[APIKeyMetadata]:
        """
        Validate an API key and check permissions.
        
        Args:
            api_key: API key to validate
            required_scopes: Required scopes for the operation
            ip_address: Client IP address for IP-based restrictions
            
        Returns:
            APIKeyMetadata if valid, None otherwise
        """
        try:
            # Find the API key by decrypting and comparing
            # In production, this would be more efficient with a hash lookup
            for key_id, metadata in self._api_key_metadata.items():
                try:
                    stored_key = self._decrypt_api_key(api_key, key_id)
                    if stored_key == api_key:
                        # Found the matching key
                        return self._validate_api_key_metadata(
                            metadata, required_scopes, ip_address
                        )
                except Exception:
                    # Continue searching if decryption fails
                    continue
            
            # API key not found
            log_security_event(SecurityEvent(
                event_id=f"api_key_validation_failed_{secrets.token_urlsafe(8)}",
                event_type=SecurityEventType.API_UNAUTHORIZED_ACCESS,
                severity=SecurityEventSeverity.MEDIUM,
                timestamp=datetime.utcnow(),
                ip_address=ip_address,
                resource="api_key",
                action="validate",
                result="failure",
                details={"reason": "key_not_found"}
            ))
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to validate API key: {e}")
            return None
    
    def _validate_api_key_metadata(
        self,
        metadata: APIKeyMetadata,
        required_scopes: Optional[Set[APIKeyScope]] = None,
        ip_address: Optional[str] = None
    ) -> Optional[APIKeyMetadata]:
        """Validate API key metadata and permissions."""
        # Check if key is active
        if metadata.status != APIKeyStatus.ACTIVE:
            log_security_event(SecurityEvent(
                event_id=f"api_key_inactive_{metadata.key_id}",
                event_type=SecurityEventType.API_UNAUTHORIZED_ACCESS,
                severity=SecurityEventSeverity.MEDIUM,
                timestamp=datetime.utcnow(),
                user_id=metadata.user_id,
                ip_address=ip_address,
                resource=f"api_key:{metadata.key_id}",
                action="validate",
                result="failure",
                details={"reason": "key_inactive", "status": metadata.status.value}
            ))
            return None
        
        # Check expiration
        if metadata.expires_at and datetime.utcnow() > metadata.expires_at:
            log_security_event(SecurityEvent(
                event_id=f"api_key_expired_{metadata.key_id}",
                event_type=SecurityEventType.API_UNAUTHORIZED_ACCESS,
                severity=SecurityEventSeverity.MEDIUM,
                timestamp=datetime.utcnow(),
                user_id=metadata.user_id,
                ip_address=ip_address,
                resource=f"api_key:{metadata.key_id}",
                action="validate",
                result="failure",
                details={"reason": "key_expired", "expires_at": metadata.expires_at.isoformat()}
            ))
            return None
        
        # Check IP whitelist
        if metadata.ip_whitelist and ip_address:
            if ip_address not in metadata.ip_whitelist:
                log_security_event(SecurityEvent(
                    event_id=f"api_key_ip_whitelist_violation_{metadata.key_id}",
                    event_type=SecurityEventType.API_UNAUTHORIZED_ACCESS,
                    severity=SecurityEventSeverity.MEDIUM,
                    timestamp=datetime.utcnow(),
                    user_id=metadata.user_id,
                    ip_address=ip_address,
                    resource=f"api_key:{metadata.key_id}",
                    action="validate",
                    result="failure",
                    details={"reason": "ip_not_whitelisted", "ip_address": ip_address}
                ))
                return None
        
        # Check IP blacklist
        if metadata.ip_blacklist and ip_address:
            if ip_address in metadata.ip_blacklist:
                log_security_event(SecurityEvent(
                    event_id=f"api_key_ip_blacklist_violation_{metadata.key_id}",
                    event_type=SecurityEventType.API_UNAUTHORIZED_ACCESS,
                    severity=SecurityEventSeverity.HIGH,
                    timestamp=datetime.utcnow(),
                    user_id=metadata.user_id,
                    ip_address=ip_address,
                    resource=f"api_key:{metadata.key_id}",
                    action="validate",
                    result="failure",
                    details={"reason": "ip_blacklisted", "ip_address": ip_address}
                ))
                return None
        
        # Check required scopes
        if required_scopes:
            if not required_scopes.issubset(metadata.scopes):
                missing_scopes = required_scopes - metadata.scopes
                log_security_event(SecurityEvent(
                    event_id=f"api_key_scope_violation_{metadata.key_id}",
                    event_type=SecurityEventType.API_UNAUTHORIZED_ACCESS,
                    severity=SecurityEventSeverity.MEDIUM,
                    timestamp=datetime.utcnow(),
                    user_id=metadata.user_id,
                    ip_address=ip_address,
                    resource=f"api_key:{metadata.key_id}",
                    action="validate",
                    result="failure",
                    details={
                        "reason": "insufficient_scopes",
                        "missing_scopes": [scope.value for scope in missing_scopes]
                    }
                ))
                return None
        
        # Update usage statistics
        self._update_api_key_usage(metadata.key_id)
        
        return metadata
    
    def _update_api_key_usage(self, key_id: str) -> None:
        """Update API key usage statistics."""
        try:
            if key_id in self._api_key_metadata:
                metadata = self._api_key_metadata[key_id]
                metadata.last_used = datetime.utcnow()
                metadata.usage_count += 1
                
                # Track usage for rate limiting
                if key_id not in self._api_key_usage:
                    self._api_key_usage[key_id] = []
                
                self._api_key_usage[key_id].append(datetime.utcnow())
                
                # Clean up old usage records (keep last 24 hours)
                cutoff_time = datetime.utcnow() - timedelta(hours=24)
                self._api_key_usage[key_id] = [
                    usage_time for usage_time in self._api_key_usage[key_id]
                    if usage_time > cutoff_time
                ]
                
        except Exception as e:
            logger.error(f"Failed to update API key usage: {e}")
    
    def check_rate_limit(self, key_id: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Check if API key is within rate limits.
        
        Args:
            key_id: API key ID
            
        Returns:
            Tuple of (is_allowed, rate_limit_info)
        """
        try:
            if key_id not in self._api_key_metadata:
                return False, {"error": "key_not_found"}
            
            metadata = self._api_key_metadata[key_id]
            current_time = datetime.utcnow()
            
            # Get usage in the last minute
            minute_ago = current_time - timedelta(minutes=1)
            recent_usage = [
                usage_time for usage_time in self._api_key_usage.get(key_id, [])
                if usage_time > minute_ago
            ]
            
            # Check rate limit
            if len(recent_usage) >= metadata.rate_limit_per_minute:
                log_security_event(SecurityEvent(
                    event_id=f"api_key_rate_limit_exceeded_{key_id}",
                    event_type=SecurityEventType.API_RATE_LIMIT_EXCEEDED,
                    severity=SecurityEventSeverity.MEDIUM,
                    timestamp=current_time,
                    user_id=metadata.user_id,
                    resource=f"api_key:{key_id}",
                    action="rate_limit_check",
                    result="exceeded",
                    details={
                        "requests_in_minute": len(recent_usage),
                        "rate_limit": metadata.rate_limit_per_minute
                    }
                ))
                
                return False, {
                    "allowed": False,
                    "requests_in_minute": len(recent_usage),
                    "rate_limit": metadata.rate_limit_per_minute,
                    "reset_time": (minute_ago + timedelta(minutes=1)).isoformat()
                }
            
            return True, {
                "allowed": True,
                "requests_in_minute": len(recent_usage),
                "rate_limit": metadata.rate_limit_per_minute,
                "remaining": metadata.rate_limit_per_minute - len(recent_usage)
            }
            
        except Exception as e:
            logger.error(f"Failed to check rate limit: {e}")
            return False, {"error": str(e)}
    
    def revoke_api_key(self, key_id: str, user_id: Optional[str] = None) -> bool:
        """
        Revoke an API key.
        
        Args:
            key_id: API key ID to revoke
            user_id: User ID requesting revocation (for authorization)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            if key_id not in self._api_key_metadata:
                return False
            
            metadata = self._api_key_metadata[key_id]
            
            # Check authorization if user_id is provided
            if user_id and metadata.user_id != user_id:
                return False
            
            # Revoke the key
            metadata.status = APIKeyStatus.REVOKED
            
            # Log revocation
            log_security_event(SecurityEvent(
                event_id=f"api_key_revoked_{key_id}",
                event_type=SecurityEventType.API_KEY_REVOKED,
                severity=SecurityEventSeverity.MEDIUM,
                timestamp=datetime.utcnow(),
                user_id=user_id,
                resource=f"api_key:{key_id}",
                action="revoke",
                result="success",
                details={"key_name": metadata.name}
            ))
            
            logger.info(f"Revoked API key {key_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to revoke API key: {e}")
            return False
    
    def rotate_api_key(self, key_id: str, user_id: Optional[str] = None) -> Optional[str]:
        """
        Rotate an API key by generating a new one.
        
        Args:
            key_id: API key ID to rotate
            user_id: User ID requesting rotation (for authorization)
            
        Returns:
            New API key if successful, None otherwise
        """
        try:
            if key_id not in self._api_key_metadata:
                return None
            
            metadata = self._api_key_metadata[key_id]
            
            # Check authorization if user_id is provided
            if user_id and metadata.user_id != user_id:
                return None
            
            # Generate new API key
            new_api_key = self._generate_api_key()
            
            # Encrypt and store new key
            encrypted_key = self._encrypt_api_key(new_api_key, key_id)
            
            # Update metadata
            metadata.last_used = datetime.utcnow()
            
            # Log rotation
            log_security_event(SecurityEvent(
                event_id=f"api_key_rotated_{key_id}",
                event_type=SecurityEventType.API_KEY_CREATED,  # Similar to creation
                severity=SecurityEventSeverity.LOW,
                timestamp=datetime.utcnow(),
                user_id=user_id,
                resource=f"api_key:{key_id}",
                action="rotate",
                result="success",
                details={"key_name": metadata.name}
            ))
            
            logger.info(f"Rotated API key {key_id}")
            return new_api_key
            
        except Exception as e:
            logger.error(f"Failed to rotate API key: {e}")
            return None
    
    def get_api_key_metadata(self, key_id: str) -> Optional[APIKeyMetadata]:
        """Get API key metadata."""
        return self._api_key_metadata.get(key_id)
    
    def list_api_keys(
        self,
        user_id: Optional[str] = None,
        status: Optional[APIKeyStatus] = None
    ) -> List[APIKeyMetadata]:
        """List API keys with optional filtering."""
        keys = list(self._api_key_metadata.values())
        
        if user_id:
            keys = [key for key in keys if key.user_id == user_id]
        
        if status:
            keys = [key for key in keys if key.status == status]
        
        return keys
    
    def get_api_key_statistics(self) -> Dict[str, Any]:
        """Get API key statistics."""
        total_keys = len(self._api_key_metadata)
        active_keys = len([k for k in self._api_key_metadata.values() if k.status == APIKeyStatus.ACTIVE])
        expired_keys = len([k for k in self._api_key_metadata.values() if k.expires_at and datetime.utcnow() > k.expires_at])
        revoked_keys = len([k for k in self._api_key_metadata.values() if k.status == APIKeyStatus.REVOKED])
        
        return {
            "total_keys": total_keys,
            "active_keys": active_keys,
            "expired_keys": expired_keys,
            "revoked_keys": revoked_keys,
            "encryption_enabled": self.config.api_key_encryption_enabled,
            "rotation_days": self.config.api_key_rotation_days
        }


# Global API key manager instance
_api_key_manager: Optional[APIKeyManager] = None


def get_api_key_manager() -> APIKeyManager:
    """Get the global API key manager instance."""
    global _api_key_manager
    if _api_key_manager is None:
        _api_key_manager = APIKeyManager()
    return _api_key_manager


def create_api_key(
    name: str,
    description: Optional[str] = None,
    user_id: Optional[str] = None,
    scopes: Optional[Set[APIKeyScope]] = None,
    expires_in_days: Optional[int] = None,
    rate_limit_per_minute: Optional[int] = None,
    rate_limit_burst: Optional[int] = None,
    ip_whitelist: Optional[List[str]] = None,
    ip_blacklist: Optional[List[str]] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Tuple[str, APIKeyMetadata]:
    """Create a new API key."""
    manager = get_api_key_manager()
    return manager.create_api_key(
        name, description, user_id, scopes, expires_in_days,
        rate_limit_per_minute, rate_limit_burst, ip_whitelist, ip_blacklist, metadata
    )


def validate_api_key(
    api_key: str,
    required_scopes: Optional[Set[APIKeyScope]] = None,
    ip_address: Optional[str] = None
) -> Optional[APIKeyMetadata]:
    """Validate an API key."""
    manager = get_api_key_manager()
    return manager.validate_api_key(api_key, required_scopes, ip_address)


def check_api_key_rate_limit(key_id: str) -> Tuple[bool, Dict[str, Any]]:
    """Check API key rate limit."""
    manager = get_api_key_manager()
    return manager.check_rate_limit(key_id)


def revoke_api_key(key_id: str, user_id: Optional[str] = None) -> bool:
    """Revoke an API key."""
    manager = get_api_key_manager()
    return manager.revoke_api_key(key_id, user_id)


def rotate_api_key(key_id: str, user_id: Optional[str] = None) -> Optional[str]:
    """Rotate an API key."""
    manager = get_api_key_manager()
    return manager.rotate_api_key(key_id, user_id)


def list_api_keys(
    user_id: Optional[str] = None,
    status: Optional[APIKeyStatus] = None
) -> List[APIKeyMetadata]:
    """List API keys."""
    manager = get_api_key_manager()
    return manager.list_api_keys(user_id, status)
