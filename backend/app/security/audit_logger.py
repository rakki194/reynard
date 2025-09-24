"""🔐 Security Audit Logging System for Reynard Backend

This module provides comprehensive security audit logging with structured
logging, multiple output destinations, and security event tracking.

Key Features:
- Structured JSON logging for security events
- Multiple log destinations (file, database, syslog)
- Security event categorization and severity levels
- Log retention and compression
- Real-time security monitoring
- Compliance-ready audit trails

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import json
import logging
import logging.handlers
import sys
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from enum import Enum
from pathlib import Path
from typing import Any

from app.security.security_config import get_audit_logging_config

logger = logging.getLogger(__name__)


class SecurityEventType(Enum):
    """Types of security events."""

    # Authentication events
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILURE = "login_failure"
    LOGOUT = "logout"
    PASSWORD_CHANGE = "password_change"
    PASSWORD_RESET = "password_reset"

    # Authorization events
    PERMISSION_GRANTED = "permission_granted"
    PERMISSION_DENIED = "permission_denied"
    ROLE_ASSIGNED = "role_assigned"
    ROLE_REVOKED = "role_revoked"

    # Data access events
    DATA_ACCESS = "data_access"
    DATA_MODIFICATION = "data_modification"
    DATA_DELETION = "data_deletion"
    DATA_EXPORT = "data_export"

    # Security violations
    SQL_INJECTION_ATTEMPT = "sql_injection_attempt"
    XSS_ATTEMPT = "xss_attempt"
    CSRF_ATTEMPT = "csrf_attempt"
    BRUTE_FORCE_ATTEMPT = "brute_force_attempt"
    UNAUTHORIZED_ACCESS = "unauthorized_access"

    # System events
    KEY_ROTATION = "key_rotation"
    KEY_REVOCATION = "key_revocation"
    CONFIGURATION_CHANGE = "configuration_change"
    SYSTEM_STARTUP = "system_startup"
    SYSTEM_SHUTDOWN = "system_shutdown"

    # API events
    API_KEY_CREATED = "api_key_created"
    API_KEY_REVOKED = "api_key_revoked"
    API_RATE_LIMIT_EXCEEDED = "api_rate_limit_exceeded"
    API_UNAUTHORIZED_ACCESS = "api_unauthorized_access"


class SecurityEventSeverity(Enum):
    """Security event severity levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class SecurityEvent:
    """Security event data structure."""

    event_id: str
    event_type: SecurityEventType
    severity: SecurityEventSeverity
    timestamp: datetime
    user_id: str | None = None
    session_id: str | None = None
    ip_address: str | None = None
    user_agent: str | None = None
    resource: str | None = None
    action: str | None = None
    result: str | None = None
    details: dict[str, Any] | None = None
    metadata: dict[str, Any] | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for logging."""
        data = asdict(self)
        data["event_type"] = self.event_type.value
        data["severity"] = self.severity.value
        data["timestamp"] = self.timestamp.isoformat()
        return data


class SecurityAuditLogger:
    """Comprehensive security audit logging system.

    This class provides structured logging for security events with
    multiple output destinations and configurable retention policies.
    """

    def __init__(self, config: Any | None = None):
        """Initialize the security audit logger.

        Args:
            config: Audit logging configuration (optional)

        """
        self.config = config or get_audit_logging_config()
        self.logger = self._setup_logger()
        self._setup_handlers()

    def _setup_logger(self) -> logging.Logger:
        """Set up the security audit logger."""
        logger = logging.getLogger("security_audit")
        logger.setLevel(getattr(logging, self.config.log_level.upper()))

        # Prevent duplicate handlers
        if logger.handlers:
            logger.handlers.clear()

        return logger

    def _setup_handlers(self) -> None:
        """Set up log handlers based on configuration."""
        # File handler
        if self.config.enable_file_logging:
            self._setup_file_handler()

        # Database handler
        if self.config.enable_database_logging:
            self._setup_database_handler()

        # Syslog handler
        if self.config.enable_syslog_logging:
            self._setup_syslog_handler()

    def _setup_file_handler(self) -> None:
        """Set up file logging handler."""
        # Create logs directory
        logs_dir = Path("logs")
        logs_dir.mkdir(exist_ok=True)

        # Set up rotating file handler
        log_file = logs_dir / "security_audit.log"
        handler = logging.handlers.RotatingFileHandler(
            log_file, maxBytes=10 * 1024 * 1024, backupCount=5,  # 10MB
        )

        # Set up formatter
        if self.config.log_format.lower() == "json":
            formatter = SecurityJSONFormatter()
        else:
            formatter = SecurityTextFormatter()

        handler.setFormatter(formatter)
        self.logger.addHandler(handler)

    def _setup_database_handler(self) -> None:
        """Set up database logging handler."""
        # TODO: Implement database handler
        # This would write audit logs to a dedicated audit table

    def _setup_syslog_handler(self) -> None:
        """Set up syslog handler."""
        try:
            handler = logging.handlers.SysLogHandler(address="/dev/log")
            formatter = SecurityTextFormatter()
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
        except Exception as e:
            logger.warning(f"Failed to set up syslog handler: {e}")

    def log_event(self, event: SecurityEvent) -> None:
        """Log a security event.

        Args:
            event: Security event to log

        """
        try:
            # Check if this event type should be logged
            if not self._should_log_event(event):
                return

            # Log the event
            if self.config.log_format.lower() == "json":
                self.logger.info(json.dumps(event.to_dict(), default=str))
            else:
                self.logger.info(self._format_event_text(event))

            # Log to console for critical events
            if event.severity == SecurityEventSeverity.CRITICAL:
                print(
                    f"🚨 CRITICAL SECURITY EVENT: {event.event_type.value}",
                    file=sys.stderr,
                )

        except Exception as e:
            logger.error(f"Failed to log security event: {e}")

    def _should_log_event(self, event: SecurityEvent) -> bool:
        """Check if an event should be logged based on configuration."""
        # Check event type filters
        if (
            event.event_type == SecurityEventType.LOGIN_SUCCESS
            and not self.config.log_authentication_events
        ):
            return False
        if (
            event.event_type
            in [
                SecurityEventType.PERMISSION_GRANTED,
                SecurityEventType.PERMISSION_DENIED,
            ]
            and not self.config.log_authorization_events
        ):
            return False
        if (
            event.event_type
            in [SecurityEventType.DATA_ACCESS, SecurityEventType.DATA_MODIFICATION]
            and not self.config.log_data_access_events
        ):
            return False
        if (
            event.severity
            in [SecurityEventSeverity.HIGH, SecurityEventSeverity.CRITICAL]
            and not self.config.log_security_violations
        ):
            return False

        return True

    def _format_event_text(self, event: SecurityEvent) -> str:
        """Format event as human-readable text."""
        timestamp = event.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")
        severity_emoji = {
            SecurityEventSeverity.LOW: "ℹ️",
            SecurityEventSeverity.MEDIUM: "⚠️",
            SecurityEventSeverity.HIGH: "🚨",
            SecurityEventSeverity.CRITICAL: "🔥",
        }

        emoji = severity_emoji.get(event.severity, "📝")

        parts = [
            f"{emoji} [{timestamp}] {event.severity.value.upper()}",
            f"Event: {event.event_type.value}",
            f"ID: {event.event_id}",
        ]

        if event.user_id:
            parts.append(f"User: {event.user_id}")

        if event.ip_address:
            parts.append(f"IP: {event.ip_address}")

        if event.resource:
            parts.append(f"Resource: {event.resource}")

        if event.action:
            parts.append(f"Action: {event.action}")

        if event.result:
            parts.append(f"Result: {event.result}")

        if event.details:
            parts.append(f"Details: {json.dumps(event.details)}")

        return " | ".join(parts)

    def log_authentication_event(
        self,
        event_type: SecurityEventType,
        user_id: str | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        success: bool = True,
        details: dict[str, Any] | None = None,
    ) -> None:
        """Log an authentication event."""
        severity = (
            SecurityEventSeverity.LOW if success else SecurityEventSeverity.MEDIUM
        )

        event = SecurityEvent(
            event_id=self._generate_event_id(),
            event_type=event_type,
            severity=severity,
            timestamp=datetime.now(UTC),
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            result="success" if success else "failure",
            details=details,
        )

        self.log_event(event)

    def log_authorization_event(
        self,
        event_type: SecurityEventType,
        user_id: str,
        resource: str,
        action: str,
        granted: bool = True,
        ip_address: str | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        """Log an authorization event."""
        severity = (
            SecurityEventSeverity.LOW if granted else SecurityEventSeverity.MEDIUM
        )

        event = SecurityEvent(
            event_id=self._generate_event_id(),
            event_type=event_type,
            severity=severity,
            timestamp=datetime.now(UTC),
            user_id=user_id,
            ip_address=ip_address,
            resource=resource,
            action=action,
            result="granted" if granted else "denied",
            details=details,
        )

        self.log_event(event)

    def log_data_access_event(
        self,
        user_id: str,
        resource: str,
        action: str,
        ip_address: str | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        """Log a data access event."""
        event_type = SecurityEventType.DATA_ACCESS
        if action in ["create", "update", "modify"]:
            event_type = SecurityEventType.DATA_MODIFICATION
        elif action == "delete":
            event_type = SecurityEventType.DATA_DELETION
        elif action == "export":
            event_type = SecurityEventType.DATA_EXPORT

        event = SecurityEvent(
            event_id=self._generate_event_id(),
            event_type=event_type,
            severity=SecurityEventSeverity.LOW,
            timestamp=datetime.now(UTC),
            user_id=user_id,
            ip_address=ip_address,
            resource=resource,
            action=action,
            result="success",
            details=details,
        )

        self.log_event(event)

    def log_security_violation(
        self,
        event_type: SecurityEventType,
        severity: SecurityEventSeverity,
        ip_address: str | None = None,
        user_agent: str | None = None,
        resource: str | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        """Log a security violation."""
        event = SecurityEvent(
            event_id=self._generate_event_id(),
            event_type=event_type,
            severity=severity,
            timestamp=datetime.now(UTC),
            ip_address=ip_address,
            user_agent=user_agent,
            resource=resource,
            result="blocked",
            details=details,
        )

        self.log_event(event)

    def log_system_event(
        self, event_type: SecurityEventType, details: dict[str, Any] | None = None,
    ) -> None:
        """Log a system event."""
        event = SecurityEvent(
            event_id=self._generate_event_id(),
            event_type=event_type,
            severity=SecurityEventSeverity.LOW,
            timestamp=datetime.now(UTC),
            details=details,
        )

        self.log_event(event)

    def _generate_event_id(self) -> str:
        """Generate a unique event ID."""
        import uuid

        return str(uuid.uuid4())


class SecurityJSONFormatter(logging.Formatter):
    """JSON formatter for security audit logs."""

    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON."""
        try:
            # Parse JSON from log message
            data = json.loads(record.getMessage())

            # Add standard log fields
            data["logger"] = record.name
            data["level"] = record.levelname
            data["module"] = record.module
            data["function"] = record.funcName
            data["line"] = record.lineno

            return json.dumps(data, default=str)
        except (json.JSONDecodeError, TypeError):
            # Fallback to text format if JSON parsing fails
            return record.getMessage()


