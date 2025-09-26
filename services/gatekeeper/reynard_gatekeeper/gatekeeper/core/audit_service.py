"""Audit service for RBAC operations.

This module provides comprehensive audit logging for all RBAC operations,
including role assignments, permission checks, and access attempts.
"""

import logging
from datetime import UTC, datetime
from enum import Enum
from typing import Any, Optional
from uuid import uuid4

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class AuditEventType(str, Enum):
    """Audit event type enumeration."""

    # Authentication events
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    LOGOUT = "logout"
    TOKEN_REFRESH = "token_refresh"

    # RBAC events
    ROLE_ASSIGNED = "role_assigned"
    ROLE_REMOVED = "role_removed"
    PERMISSION_GRANTED = "permission_granted"
    PERMISSION_DENIED = "permission_denied"
    RBAC_ENABLED = "rbac_enabled"
    RBAC_DISABLED = "rbac_disabled"

    # Advanced RBAC events
    CONDITIONAL_PERMISSION_CREATED = "conditional_permission_created"
    ROLE_ASSIGNMENT_RULE_CREATED = "role_assignment_rule_created"
    ROLE_AUTO_ASSIGNED = "role_auto_assigned"
    ROLE_DELEGATED = "role_delegated"
    ROLE_DELEGATION_REVOKED = "role_delegation_revoked"
    ROLE_HIERARCHY_CREATED = "role_hierarchy_created"
    PERMISSION_OVERRIDE_CREATED = "permission_override_created"

    # Resource access events
    RESOURCE_ACCESS_GRANTED = "resource_access_granted"
    RESOURCE_ACCESS_DENIED = "resource_access_denied"
    RESOURCE_CREATED = "resource_created"
    RESOURCE_UPDATED = "resource_updated"
    RESOURCE_DELETED = "resource_deleted"

    # System events
    SYSTEM_ERROR = "system_error"
    SECURITY_VIOLATION = "security_violation"

    # Security monitoring events
    ANOMALY_DETECTED = "anomaly_detected"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    BRUTE_FORCE_ATTEMPT = "brute_force_attempt"
    PRIVILEGE_ESCALATION_ATTEMPT = "privilege_escalation_attempt"
    DATA_EXFILTRATION_ATTEMPT = "data_exfiltration_attempt"
    UNAUTHORIZED_ACCESS_ATTEMPT = "unauthorized_access_attempt"

    # Compliance events
    DATA_ACCESS_LOGGED = "data_access_logged"
    DATA_RETENTION_APPLIED = "data_retention_applied"
    DATA_DELETION_LOGGED = "data_deletion_logged"
    CONSENT_GIVEN = "consent_given"
    CONSENT_WITHDRAWN = "consent_withdrawn"
    GDPR_REQUEST = "gdpr_request"
    AUDIT_REPORT_GENERATED = "audit_report_generated"


class AuditEvent(BaseModel):
    """Audit event model."""

    id: str = Field(default_factory=lambda: str(uuid4()))
    event_type: AuditEventType = Field(...)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))
    user_id: Optional[str] = Field(default=None)
    username: Optional[str] = Field(default=None)
    session_id: Optional[str] = Field(default=None)
    ip_address: Optional[str] = Field(default=None)
    user_agent: Optional[str] = Field(default=None)

    # Event details
    resource_type: Optional[str] = Field(default=None)
    resource_id: Optional[str] = Field(default=None)
    operation: Optional[str] = Field(default=None)
    role_name: Optional[str] = Field(default=None)
    permission_name: Optional[str] = Field(default=None)

    # Context and metadata
    context: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)

    # Result information
    success: bool = Field(default=True)
    error_message: Optional[str] = Field(default=None)
    duration_ms: Optional[int] = Field(default=None)


