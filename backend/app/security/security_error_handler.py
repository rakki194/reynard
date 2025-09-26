"""Centralized Security Error Handler for Reynard Backend

This module provides a unified security error handling system that standardizes
security error responses, implements threat detection and response strategies,
and provides comprehensive security metrics collection.
"""

import logging
import time
from enum import Enum
from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class SecurityThreatLevel(Enum):
    """Security threat levels for monitoring and alerting."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SecurityEventType(Enum):
    """Types of security events for categorization."""

    SQL_INJECTION = "sql_injection"
    COMMAND_INJECTION = "command_injection"
    XSS_ATTEMPT = "xss_attempt"
    PATH_TRAVERSAL = "path_traversal"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    AUTHENTICATION_FAILURE = "authentication_failure"
    AUTHORIZATION_VIOLATION = "authorization_violation"
    MALICIOUS_FILE_UPLOAD = "malicious_file_upload"
    BRUTE_FORCE_ATTACK = "brute_force_attack"
    DDoS_ATTEMPT = "ddos_attempt"
    DATA_EXFILTRATION = "data_exfiltration"


class SecurityErrorHandler:
    """Centralized security error handler that provides standardized security error responses,
    threat detection and response strategies, and comprehensive security metrics collection.
    """

    def __init__(self):
        self.security_metrics = {
            "total_security_events": 0,
            "events_by_type": {},
            "events_by_threat_level": {},
            "events_by_ip": {},
            "events_by_user_agent": {},
            "blocked_requests": 0,
            "threat_detection_attempts": 0,
            "threat_detection_successes": 0,
            "response_actions_taken": 0,
        }

        # Threat detection patterns and their severity
        self.threat_patterns = {
            SecurityEventType.SQL_INJECTION: {
                "severity": SecurityThreatLevel.CRITICAL,
                "patterns": [
                    r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)",
                    r"(\b(OR|AND)\s+\d+\s*=\s*\d+)",
                    r"(\bUNION\s+SELECT\b)",
                    r"(\bDROP\s+TABLE\b)",
                ],
            },
            SecurityEventType.COMMAND_INJECTION: {
                "severity": SecurityThreatLevel.CRITICAL,
                "patterns": [
                    r"(\b(cat|ls|pwd|whoami|id|uname|ps|top|kill|rm|mv|cp)\b)",
                    r"(\b(python|python3|node|npm|pip|apt|yum|brew)\b)",
                    r"(\b(curl|wget|nc|netcat|telnet|ssh|scp|rsync)\b)",
                    r"(\b(eval|exec|system|popen|shell_exec|passthru)\b)",
                ],
            },
            SecurityEventType.XSS_ATTEMPT: {
                "severity": SecurityThreatLevel.HIGH,
                "patterns": [
                    r"(\b(script|javascript|vbscript|onload|onerror|onclick)\b)",
                    r"(\b(alert|confirm|prompt|document\.write|innerHTML)\b)",
                    r"(\b(iframe|object|embed|applet|form|input)\b)",
                ],
            },
            SecurityEventType.PATH_TRAVERSAL: {
                "severity": SecurityThreatLevel.HIGH,
                "patterns": [
                    r"(\b(\.\.\/|\.\.\\\|\.\.%2F|\.\.%5C)\b)",
                    r"(\b(\.\.%252F|\.\.%255C|\.\.%c0%af|\.\.%c1%9c)\b)",
                ],
            },
        }

        # Response strategies for different threat levels
        self.response_strategies = {
            SecurityThreatLevel.LOW: self._log_and_monitor,
            SecurityThreatLevel.MEDIUM: self._log_and_rate_limit,
            SecurityThreatLevel.HIGH: self._log_and_block_temporarily,
            SecurityThreatLevel.CRITICAL: self._log_and_block_permanently,
        }

        # IP-based threat tracking
        self.ip_threat_levels: dict[str, SecurityThreatLevel] = {}
        self.ip_blocklist: set = set()
        self.ip_whitelist: set = set()

    def handle_security_error(
        self,
        event_type: SecurityEventType,
        request: Request,
        threat_level: SecurityThreatLevel,
        details: dict[str, Any],
        response_action: str = "block",
    ) -> JSONResponse:
        """Handle security errors with standardized responses and threat detection.

        Args:
            event_type: Type of security event
            request: FastAPI request object
            threat_level: Threat level of the event
            details: Additional details about the event
            response_action: Action to take (block, log, rate_limit)

        Returns:
            JSONResponse: Standardized security error response

        """
        # Update security metrics
        self._update_security_metrics(event_type, threat_level, request, details)

        # Determine response action based on threat level and IP history
        client_ip = self._get_client_ip(request)
        final_action = self._determine_response_action(
            threat_level,
            client_ip,
            response_action,
        )

        # Execute response strategy
        response_strategy = self.response_strategies.get(
            threat_level,
            self._log_and_monitor,
        )
        response_strategy(event_type, request, details, final_action)

        # Create security error response
        response_data = self._create_security_error_response(
            event_type=event_type,
            threat_level=threat_level,
            action=final_action,
            details=details,
            request=request,
        )

        # Log security event
        self._log_security_event(
            event_type,
            threat_level,
            request,
            details,
            final_action,
        )

        # Return appropriate response
        if final_action in ["block", "block_permanently"]:
            return JSONResponse(
                status_code=403,
                content=response_data,
                headers=self._get_security_headers(),
            )
        if final_action == "rate_limit":
            return JSONResponse(
                status_code=429,
                content=response_data,
                headers=self._get_security_headers() | {"Retry-After": "60"},
            )
        return JSONResponse(
            status_code=200,
            content=response_data,
            headers=self._get_security_headers(),
        )

    def detect_threats(self, content: str, request: Request) -> list[dict[str, Any]]:
        """Detect security threats in request content.

        Args:
            content: Content to analyze
            request: FastAPI request object

        Returns:
            List of detected threats with details

        """
        detected_threats = []
        client_ip = self._get_client_ip(request)

        for event_type, config in self.threat_patterns.items():
            for pattern in config["patterns"]:
                import re

                if re.search(pattern, content, re.IGNORECASE):
                    threat = {
                        "event_type": event_type,
                        "threat_level": config["severity"],
                        "pattern_matched": pattern,
                        "content_sample": content[:100],
                        "client_ip": client_ip,
                        "timestamp": time.time(),
                    }
                    detected_threats.append(threat)

        return detected_threats

    def is_ip_blocked(self, ip: str) -> bool:
        """Check if an IP is blocked."""
        return ip in self.ip_blocklist

    def is_ip_whitelisted(self, ip: str) -> bool:
        """Check if an IP is whitelisted."""
        return ip in self.ip_whitelist

    def block_ip(self, ip: str, reason: str = "Security violation") -> None:
        """Block an IP address."""
        self.ip_blocklist.add(ip)
        self.ip_threat_levels[ip] = SecurityThreatLevel.CRITICAL
        logger.warning(f"IP {ip} blocked: {reason}")

    def whitelist_ip(self, ip: str, reason: str = "Manual whitelist") -> None:
        """Whitelist an IP address."""
        self.ip_whitelist.add(ip)
        if ip in self.ip_blocklist:
            self.ip_blocklist.remove(ip)
        logger.info(f"IP {ip} whitelisted: {reason}")

    def get_security_metrics(self) -> dict[str, Any]:
        """Get current security metrics for monitoring."""
        return {
            **self.security_metrics,
            "threat_detection_success_rate": (
                self.security_metrics["threat_detection_successes"]
                / max(1, self.security_metrics["threat_detection_attempts"])
            ),
            "blocked_ips_count": len(self.ip_blocklist),
            "whitelisted_ips_count": len(self.ip_whitelist),
            "active_threat_levels": {
                ip: level.value for ip, level in self.ip_threat_levels.items()
            },
        }

    def reset_metrics(self) -> None:
        """Reset security metrics (useful for testing)."""
        self.security_metrics = {
            "total_security_events": 0,
            "events_by_type": {},
            "events_by_threat_level": {},
            "events_by_ip": {},
            "events_by_user_agent": {},
            "blocked_requests": 0,
            "threat_detection_attempts": 0,
            "threat_detection_successes": 0,
            "response_actions_taken": 0,
        }

    def _update_security_metrics(
        self,
        event_type: SecurityEventType,
        threat_level: SecurityThreatLevel,
        request: Request,
        details: dict[str, Any],
    ) -> None:
        """Update security metrics."""
        self.security_metrics["total_security_events"] += 1

        # Update event type metrics
        event_type_key = event_type.value
        if event_type_key not in self.security_metrics["events_by_type"]:
            self.security_metrics["events_by_type"][event_type_key] = 0
        self.security_metrics["events_by_type"][event_type_key] += 1

        # Update threat level metrics
        threat_level_key = threat_level.value
        if threat_level_key not in self.security_metrics["events_by_threat_level"]:
            self.security_metrics["events_by_threat_level"][threat_level_key] = 0
        self.security_metrics["events_by_threat_level"][threat_level_key] += 1

        # Update IP metrics
        client_ip = self._get_client_ip(request)
        if client_ip not in self.security_metrics["events_by_ip"]:
            self.security_metrics["events_by_ip"][client_ip] = 0
        self.security_metrics["events_by_ip"][client_ip] += 1

        # Update user agent metrics
        user_agent = request.headers.get("User-Agent", "Unknown")
        if user_agent not in self.security_metrics["events_by_user_agent"]:
            self.security_metrics["events_by_user_agent"][user_agent] = 0
        self.security_metrics["events_by_user_agent"][user_agent] += 1

    def _determine_response_action(
        self,
        threat_level: SecurityThreatLevel,
        client_ip: str,
        requested_action: str,
    ) -> str:
        """Determine the appropriate response action based on threat level and IP history."""
        # Check if IP is whitelisted
        if self.is_ip_whitelisted(client_ip):
            return "log"

        # Check if IP is already blocked
        if self.is_ip_blocked(client_ip):
            return "block_permanently"

        # Check IP threat history
        ip_threat_level = self.ip_threat_levels.get(client_ip, SecurityThreatLevel.LOW)

        # Escalate threat level based on history
        if ip_threat_level == SecurityThreatLevel.CRITICAL:
            return "block_permanently"
        if ip_threat_level == SecurityThreatLevel.HIGH:
            return "block"
        if ip_threat_level == SecurityThreatLevel.MEDIUM:
            return "rate_limit"
        return requested_action

    def _create_security_error_response(
        self,
        event_type: SecurityEventType,
        threat_level: SecurityThreatLevel,
        action: str,
        details: dict[str, Any],
        request: Request,
    ) -> dict[str, Any]:
        """Create standardized security error response."""
        response_data = {
            "error": {
                "code": f"SECURITY_{event_type.value.upper()}",
                "message": f"Security violation detected: {event_type.value}",
                "threat_level": threat_level.value,
                "action_taken": action,
                "timestamp": time.time(),
            },
        }

        # Add request information
        response_data["error"]["request_info"] = {
            "ip": self._get_client_ip(request),
            "user_agent": request.headers.get("User-Agent", "Unknown"),
            "path": request.url.path,
            "method": request.method,
        }

        # Add details if provided
        if details:
            response_data["error"]["details"] = self._sanitize_details(details)

        # Add request ID if available
        if hasattr(request.state, "request_id"):
            response_data["error"]["request_id"] = request.state.request_id

        return response_data

    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address from request."""
        # Try to get real IP from headers (for reverse proxy setups)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()

        # Fallback to direct connection
        return request.client.host if request.client else "unknown"

    def _get_security_headers(self) -> dict[str, str]:
        """Get security headers for responses."""
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Content-Security-Policy": "default-src 'self'",
            "X-Security-Event": "true",
        }

    def _sanitize_details(self, details: dict[str, Any]) -> dict[str, Any]:
        """Sanitize details to prevent information disclosure."""
        sanitized = {}

        for key, value in details.items():
            if isinstance(value, str):
                # Truncate long strings
                if len(value) > 200:
                    value = value[:200] + "..."
                # Remove sensitive information
                value = self._remove_sensitive_info(value)
            elif isinstance(value, dict):
                value = self._sanitize_details(value)
            elif isinstance(value, list):
                value = [
                    self._sanitize_details({"item": item})["item"]
                    for item in value[:10]
                ]

            sanitized[key] = value

        return sanitized

    def _remove_sensitive_info(self, text: str) -> str:
        """Remove sensitive information from text."""
        import re

        # Remove file paths
        text = re.sub(r"/[^\s]*", "[PATH]", text)

        # Remove IP addresses
        text = re.sub(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", "[IP]", text)

        # Remove email addresses
        text = re.sub(
            r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
            "[EMAIL]",
            text,
        )

        # Remove tokens and keys
        text = re.sub(r"\b[A-Za-z0-9]{20,}\b", "[TOKEN]", text)

        return text

    def _log_security_event(
        self,
        event_type: SecurityEventType,
        threat_level: SecurityThreatLevel,
        request: Request,
        details: dict[str, Any],
        action: str,
    ) -> None:
        """Log security event with appropriate level."""
        log_data = {
            "event_type": event_type.value,
            "threat_level": threat_level.value,
            "action": action,
            "ip": self._get_client_ip(request),
            "user_agent": request.headers.get("User-Agent", "Unknown"),
            "path": request.url.path,
            "method": request.method,
            "timestamp": time.time(),
        }

        if details:
            log_data["details"] = self._sanitize_details(details)

        # Log with appropriate level based on threat level
        if threat_level == SecurityThreatLevel.CRITICAL:
            logger.critical(f"Critical security event: {log_data}")
        elif threat_level == SecurityThreatLevel.HIGH:
            logger.error(f"High threat security event: {log_data}")
        elif threat_level == SecurityThreatLevel.MEDIUM:
            logger.warning(f"Medium threat security event: {log_data}")
        else:
            logger.info(f"Low threat security event: {log_data}")

    # Response strategies
    def _log_and_monitor(
        self,
        event_type: SecurityEventType,
        request: Request,
        details: dict[str, Any],
        action: str,
    ) -> None:
        """Log and monitor strategy for low-level threats."""
        self.security_metrics["response_actions_taken"] += 1
        logger.info(f"Security event logged and monitored: {event_type.value}")

    def _log_and_rate_limit(
        self,
        event_type: SecurityEventType,
        request: Request,
        details: dict[str, Any],
        action: str,
    ) -> None:
        """Log and rate limit strategy for medium-level threats."""
        self.security_metrics["response_actions_taken"] += 1
        client_ip = self._get_client_ip(request)
        self.ip_threat_levels[client_ip] = SecurityThreatLevel.MEDIUM
        logger.warning(f"Security event logged and rate limited: {event_type.value}")

    def _log_and_block_temporarily(
        self,
        event_type: SecurityEventType,
        request: Request,
        details: dict[str, Any],
        action: str,
    ) -> None:
        """Log and block temporarily strategy for high-level threats."""
        self.security_metrics["response_actions_taken"] += 1
        self.security_metrics["blocked_requests"] += 1
        client_ip = self._get_client_ip(request)
        self.ip_threat_levels[client_ip] = SecurityThreatLevel.HIGH
        logger.error(
            f"Security event logged and temporarily blocked: {event_type.value}",
        )

    def _log_and_block_permanently(
        self,
        event_type: SecurityEventType,
        request: Request,
        details: dict[str, Any],
        action: str,
    ) -> None:
        """Log and block permanently strategy for critical threats."""
        self.security_metrics["response_actions_taken"] += 1
        self.security_metrics["blocked_requests"] += 1
        client_ip = self._get_client_ip(request)
        self.block_ip(client_ip, f"Critical security violation: {event_type.value}")
        logger.critical(
            f"Security event logged and permanently blocked: {event_type.value}",
        )


# Global security error handler instance
security_error_handler = SecurityErrorHandler()
