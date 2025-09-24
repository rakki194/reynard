"""Comprehensive Security Middleware for Reynard Backend

This module provides advanced security middleware to protect against
SQL injection, XSS, command injection, and other common vulnerabilities.
Now integrated with centralized security error handling, adaptive rate limiting,
and comprehensive analytics.
"""

import logging
import re
from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from .adaptive_rate_limiter import adaptive_rate_limiter
from .security_analytics import SecurityEvent, security_analytics
from .security_config import get_security_config
from .security_error_handler import (
    SecurityEventType,
    SecurityThreatLevel,
    security_error_handler,
)

logger = logging.getLogger(__name__)


class SecurityMiddleware(BaseHTTPMiddleware):
    """Comprehensive security middleware that validates and sanitizes all requests.

    This middleware provides protection against:
    - SQL Injection attacks
    - XSS attacks
    - Command injection
    - Path traversal
    - Information disclosure
    - Malformed requests
    """

    def __init__(self, app: ASGIApp):
        super().__init__(app)

        # Load security configuration
        self.config = get_security_config()

        # Initialize security components
        self.security_error_handler = security_error_handler
        self.rate_limiter = adaptive_rate_limiter
        self.analytics = security_analytics

        # SQL injection patterns
        self.sql_patterns = [
            r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)",
            r"(\b(OR|AND)\s+\d+\s*=\s*\d+)",
            r"(\b(OR|AND)\s+['\"].*['\"]\s*=\s*['\"].*['\"])",
            r"(\b(OR|AND)\s+\w+\s*=\s*\w+)",
            r"(\bUNION\s+SELECT\b)",
            r"(\bDROP\s+TABLE\b)",
            r"(\bDELETE\s+FROM\b)",
            r"(\bINSERT\s+INTO\b)",
            r"(\bUPDATE\s+SET\b)",
            r"(\bEXEC\s*\()",
            r"(\bEXECUTE\s*\()",
            r"(\bSCRIPT\s*\()",
            r"(--|\#|\/\*|\*\/)",
            r"(\bWAITFOR\s+DELAY\b)",
            r"(\bBENCHMARK\s*\()",
            r"(\bSLEEP\s*\()",
            r"(\bPG_SLEEP\s*\()",
            r"(\bLOAD_FILE\s*\()",
            r"(\bINTO\s+OUTFILE\b)",
            r"(\bINTO\s+DUMPFILE\b)",
        ]

        # Command injection patterns
        self.command_patterns = [
            r"(\b(cat|ls|pwd|whoami|id|uname|ps|top|kill|rm|mv|cp|chmod|chown)\b)",
            r"(\b(python|python3|node|npm|pip|apt|yum|brew)\b)",
            r"(\b(curl|wget|nc|netcat|telnet|ssh|scp|rsync)\b)",
            r"(\b(grep|awk|sed|cut|sort|uniq|head|tail)\b)",
            r"(\b(find|locate|which|whereis|file|stat)\b)",
            r"(\b(ifconfig|ip|route|ping|traceroute|nslookup|dig)\b)",
            r"(\b(sudo|su|passwd|useradd|userdel|groupadd|groupdel)\b)",
            r"(\b(systemctl|service|init|rc|chkconfig)\b)",
            r"(\b(mount|umount|fdisk|mkfs|fsck|dd)\b)",
            r"(\b(export|env|set|unset|alias|unalias)\b)",
            r"(\b(history|clear|reset|logout|exit|shutdown|reboot)\b)",
            r"(\b(echo|printf|print|puts|write|read|gets)\b)",
            r"(\b(eval|exec|system|popen|shell_exec|passthru)\b)",
            r"(\b(backtick|`|$\(|subprocess|os\.system|os\.popen)\b)",
            r"(\b(import|from|__import__|reload|execfile)\b)",
            r"(\b(open|file|input|raw_input|compile|exec|eval)\b)",
            r"(\b(globals|locals|vars|dir|hasattr|getattr|setattr)\b)",
            r"(\b(__builtins__|__import__|__name__|__file__|__doc__)\b)",
            r"(\b(exec|eval|compile|__import__|getattr|setattr|delattr)\b)",
        ]

        # XSS patterns
        self.xss_patterns = [
            r"(\b(script|javascript|vbscript|onload|onerror|onclick|onmouseover)\b)",
            r"(\b(alert|confirm|prompt|document\.write|innerHTML|outerHTML)\b)",
            r"(\b(document\.cookie|document\.domain|document\.location)\b)",
            r"(\b(window\.open|window\.location|window\.history)\b)",
            r"(\b(iframe|object|embed|applet|form|input|textarea)\b)",
            r"(\b(style|link|meta|base|title|head|body|html)\b)",
            r"(\b(expression|url|import|charset|http-equiv)\b)",
            r"(\b(data:|javascript:|vbscript:|file:|ftp:|gopher:)\b)",
            r"(\b(&lt;|&gt;|&amp;|&quot;|&#x27;|&#x2F;)\b)",
            r"(\b(\%3C|\%3E|\%22|\%27|\%2F|\%3D|\%3B)\b)",
        ]

        # Path traversal patterns
        self.path_traversal_patterns = [
            r"(\b(\.\.\/|\.\.\\\|\.\.%2F|\.\.%5C)\b)",
            r"(\b(\.\.%252F|\.\.%255C|\.\.%c0%af|\.\.%c1%9c)\b)",
            r"(\b(\.\.%2e%2f|\.\.%2e%5c|\.\.%252e%252f|\.\.%252e%255c)\b)",
            r"(\b(\.\.%c0%2f|\.\.%c1%9c|\.\.%c0%af|\.\.%c1%9c)\b)",
        ]

        # Null byte injection patterns
        self.null_byte_patterns = [
            r"(\x00)",  # Null byte
            r"(%00)",  # URL encoded null byte
            r"(\u0000)",  # Unicode null
        ]

        # LDAP injection patterns
        self.ldap_patterns = [
            r"(\*\)\()",  # *)(uid=*
            r"(\*\)\)\()",  # *))(|(uid=*
        ]

        # NoSQL injection patterns
        self.nosql_patterns = [
            r"(\$\w+\s*:\s*[^}]+)",  # MongoDB operators like $ne, $gt, $regex
            r"(\$\w+\s*:\s*null)",  # $ne: null
            r"(\$\w+\s*:\s*\"\")",  # $gt: ""
            r"(\$\w+\s*:\s*\".*?\")",  # $regex: ".*"
            r"(\$\w+\s*:\s*\"[^\"]*?\")",  # $where: "this.username == 'admin'"
            r"(\$\w+\s*:\s*\[)",  # $or: [
            r"(\$\w+\s*:\s*\{)",  # $and: {
            r"(\$\w+\s*:\s*true)",  # $exists: true
            r"(\$\w+\s*:\s*\"string\")",  # $type: "string"
            r"(\$\w+\s*:\s*\d+)",  # $size: 0, $mod: [10, 0]
        ]

        # Control character patterns (only dangerous ones)
        self.control_char_patterns = [
            # Control chars
            r"(\x00|\x01|\x02|\x03|\x04|\x05|\x06|\x07|\x08|\x0B|\x0C|\x0E|\x0F)",
            # More control chars
            r"(\x10|\x11|\x12|\x13|\x14|\x15|\x16|\x17|\x18|\x19|\x1A|\x1B|\x1C|\x1D|\x1E|\x1F)",
            # Only dangerous control chars (DEL and unit separator)
            r"(\x1F|\x7F)",
        ]

        # Dangerous file extensions
        self.dangerous_extensions = [
            ".exe",
            ".bat",
            ".cmd",
            ".com",
            ".pif",
            ".scr",
            ".vbs",
            ".js",
            ".jar",
            ".war",
            ".ear",
            ".class",
            ".py",
            ".pyc",
            ".pyo",
            ".pyd",
            ".php",
            ".phtml",
            ".php3",
            ".php4",
            ".php5",
            ".pl",
            ".cgi",
            ".sh",
            ".bash",
            ".zsh",
            ".fish",
            ".ps1",
            ".psm1",
            ".psd1",
            ".app",
            ".deb",
            ".rpm",
            ".msi",
            ".dmg",
            ".pkg",
            ".tar",
            ".zip",
            ".rar",
            ".7z",
            ".gz",
            ".bz2",
            ".xz",
            ".lzma",
            ".lz4",
            ".zst",
        ]

    async def dispatch(self, request: Request, call_next):
        """Process the request through comprehensive security validation."""
        # Check if security is enabled
        if not self.config.enabled:
            return await call_next(request)

        # Skip security checks for excluded paths
        if self.config.should_bypass_security(request.url.path):
            return await call_next(request)

        try:
            # Check adaptive rate limiting
            if self.config.rate_limiting_enabled:
                should_limit, _, limit_details = self.rate_limiter.should_rate_limit(
                    request,
                )
                if should_limit:
                    # Record rate limit event
                    self.analytics.log_event(
                        SecurityEvent(
                            event_type=SecurityEventType.RATE_LIMIT_EXCEEDED,
                            threat_level=SecurityThreatLevel.MEDIUM,
                            request=request,
                            details=limit_details,
                            action_taken="rate_limited",
                        ),
                    )

                    return self.security_error_handler.handle_security_error(
                        event_type=SecurityEventType.RATE_LIMIT_EXCEEDED,
                        request=request,
                        threat_level=SecurityThreatLevel.MEDIUM,
                        details=limit_details,
                        response_action="rate_limit",
                    )

            # Validate request path
            if not self._validate_path(request.url.path):
                return self._handle_security_violation(
                    SecurityEventType.PATH_TRAVERSAL,
                    SecurityThreatLevel.HIGH,
                    request,
                    {"path": request.url.path, "reason": "Invalid path detected"},
                )

            # Validate request headers
            if not self._validate_headers(request.headers):
                return self._handle_security_violation(
                    SecurityEventType.SUSPICIOUS_ACTIVITY,
                    SecurityThreatLevel.MEDIUM,
                    request,
                    {
                        "headers": dict(request.headers),
                        "reason": "Invalid headers detected",
                    },
                )

            # Get request body for validation
            body = await self._get_request_body(request)

            # Validate request body
            if body and not self._validate_body(body, request.url.path):
                return self._handle_security_violation(
                    SecurityEventType.SQL_INJECTION,  # Will be refined by threat detection
                    SecurityThreatLevel.HIGH,
                    request,
                    {"body_sample": body[:200], "reason": "Malicious content detected"},
                )

            # Process the request
            response = await call_next(request)

            # Record successful request
            self.rate_limiter.get_client_profile(
                self._get_client_identifier(request),
            ).add_request()

            # Sanitize response headers
            return self._sanitize_response_headers(response)

        except Exception as e:
            logger.exception("Security middleware error")

            # Record error
            self.rate_limiter.record_error(request, "security_middleware_error")

            return self.security_error_handler.handle_security_error(
                event_type=SecurityEventType.SUSPICIOUS_ACTIVITY,
                request=request,
                threat_level=SecurityThreatLevel.HIGH,
                details={"error": str(e), "reason": "Internal security error"},
                response_action="block",
            )

    def _validate_path(self, path: str) -> bool:
        """Validate the request path for security issues."""
        # Allow basic API paths
        if path in ["/", "/health", "/api/health", "/docs", "/redoc", "/openapi.json"]:
            return True

        # Check for path traversal
        for pattern in self.path_traversal_patterns:
            if re.search(pattern, path, re.IGNORECASE):
                logger.warning("Path traversal attempt detected: %s", path)
                return False

        # Check for dangerous file extensions
        for ext in self.dangerous_extensions:
            if path.lower().endswith(ext):
                logger.warning("Dangerous file extension detected: %s", path)
                return False

        return True

    def _validate_headers(self, headers: dict[str, str]) -> bool:
        """Validate request headers for security issues."""
        # Headers that should be excluded from SQL injection checks
        safe_headers = {
            "accept",
            "accept-encoding",
            "accept-language",
            "cache-control",
            "connection",
            "content-type",
            "content-length",
            "host",
            "user-agent",
            "referer",
            "origin",
            "upgrade-insecure-requests",
        }

        for header_name, header_value in headers.items():
            header_lower = header_name.lower()

            # Skip validation for user-agent header with legitimate tools
            if header_lower == "user-agent" and self._is_legitimate_user_agent(
                header_value,
            ):
                continue

            # Skip SQL injection checks for safe HTTP headers
            if header_lower in safe_headers:
                continue

            # Check for SQL injection in headers (only for non-safe headers)
            for pattern in self.sql_patterns:
                if re.search(pattern, header_value, re.IGNORECASE):
                    logger.warning(
                        "SQL injection attempt in header %s: %s",
                        header_name,
                        header_value,
                    )
                    return False

            # Check for command injection in headers
            for pattern in self.command_patterns:
                if re.search(pattern, header_value, re.IGNORECASE):
                    logger.warning(
                        "Command injection attempt in header %s: %s",
                        header_name,
                        header_value,
                    )
                    return False

        return True

    def _is_legitimate_user_agent(self, user_agent: str) -> bool:
        """Check if user-agent is from a legitimate tool or browser."""
        # Common legitimate user agents that contain command names
        legitimate_patterns = [
            r"^curl/\d+\.\d+\.\d+",  # curl/8.16.0
            r"^wget/\d+\.\d+",  # wget/1.21.3
            r"^python-requests/\d+\.\d+",  # python-requests/2.31.0
            r"^PostmanRuntime/\d+\.\d+",  # PostmanRuntime/7.32.3
            r"^insomnia/\d+\.\d+",  # insomnia/2023.5.8
            r"^httpie/\d+\.\d+",  # httpie/3.2.1
            r"^Mozilla/",  # All browsers
            r"^Opera/",  # Opera browser
            r"^Safari/",  # Safari browser
            r"^Chrome/",  # Chrome browser
            r"^Firefox/",  # Firefox browser
            r"^Edge/",  # Edge browser
            r"^bot/",  # Legitimate bots
            r"^crawler/",  # Web crawlers
            r"^spider/",  # Web spiders
        ]

        for pattern in legitimate_patterns:
            if re.match(pattern, user_agent, re.IGNORECASE):
                return True

        return False

    def _validate_body(self, body: str, path: str) -> bool:
        """Validate request body for security issues."""
        # Skip validation for certain endpoints that need special handling
        skip_validation_paths = [
            "/api/ollama/chat",
            "/api/ollama/assistant",
            "/api/summarization/summarize",
            "/api/rag/query",
            "/api/mcp/tools/call",
        ]

        if any(skip_path in path for skip_path in skip_validation_paths):
            # Apply lighter validation for AI endpoints
            return self._validate_ai_content(body)

        # Full validation for other endpoints
        return self._validate_general_content(body)

    def _validate_ai_content(self, content: str) -> bool:
        """Validate AI-related content with lighter restrictions."""
        # Check for obvious command injection
        for pattern in self.command_patterns[:10]:  # Only check most dangerous patterns
            if re.search(pattern, content, re.IGNORECASE):
                logger.warning(
                    "Command injection attempt in AI content: %s...", content[:100],
                )
                return False

        return True

    def _validate_general_content(self, content: str) -> bool:
        """Validate general content with full security checks."""
        validation_checks = [
            (self.sql_patterns, "SQL injection attempt detected"),
            (self.command_patterns, "Command injection attempt detected"),
            (self.xss_patterns, "XSS attempt detected"),
            (self.path_traversal_patterns, "Path traversal attempt detected"),
            (self.null_byte_patterns, "Null byte injection attempt detected"),
            (self.ldap_patterns, "LDAP injection attempt detected"),
            (self.nosql_patterns, "NoSQL injection attempt detected"),
            (
                self.control_char_patterns,
                "Control character injection attempt detected",
            ),
        ]

        for patterns, message in validation_checks:
            if self._check_patterns(content, patterns, message):
                return False

        return True

    def _check_patterns(self, content: str, patterns: list[str], message: str) -> bool:
        """Check content against a list of patterns."""
        for pattern in patterns:
            if re.search(pattern, content, re.IGNORECASE):
                logger.warning("%s: %s...", message, content[:100])
                return True
        return False

    async def _get_request_body(self, request: Request) -> str | None:
        """Safely get the request body."""
        try:
            body = await request.body()
            if body:
                return body.decode("utf-8", errors="ignore")
        except Exception:
            logger.exception("Error reading request body")
        return None

    def _sanitize_response_headers(self, response) -> Any:
        """Sanitize response headers to prevent information disclosure."""
        # Remove sensitive headers
        sensitive_headers = [
            "server",
            "x-powered-by",
            "x-aspnet-version",
            "x-aspnetmvc-version",
            "x-runtime",
            "x-version",
            "x-framework",
            "x-generator",
        ]

        for header in sensitive_headers:
            if hasattr(response, "headers") and header in response.headers:
                del response.headers[header]

        # Add security headers
        if hasattr(response, "headers"):
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
            response.headers["Content-Security-Policy"] = "default-src 'self'"

        return response

    def _handle_security_violation(
        self,
        event_type: SecurityEventType,
        threat_level: SecurityThreatLevel,
        request: Request,
        details: dict,
    ) -> JSONResponse:
        """Handle security violations with centralized error handling and analytics."""
        # Log security event
        self.analytics.log_event(
            SecurityEvent(
                event_type=event_type,
                threat_level=threat_level,
                request=request,
                details=details,
                action_taken="blocked",
            ),
        )

        # Record security violation in rate limiter
        self.rate_limiter.record_security_violation(
            request, threat_level, event_type.value,
        )

        # Use centralized security error handler
        return self.security_error_handler.handle_security_error(
            event_type=event_type,
            request=request,
            threat_level=threat_level,
            details=details,
            response_action="block",
        )

    def _get_client_identifier(self, request: Request) -> str:
        """Get a unique identifier for the client."""
        # Try to get real IP from headers (for reverse proxy setups)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"

        # Add user agent hash for additional uniqueness
        user_agent = request.headers.get("User-Agent", "")
        user_agent_hash = str(hash(user_agent))[:8]

        return f"{client_ip}:{user_agent_hash}"

    def _security_error(self, message: str, status_code: int) -> JSONResponse:
        """Return a standardized security error response (legacy method)."""
        logger.warning("Security violation: %s", message)
        return JSONResponse(
            status_code=status_code,
            content={
                "error": "Security violation",
                "message": "Request blocked for security reasons",
                "code": "SECURITY_VIOLATION",
            },
        )


def setup_security_middleware(app: ASGIApp) -> ASGIApp:
    """Set up the security middleware with search endpoint exceptions."""
    return SecurityMiddleware(app)
