"""Security service interfaces.

This module defines the interfaces for security and access control services.

Author: Reynard Development Team
Version: 1.0.0
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from .base import BaseService


class AccessLevel(Enum):
    """Access levels for security."""

    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"


class OperationType(Enum):
    """Types of operations for access control."""

    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    SEARCH = "search"
    EMBED = "embed"
    INDEX = "index"


@dataclass
class SecurityPolicy:
    """Security policy configuration."""

    policy_id: str
    name: str
    description: str
    access_level: AccessLevel
    encryption_required: bool
    audit_required: bool
    retention_days: int
    allowed_operations: List[OperationType]
    allowed_users: List[str]
    allowed_roles: List[str]
    enabled: bool = True


@dataclass
class AuditLog:
    """Audit log entry."""

    log_id: str
    user_id: str
    operation: OperationType
    resource_type: str
    resource_id: str
    access_level: AccessLevel
    timestamp: datetime
    ip_address: str
    user_agent: str
    success: bool
    details: Dict[str, Any]
    metadata: Dict[str, Any]


class ISecurityService(BaseService, ABC):
    """Interface for security and compliance services."""

    @abstractmethod
    async def encrypt_data(self, data: str, access_level: str) -> str:
        """Encrypt data based on access level."""
        pass

    @abstractmethod
    async def decrypt_data(self, encrypted_data: str, access_level: str) -> str:
        """Decrypt data based on access level."""
        pass

    @abstractmethod
    async def check_access_permission(
        self,
        user_id: str,
        operation: str,
        resource_type: str,
        access_level: str,
        resource_id: str = "",
    ) -> bool:
        """Check if user has permission to perform operation on resource."""
        pass

    @abstractmethod
    async def get_audit_logs(
        self,
        user_id: str | None = None,
        operation: str | None = None,
        access_level: str | None = None,
        hours: int = 24,
    ) -> List[Dict[str, Any]]:
        """Get audit logs with optional filtering."""
        pass

    @abstractmethod
    async def get_security_report(self) -> Dict[str, Any]:
        """Generate security report."""
        pass


class SecurityProvider(ABC):
    """Abstract base class for security providers."""

    @abstractmethod
    async def check_permission(
        self,
        user_id: str,
        operation: OperationType,
        resource_type: str,
        access_level: AccessLevel,
    ) -> bool:
        """Check user permission."""
        pass

    @abstractmethod
    async def encrypt(
        self,
        data: str,
        access_level: AccessLevel,
    ) -> str:
        """Encrypt data."""
        pass

    @abstractmethod
    async def decrypt(
        self,
        encrypted_data: str,
        access_level: AccessLevel,
    ) -> str:
        """Decrypt data."""
        pass

    @abstractmethod
    async def log_audit_event(
        self,
        user_id: str,
        operation: OperationType,
        resource_type: str,
        resource_id: str,
        access_level: AccessLevel,
        success: bool,
        details: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Log an audit event."""
        pass
