"""
Comprehensive Security Middleware for Reynard Backend

This module provides advanced security middleware to protect against
SQL injection, XSS, command injection, and other common vulnerabilities.
"""

import re
import logging
import html
from typing import Dict, List, Optional, Any
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)


class SecurityMiddleware(BaseHTTPMiddleware):
    """
    Comprehensive security middleware that validates and sanitizes all requests.
    
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
            r"(\b(open|file|input|raw_input|compile|exec|eval)\b)",
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
            r"(\b(\.\.%252f|\.\.%255c|\.\.%c0%af|\.\.%c1%9c)\b)",
            r"(\b(\.\.%2f|\.\.%5c|\.\.%c0%af|\.\.%c1%9c)\b)",
            r"(\b(\.\.%252f|\.\.%255c|\.\.%c0%af|\.\.%c1%9c)\b)",
            r"(\b(\.\.%2f|\.\.%5c|\.\.%c0%af|\.\.%c1%9c)\b)",
        ]
        
        # Null byte injection patterns
        self.null_byte_patterns = [
            r"(\x00)",  # Null byte
            r"(%00)",   # URL encoded null byte
            r"(\u0000)", # Unicode null
        ]
        
        # LDAP injection patterns
        self.ldap_patterns = [
            r"(\*\)\()",  # *)(uid=*
            r"(\*\)\()",  # *)(|(uid=*
            r"(\*\)\)\()", # *))(|(uid=*
            r"(\*\)\)\()", # *))(|(objectClass=*
            r"(\*\)\)\()", # *))(|(objectClass=user
            r"(\*\)\)\()", # *))(|(objectClass=person
            r"(\*\)\)\()", # *))(|(objectClass=organizationalPerson
            r"(\*\)\)\()", # *))(|(objectClass=inetOrgPerson
        ]
        
        # NoSQL injection patterns
        self.nosql_patterns = [
            r"(\$\w+\s*:\s*[^}]+)",  # MongoDB operators like $ne, $gt, $regex
            r"(\$\w+\s*:\s*null)",   # $ne: null
            r"(\$\w+\s*:\s*\"\")",   # $gt: ""
            r"(\$\w+\s*:\s*\".*?\")", # $regex: ".*"
            r"(\$\w+\s*:\s*\"[^\"]*?\")", # $where: "this.username == 'admin'"
            r"(\$\w+\s*:\s*\[)",     # $or: [
            r"(\$\w+\s*:\s*\{)",     # $and: {
            r"(\$\w+\s*:\s*true)",   # $exists: true
            r"(\$\w+\s*:\s*\"string\")", # $type: "string"
            r"(\$\w+\s*:\s*\d+)",    # $size: 0, $mod: [10, 0]
        ]
        
        # Control character patterns
        self.control_char_patterns = [
            r"(\x00|\x01|\x02|\x03|\x04|\x05|\x06|\x07|\x08|\x0B|\x0C|\x0E|\x0F)",  # Control chars
            r"(\x10|\x11|\x12|\x13|\x14|\x15|\x16|\x17|\x18|\x19|\x1A|\x1B|\x1C|\x1D|\x1E|\x1F)",  # More control chars
            r"(\n|\r|\t|\b|\f|\v)",  # Common control characters
        ]
        
        # Dangerous file extensions
        self.dangerous_extensions = [
            '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
            '.jar', '.war', '.ear', '.class', '.py', '.pyc', '.pyo', '.pyd',
            '.php', '.phtml', '.php3', '.php4', '.php5', '.pl', '.cgi',
            '.sh', '.bash', '.zsh', '.fish', '.ps1', '.psm1', '.psd1',
            '.app', '.deb', '.rpm', '.msi', '.dmg', '.pkg', '.tar', '.zip',
            '.rar', '.7z', '.gz', '.bz2', '.xz', '.lzma', '.lz4', '.zst'
        ]

    async def dispatch(self, request: Request, call_next):
        """Process the request through security validation."""
        try:
            # Allow basic API paths to bypass most validation
            if request.url.path in ['/', '/health', '/api/health', '/docs', '/redoc', '/openapi.json', '/api/docs']:
                response = await call_next(request)
                return self._sanitize_response_headers(response)
            
            # Validate request path
            if not self._validate_path(request.url.path):
                logger.warning(f"Path validation failed for: {request.url.path}")
                return self._security_error("Invalid path detected", status.HTTP_400_BAD_REQUEST)
            
            # Validate request headers
            if not self._validate_headers(request.headers):
                logger.warning(f"Header validation failed for: {request.url.path}")
                return self._security_error("Invalid headers detected", status.HTTP_400_BAD_REQUEST)
            
            # Get request body for validation
            body = await self._get_request_body(request)
            
            # Validate request body
            if body and not self._validate_body(body, request.url.path):
                logger.warning(f"Body validation failed for: {request.url.path}")
                return self._security_error("Malicious content detected", status.HTTP_400_BAD_REQUEST)
            
            # Process the request
            response = await call_next(request)
            
            # Sanitize response headers
            response = self._sanitize_response_headers(response)
            
            return response
            
        except Exception as e:
            logger.error(f"Security middleware error: {e}")
            return self._security_error("Internal security error", status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _validate_path(self, path: str) -> bool:
        """Validate the request path for security issues."""
        # Allow basic API paths
        if path in ['/', '/health', '/api/health', '/docs', '/redoc', '/openapi.json']:
            return True
        
        # Check for path traversal
        for pattern in self.path_traversal_patterns:
            if re.search(pattern, path, re.IGNORECASE):
                logger.warning(f"Path traversal attempt detected: {path}")
                return False
        
        # Check for dangerous file extensions
        for ext in self.dangerous_extensions:
            if path.lower().endswith(ext):
                logger.warning(f"Dangerous file extension detected: {path}")
                return False
        
        return True

    def _validate_headers(self, headers: Dict[str, str]) -> bool:
        """Validate request headers for security issues."""
        # Check for suspicious headers
        suspicious_headers = [
            'x-forwarded-for', 'x-real-ip', 'x-originating-ip',
            'x-remote-ip', 'x-remote-addr', 'x-client-ip'
        ]
        
        # Headers that should be excluded from SQL injection checks
        safe_headers = {
            'accept', 'accept-encoding', 'accept-language', 'cache-control',
            'connection', 'content-type', 'content-length', 'host',
            'user-agent', 'referer', 'origin', 'upgrade-insecure-requests'
        }
        
        for header_name, header_value in headers.items():
            header_lower = header_name.lower()
            
            # Skip validation for user-agent header with legitimate tools
            if header_lower == 'user-agent':
                if self._is_legitimate_user_agent(header_value):
                    continue
            
            # Skip SQL injection checks for safe HTTP headers
            if header_lower in safe_headers:
                continue
            
            # Check for SQL injection in headers (only for non-safe headers)
            for pattern in self.sql_patterns:
                if re.search(pattern, header_value, re.IGNORECASE):
                    logger.warning(f"SQL injection attempt in header {header_name}: {header_value}")
                    return False
            
            # Check for command injection in headers
            for pattern in self.command_patterns:
                if re.search(pattern, header_value, re.IGNORECASE):
                    logger.warning(f"Command injection attempt in header {header_name}: {header_value}")
                    return False
        
        return True

    def _is_legitimate_user_agent(self, user_agent: str) -> bool:
        """Check if user-agent is from a legitimate tool or browser."""
        # Common legitimate user agents that contain command names
        legitimate_patterns = [
            r'^curl/\d+\.\d+\.\d+',  # curl/8.16.0
            r'^wget/\d+\.\d+',       # wget/1.21.3
            r'^python-requests/\d+\.\d+',  # python-requests/2.31.0
            r'^PostmanRuntime/\d+\.\d+',   # PostmanRuntime/7.32.3
            r'^insomnia/\d+\.\d+',   # insomnia/2023.5.8
            r'^httpie/\d+\.\d+',     # httpie/3.2.1
            r'^Mozilla/',            # All browsers
            r'^Opera/',              # Opera browser
            r'^Safari/',             # Safari browser
            r'^Chrome/',             # Chrome browser
            r'^Firefox/',            # Firefox browser
            r'^Edge/',               # Edge browser
            r'^bot/',                # Legitimate bots
            r'^crawler/',            # Web crawlers
            r'^spider/',             # Web spiders
        ]
        
        for pattern in legitimate_patterns:
            if re.match(pattern, user_agent, re.IGNORECASE):
                return True
        
        return False

    def _validate_body(self, body: str, path: str) -> bool:
        """Validate request body for security issues."""
        # Skip validation for certain endpoints that need special handling
        skip_validation_paths = [
            '/api/ollama/chat',
            '/api/ollama/assistant',
            '/api/summarization/summarize',
            '/api/rag/query'
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
                logger.warning(f"Command injection attempt in AI content: {content[:100]}...")
                return False
        
        return True

    def _validate_general_content(self, content: str) -> bool:
        """Validate general content with full security checks."""
        # Check for SQL injection
        for pattern in self.sql_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                logger.warning(f"SQL injection attempt detected: {content[:100]}...")
                return False
        
        # Check for command injection
        for pattern in self.command_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                logger.warning(f"Command injection attempt detected: {content[:100]}...")
                return False
        
        # Check for XSS
        for pattern in self.xss_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                logger.warning(f"XSS attempt detected: {content[:100]}...")
                return False
        
        # Check for path traversal
        for pattern in self.path_traversal_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                logger.warning(f"Path traversal attempt detected: {content[:100]}...")
                return False
        
        # Check for null byte injection
        for pattern in self.null_byte_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                logger.warning(f"Null byte injection attempt detected: {content[:100]}...")
                return False
        
        # Check for LDAP injection
        for pattern in self.ldap_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                logger.warning(f"LDAP injection attempt detected: {content[:100]}...")
                return False
        
        # Check for NoSQL injection
        for pattern in self.nosql_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                logger.warning(f"NoSQL injection attempt detected: {content[:100]}...")
                return False
        
        # Check for control characters
        for pattern in self.control_char_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                logger.warning(f"Control character injection attempt detected: {content[:100]}...")
                return False
        
        return True

    async def _get_request_body(self, request: Request) -> Optional[str]:
        """Safely get the request body."""
        try:
            body = await request.body()
            if body:
                return body.decode('utf-8', errors='ignore')
        except Exception as e:
            logger.error(f"Error reading request body: {e}")
        return None

    def _sanitize_response_headers(self, response) -> Any:
        """Sanitize response headers to prevent information disclosure."""
        # Remove sensitive headers
        sensitive_headers = [
            'server', 'x-powered-by', 'x-aspnet-version', 'x-aspnetmvc-version',
            'x-runtime', 'x-version', 'x-framework', 'x-generator'
        ]
        
        for header in sensitive_headers:
            if hasattr(response, 'headers') and header in response.headers:
                del response.headers[header]
        
        # Add security headers
        if hasattr(response, 'headers'):
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-Frame-Options'] = 'DENY'
            response.headers['X-XSS-Protection'] = '1; mode=block'
            response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
            response.headers['Content-Security-Policy'] = "default-src 'self'"
        
        return response

    def _security_error(self, message: str, status_code: int) -> JSONResponse:
        """Return a standardized security error response."""
        logger.warning(f"Security violation: {message}")
        return JSONResponse(
            status_code=status_code,
            content={
                "error": "Security violation",
                "message": "Request blocked for security reasons",
                "code": "SECURITY_VIOLATION"
            }
        )


def setup_security_middleware(app: ASGIApp) -> ASGIApp:
    """Set up the security middleware."""
    return SecurityMiddleware(app)