class AuditService:
    """Service for managing audit logs."""

    def __init__(self, backend=None):
        """Initialize the audit service.

        Args:
            backend: Optional backend for storing audit logs
        """
        self.backend = backend
        self.logger = logging.getLogger(f"{__name__}.audit")

    async def log_event(self, event: AuditEvent) -> bool:
        """Log an audit event.

        Args:
            event: Audit event to log

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Log to application logger
            self.logger.info(
                f"Audit Event: {event.event_type.value} | "
                f"User: {event.username or 'Unknown'} | "
                f"Resource: {event.resource_type}:{event.resource_id or 'N/A'} | "
                f"Operation: {event.operation or 'N/A'} | "
                f"Success: {event.success}"
            )

            # Store in backend if available
            if self.backend:
                await self.backend.store_audit_event(event.model_dump())

            return True

        except Exception as e:
            self.logger.error(f"Failed to log audit event: {e}")
            return False

    async def log_authentication(
        self,
        event_type: AuditEventType,
        username: str,
        success: bool,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        error_message: Optional[str] = None,
        session_id: Optional[str] = None,
    ) -> bool:
        """Log authentication events.

        Args:
            event_type: Type of authentication event
            username: Username
            success: Whether the operation was successful
            ip_address: Client IP address
            user_agent: Client user agent
            error_message: Error message if failed
            session_id: Session ID

        Returns:
            bool: True if successful, False otherwise
        """
        event = AuditEvent(
            event_type=event_type,
            username=username,
            success=success,
            ip_address=ip_address,
            user_agent=user_agent,
            error_message=error_message,
            session_id=session_id,
        )

        return await self.log_event(event)

    async def log_rbac_operation(
        self,
        event_type: AuditEventType,
        username: str,
        user_id: str,
        role_name: Optional[str] = None,
        permission_name: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        operation: Optional[str] = None,
        success: bool = True,
        error_message: Optional[str] = None,
        context: Optional[dict[str, Any]] = None,
    ) -> bool:
        """Log RBAC operations.

        Args:
            event_type: Type of RBAC event
            username: Username
            user_id: User ID
            role_name: Role name
            permission_name: Permission name
            resource_type: Resource type
            resource_id: Resource ID
            operation: Operation performed
            success: Whether the operation was successful
            error_message: Error message if failed
            context: Additional context

        Returns:
            bool: True if successful, False otherwise
        """
        event = AuditEvent(
            event_type=event_type,
            username=username,
            user_id=user_id,
            role_name=role_name,
            permission_name=permission_name,
            resource_type=resource_type,
            resource_id=resource_id,
            operation=operation,
            success=success,
            error_message=error_message,
            context=context or {},
        )

        return await self.log_event(event)

    async def log_resource_access(
        self,
        username: str,
        user_id: str,
        resource_type: str,
        resource_id: str,
        operation: str,
        success: bool,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        error_message: Optional[str] = None,
        duration_ms: Optional[int] = None,
        context: Optional[dict[str, Any]] = None,
    ) -> bool:
        """Log resource access attempts.

        Args:
            username: Username
            user_id: User ID
            resource_type: Resource type
            resource_id: Resource ID
            operation: Operation attempted
            success: Whether access was granted
            ip_address: Client IP address
            user_agent: Client user agent
            error_message: Error message if failed
            duration_ms: Duration of the operation in milliseconds
            context: Additional context

        Returns:
            bool: True if successful, False otherwise
        """
        event_type = (
            AuditEventType.RESOURCE_ACCESS_GRANTED
            if success
            else AuditEventType.RESOURCE_ACCESS_DENIED
        )

        event = AuditEvent(
            event_type=event_type,
            username=username,
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            operation=operation,
            success=success,
            ip_address=ip_address,
            user_agent=user_agent,
            error_message=error_message,
            duration_ms=duration_ms,
            context=context or {},
        )

        return await self.log_event(event)

    async def log_security_violation(
        self,
        username: Optional[str],
        user_id: Optional[str],
        violation_type: str,
        description: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        context: Optional[dict[str, Any]] = None,
    ) -> bool:
        """Log security violations.

        Args:
            username: Username (if known)
            user_id: User ID (if known)
            violation_type: Type of security violation
            description: Description of the violation
            ip_address: Client IP address
            user_agent: Client user agent
            context: Additional context

        Returns:
            bool: True if successful, False otherwise
        """
        event = AuditEvent(
            event_type=AuditEventType.SECURITY_VIOLATION,
            username=username,
            user_id=user_id,
            success=False,
            error_message=description,
            ip_address=ip_address,
            user_agent=user_agent,
            context={
                "violation_type": violation_type,
                **(context or {}),
            },
        )

        return await self.log_event(event)


# Global audit service instance
audit_service = AuditService()