class SecurityTextFormatter(logging.Formatter):
    """Text formatter for security audit logs."""

    def __init__(self):
        super().__init__(
            fmt="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S UTC",
        )


# Global security audit logger instance
_security_audit_logger: SecurityAuditLogger | None = None


def get_security_audit_logger() -> SecurityAuditLogger:
    """Get the global security audit logger instance."""
    global _security_audit_logger
    if _security_audit_logger is None:
        _security_audit_logger = SecurityAuditLogger()
    return _security_audit_logger


def log_security_event(event: SecurityEvent) -> None:
    """Log a security event using the global logger."""
    get_security_audit_logger().log_event(event)


def log_authentication_event(
    event_type: SecurityEventType,
    user_id: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    success: bool = True,
    details: dict[str, Any] | None = None,
) -> None:
    """Log an authentication event."""
    get_security_audit_logger().log_authentication_event(
        event_type, user_id, ip_address, user_agent, success, details,
    )


def log_authorization_event(
    event_type: SecurityEventType,
    user_id: str,
    resource: str,
    action: str,
    granted: bool = True,
    ip_address: str | None = None,
    details: dict[str, Any] | None = None,
) -> None:
    """Log an authorization event."""
    get_security_audit_logger().log_authorization_event(
        event_type, user_id, resource, action, granted, ip_address, details,
    )


def log_data_access_event(
    user_id: str,
    resource: str,
    action: str,
    ip_address: str | None = None,
    details: dict[str, Any] | None = None,
) -> None:
    """Log a data access event."""
    get_security_audit_logger().log_data_access_event(
        user_id, resource, action, ip_address, details,
    )


def log_security_violation(
    event_type: SecurityEventType,
    severity: SecurityEventSeverity,
    ip_address: str | None = None,
    user_agent: str | None = None,
    resource: str | None = None,
    details: dict[str, Any] | None = None,
) -> None:
    """Log a security violation."""
    get_security_audit_logger().log_security_violation(
        event_type, severity, ip_address, user_agent, resource, details,
    )


def log_system_event(
    event_type: SecurityEventType, details: dict[str, Any] | None = None,
) -> None:
    """Log a system event."""
    get_security_audit_logger().log_system_event(event_type, details)
