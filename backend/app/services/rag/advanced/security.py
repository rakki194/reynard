"""Security Service: Enterprise-grade security and compliance features.

This service provides:
- Data encryption and decryption
- Access control and permissions
- Audit logging and compliance
- Security policies and enforcement
- Token management and validation
"""

import logging
import secrets
import time
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Any

logger = logging.getLogger("uvicorn")


class AccessLevel(Enum):
    """Access levels for documents and embeddings."""

    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"


class OperationType(Enum):
    """Types of operations for audit logging."""

    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    SEARCH = "search"
    EMBED = "embed"
    EXPORT = "export"
    IMPORT = "import"


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
    allowed_operations: list[OperationType]
    allowed_users: list[str]
    allowed_roles: list[str]
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
    details: dict[str, Any]
    metadata: dict[str, Any]


class SecurityService:
    """Enterprise-grade security and compliance service."""

    def __init__(self, config: dict[str, Any]):
        self.config = config
        self.enabled = config.get("rag_security_enabled", True)

        # Encryption keys (in production, these would be managed by a key management service)
        self.encryption_keys: dict[AccessLevel, str] = {}

        # Security policies
        self.security_policies: dict[str, SecurityPolicy] = {}

        # Audit logs
        self.audit_logs: list[AuditLog] = []

        # User permissions (simplified for demo)
        self.user_permissions: dict[str, list[str]] = {}

        # Initialize components
        self._initialize_encryption()
        self._initialize_default_policies()

    def _initialize_encryption(self) -> None:
        """Initialize encryption keys for different access levels."""
        if not self.enabled:
            return

        # Generate encryption keys for each access level
        for access_level in AccessLevel:
            # In production, these would be loaded from a secure key management service
            key = secrets.token_hex(32)  # 256-bit key
            self.encryption_keys[access_level] = key

        logger.info("Encryption keys initialized for all access levels")

    def _initialize_default_policies(self) -> None:
        """Initialize default security policies."""
        default_policies = [
            SecurityPolicy(
                policy_id="public_policy",
                name="Public Access Policy",
                description="Policy for public data access",
                access_level=AccessLevel.PUBLIC,
                encryption_required=False,
                audit_required=True,
                retention_days=30,
                allowed_operations=[OperationType.READ, OperationType.SEARCH],
                allowed_users=["*"],  # All users
                allowed_roles=["*"],  # All roles
            ),
            SecurityPolicy(
                policy_id="internal_policy",
                name="Internal Access Policy",
                description="Policy for internal data access",
                access_level=AccessLevel.INTERNAL,
                encryption_required=True,
                audit_required=True,
                retention_days=90,
                allowed_operations=[
                    OperationType.READ,
                    OperationType.SEARCH,
                    OperationType.EMBED,
                ],
                allowed_users=["internal_users"],
                allowed_roles=["developer", "analyst"],
            ),
            SecurityPolicy(
                policy_id="confidential_policy",
                name="Confidential Access Policy",
                description="Policy for confidential data access",
                access_level=AccessLevel.CONFIDENTIAL,
                encryption_required=True,
                audit_required=True,
                retention_days=365,
                allowed_operations=[OperationType.READ, OperationType.SEARCH],
                allowed_users=["authorized_users"],
                allowed_roles=["senior_developer", "manager"],
            ),
            SecurityPolicy(
                policy_id="restricted_policy",
                name="Restricted Access Policy",
                description="Policy for restricted data access",
                access_level=AccessLevel.RESTRICTED,
                encryption_required=True,
                audit_required=True,
                retention_days=2555,  # 7 years
                allowed_operations=[OperationType.READ],
                allowed_users=["admin_users"],
                allowed_roles=["admin", "security_officer"],
            ),
        ]

        for policy in default_policies:
            self.security_policies[policy.policy_id] = policy

        logger.info(f"Initialized {len(default_policies)} default security policies")

    async def encrypt_data(self, data: str, access_level: AccessLevel) -> str:
        """Encrypt data based on access level."""
        if not self.enabled:
            return data

        try:
            # Simple encryption using the access level key
            key = self.encryption_keys.get(access_level)
            if not key:
                raise ValueError(
                    f"No encryption key found for access level: {access_level}",
                )

            # Simple XOR encryption (in production, use proper encryption like AES)
            encrypted_data = ""
            key_bytes = key.encode()
            data_bytes = data.encode()

            for i, byte in enumerate(data_bytes):
                encrypted_data += chr(byte ^ key_bytes[i % len(key_bytes)])

            # Encode as base64-like string
            import base64

            return base64.b64encode(encrypted_data.encode()).decode()

        except Exception as e:
            logger.error(f"Failed to encrypt data: {e}")
            raise

    async def decrypt_data(self, encrypted_data: str, access_level: AccessLevel) -> str:
        """Decrypt data based on access level."""
        if not self.enabled:
            return encrypted_data

        try:
            # Decode from base64-like string
            import base64

            encrypted_bytes = base64.b64decode(encrypted_data.encode()).decode()

            # Simple decryption using the access level key
            key = self.encryption_keys.get(access_level)
            if not key:
                raise ValueError(
                    f"No decryption key found for access level: {access_level}",
                )

            # Simple XOR decryption
            decrypted_data = ""
            key_bytes = key.encode()

            for i, byte in enumerate(encrypted_bytes):
                decrypted_data += chr(ord(byte) ^ key_bytes[i % len(key_bytes)])

            return decrypted_data

        except Exception as e:
            logger.error(f"Failed to decrypt data: {e}")
            raise

    async def check_access_permission(
        self,
        user_id: str,
        operation: OperationType,
        resource_type: str,
        access_level: AccessLevel,
        resource_id: str = "",
    ) -> bool:
        """Check if user has permission to perform operation on resource."""
        if not self.enabled:
            return True

        try:
            # Get policy for the access level
            policy = self._get_policy_for_access_level(access_level)
            if not policy:
                logger.warning(f"No policy found for access level: {access_level}")
                return False

            # Check if operation is allowed
            if operation not in policy.allowed_operations:
                logger.warning(
                    f"Operation {operation} not allowed for access level {access_level}",
                )
                return False

            # Check user access
            if not self._check_user_access(user_id, policy):
                logger.warning(
                    f"User {user_id} not authorized for access level {access_level}",
                )
                return False

            # Log the access attempt
            await self._log_audit_event(
                user_id=user_id,
                operation=operation,
                resource_type=resource_type,
                resource_id=resource_id,
                access_level=access_level,
                success=True,
            )

            return True

        except Exception as e:
            logger.error(f"Access permission check failed: {e}")

            # Log failed access attempt
            await self._log_audit_event(
                user_id=user_id,
                operation=operation,
                resource_type=resource_type,
                resource_id=resource_id,
                access_level=access_level,
                success=False,
                details={"error": str(e)},
            )

            return False

    def _get_policy_for_access_level(
        self, access_level: AccessLevel,
    ) -> SecurityPolicy | None:
        """Get security policy for access level."""
        for policy in self.security_policies.values():
            if policy.access_level == access_level and policy.enabled:
                return policy
        return None

    def _check_user_access(self, user_id: str, policy: SecurityPolicy) -> bool:
        """Check if user has access according to policy."""
        # Check direct user access
        if "*" in policy.allowed_users or user_id in policy.allowed_users:
            return True

        # Check role-based access
        user_roles = self._get_user_roles(user_id)
        if "*" in policy.allowed_roles or any(
            role in policy.allowed_roles for role in user_roles
        ):
            return True

        return False

    def _get_user_roles(self, user_id: str) -> list[str]:
        """Get roles for a user (simplified implementation)."""
        # In production, this would query a user management system
        role_mapping = {
            "admin": ["admin", "security_officer"],
            "developer": ["developer", "senior_developer"],
            "analyst": ["analyst"],
            "manager": ["manager"],
            "user": ["user"],
        }

        return role_mapping.get(user_id, ["user"])

    async def _log_audit_event(
        self,
        user_id: str,
        operation: OperationType,
        resource_type: str,
        resource_id: str,
        access_level: AccessLevel,
        success: bool,
        details: dict[str, Any] | None = None,
        ip_address: str = "127.0.0.1",
        user_agent: str = "system",
    ) -> None:
        """Log audit event."""
        try:
            audit_log = AuditLog(
                log_id=self._generate_log_id(),
                user_id=user_id,
                operation=operation,
                resource_type=resource_type,
                resource_id=resource_id,
                access_level=access_level,
                timestamp=datetime.now(),
                ip_address=ip_address,
                user_agent=user_agent,
                success=success,
                details=details or {},
                metadata={},
            )

            self.audit_logs.append(audit_log)

            # Clean up old audit logs
            self._cleanup_old_audit_logs()

            # Check for suspicious activity
            await self._check_suspicious_activity(audit_log)

        except Exception as e:
            logger.error(f"Failed to log audit event: {e}")

    def _generate_log_id(self) -> str:
        """Generate unique log ID."""
        return f"log_{int(time.time() * 1000)}_{secrets.token_hex(8)}"

    def _cleanup_old_audit_logs(self) -> None:
        """Clean up old audit logs based on retention policies."""
        cutoff_date = datetime.now() - timedelta(days=365)  # Keep logs for 1 year
        self.audit_logs = [
            log for log in self.audit_logs if log.timestamp > cutoff_date
        ]

    async def _check_suspicious_activity(self, audit_log: AuditLog) -> None:
        """Check for suspicious activity patterns."""
        try:
            # Check for multiple failed access attempts
            recent_failures = [
                log
                for log in self.audit_logs
                if (
                    log.user_id == audit_log.user_id
                    and not log.success
                    and log.timestamp > datetime.now() - timedelta(minutes=5)
                )
            ]

            if len(recent_failures) >= 5:
                logger.warning(
                    f"Suspicious activity detected: {len(recent_failures)} failed access attempts by {audit_log.user_id}",
                )

                # In production, this would trigger alerts, lock accounts, etc.
                await self._handle_suspicious_activity(
                    audit_log.user_id, recent_failures,
                )

            # Check for unusual access patterns
            recent_access = [
                log
                for log in self.audit_logs
                if (
                    log.user_id == audit_log.user_id
                    and log.timestamp > datetime.now() - timedelta(hours=1)
                )
            ]

            if len(recent_access) >= 100:  # More than 100 operations in an hour
                logger.warning(
                    f"High activity detected: {len(recent_access)} operations by {audit_log.user_id} in the last hour",
                )

        except Exception as e:
            logger.error(f"Failed to check suspicious activity: {e}")

    async def _handle_suspicious_activity(
        self, user_id: str, failed_attempts: list[AuditLog],
    ) -> None:
        """Handle detected suspicious activity."""
        # In production, this would:
        # - Send alerts to security team
        # - Temporarily lock the account
        # - Require additional authentication
        # - Log to security monitoring system

        logger.warning(
            f"Handling suspicious activity for user {user_id}: {len(failed_attempts)} failed attempts",
        )

    async def get_audit_logs(
        self,
        user_id: str | None = None,
        operation: OperationType | None = None,
        access_level: AccessLevel | None = None,
        hours: int = 24,
    ) -> list[dict[str, Any]]:
        """Get audit logs with optional filtering."""
        try:
            cutoff_time = datetime.now() - timedelta(hours=hours)

            filtered_logs = [
                log for log in self.audit_logs if log.timestamp > cutoff_time
            ]

            # Apply filters
            if user_id:
                filtered_logs = [log for log in filtered_logs if log.user_id == user_id]

            if operation:
                filtered_logs = [
                    log for log in filtered_logs if log.operation == operation
                ]

            if access_level:
                filtered_logs = [
                    log for log in filtered_logs if log.access_level == access_level
                ]

            # Convert to dictionary format
            return [
                {
                    "log_id": log.log_id,
                    "user_id": log.user_id,
                    "operation": log.operation.value,
                    "resource_type": log.resource_type,
                    "resource_id": log.resource_id,
                    "access_level": log.access_level.value,
                    "timestamp": log.timestamp.isoformat(),
                    "ip_address": log.ip_address,
                    "user_agent": log.user_agent,
                    "success": log.success,
                    "details": log.details,
                    "metadata": log.metadata,
                }
                for log in filtered_logs
            ]

        except Exception as e:
            logger.error(f"Failed to get audit logs: {e}")
            return []

    async def get_security_report(self) -> dict[str, Any]:
        """Generate security report."""
        try:
            # Calculate statistics
            total_logs = len(self.audit_logs)
            successful_logs = len([log for log in self.audit_logs if log.success])
            failed_logs = total_logs - successful_logs

            # Recent activity (last 24 hours)
            recent_cutoff = datetime.now() - timedelta(hours=24)
            recent_logs = [
                log for log in self.audit_logs if log.timestamp > recent_cutoff
            ]
            recent_successful = len([log for log in recent_logs if log.success])
            recent_failed = len(recent_logs) - recent_successful

            # Access level distribution
            access_level_counts = {}
            for log in recent_logs:
                level = log.access_level.value
                access_level_counts[level] = access_level_counts.get(level, 0) + 1

            # Operation distribution
            operation_counts = {}
            for log in recent_logs:
                op = log.operation.value
                operation_counts[op] = operation_counts.get(op, 0) + 1

            return {
                "report_timestamp": datetime.now().isoformat(),
                "total_audit_logs": total_logs,
                "success_rate": successful_logs / total_logs if total_logs > 0 else 0,
                "recent_activity": {
                    "total_operations": len(recent_logs),
                    "successful_operations": recent_successful,
                    "failed_operations": recent_failed,
                    "success_rate": (
                        recent_successful / len(recent_logs) if recent_logs else 0
                    ),
                },
                "access_level_distribution": access_level_counts,
                "operation_distribution": operation_counts,
                "active_policies": len(
                    [p for p in self.security_policies.values() if p.enabled],
                ),
                "encryption_enabled": len(self.encryption_keys) > 0,
                "security_features": {
                    "encryption": True,
                    "audit_logging": True,
                    "access_control": True,
                    "suspicious_activity_detection": True,
                },
            }

        except Exception as e:
            logger.error(f"Failed to generate security report: {e}")
            return {"error": str(e)}

    def get_security_stats(self) -> dict[str, Any]:
        """Get security service statistics."""
        return {
            "enabled": self.enabled,
            "total_audit_logs": len(self.audit_logs),
            "active_policies": len(
                [p for p in self.security_policies.values() if p.enabled],
            ),
            "encryption_keys_configured": len(self.encryption_keys),
            "access_levels_supported": len(AccessLevel),
            "operation_types_supported": len(OperationType),
            "recent_logs_24h": len(
                [
                    log
                    for log in self.audit_logs
                    if log.timestamp > datetime.now() - timedelta(hours=24)
                ],
            ),
        }
