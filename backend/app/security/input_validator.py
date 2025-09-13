"""
Advanced Input Validation System for Reynard Backend

This module provides comprehensive input validation and sanitization
to prevent SQL injection, XSS, command injection, and other attacks.
"""

import re
import html
import logging
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, field_validator

logger = logging.getLogger(__name__)


def sanitize_string(v: str) -> str:
    """Sanitize a string input."""
    if not isinstance(v, str):
        v = str(v)
    
    # HTML encode to prevent XSS
    v = html.escape(v, quote=True)
    
    # Remove null bytes
    v = v.replace('\x00', '')
    
    # Limit length to prevent DoS
    if len(v) > 10000:
        raise ValueError("Input too long")
    
    return v


def sanitize_text(v: str) -> str:
    """Sanitize text input for AI content."""
    if not isinstance(v, str):
        v = str(v)
    
    # Remove null bytes
    v = v.replace('\x00', '')
    
    # Limit length to prevent DoS
    if len(v) > 100000:  # Larger limit for AI content
        raise ValueError("Input too long")
    
    # Basic command injection protection
    dangerous_patterns = [
        r'`[^`]*`',  # Backticks
        r'\$\([^)]*\)',  # Command substitution
        r';\s*(cat|ls|pwd|whoami|id|uname|ps|top|kill|rm|mv|cp)',  # Common commands
        r'\|\s*(cat|ls|pwd|whoami|id|uname|ps|top|kill|rm|mv|cp)',  # Pipes to commands
        r'&&\s*(cat|ls|pwd|whoami|id|uname|ps|top|kill|rm|mv|cp)',  # Logical AND
        r'\|\|\s*(cat|ls|pwd|whoami|id|uname|ps|top|kill|rm|mv|cp)',  # Logical OR
    ]
    
    for pattern in dangerous_patterns:
        if re.search(pattern, v, re.IGNORECASE):
            logger.warning(f"Potential command injection detected: {v[:100]}...")
            # Replace with safe placeholder
            v = re.sub(pattern, '[BLOCKED]', v, flags=re.IGNORECASE)
    
    return v


def validate_input_security(input_string: str, field_name: str) -> str:
    """Validate input for security threats including SQL injection, XSS, and obfuscation."""
    if not isinstance(input_string, str):
        raise ValueError(f"{field_name} must be a string")
    
    # Enhanced path traversal patterns
    path_traversal_patterns = [
        r'\.\./',
        r'\.\.\\',
        r'\.\.%2f',
        r'\.\.%5c',
        r'\.\.%252f',
        r'\.\.%255c',
        r'%2e%2e%2f',
        r'%2e%2e%5c',
        r'\.\.%c0%af',
        r'\.\.%c1%9c',
        r'\.\.%c0%2f',
        r'\.\.%c1%af',
        r'~',
        r'%7e',
        r'%2e%2e',
        r'%252e%252e',
    ]
    
    for pattern in path_traversal_patterns:
        if re.search(pattern, input_string, re.IGNORECASE):
            raise ValueError(f"Path traversal attempt detected in {field_name}")
    
    # Enhanced command injection patterns
    command_injection_patterns = [
        r'[;&|`$]',
        r'\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|wget|curl|nc|telnet|ssh|ftp)\b',
        r'\b(rm|del|mkdir|rmdir|copy|move|chmod|chown|kill|killall)\b',
        r'\b(echo|printf|print|system|exec|eval|shell_exec|passthru|proc_open)\b',
        r'`[^`]*`',
        r'\$\([^)]*\)',
        r'%0a|%0d|%00',
    ]
    
    for pattern in command_injection_patterns:
        if re.search(pattern, input_string, re.IGNORECASE):
            raise ValueError(f"Command injection attempt detected in {field_name}")
    
    # Enhanced null byte injection
    if '\x00' in input_string or '%00' in input_string:
        raise ValueError(f"Null byte injection attempt detected in {field_name}")
    
    # Enhanced length validation with field-specific limits
    field_limits = {
        'username': 50,
        'email': 100,
        'password': 128,
        'name': 100,
        'description': 500,
        'default': 1000
    }
    
    max_length = field_limits.get(field_name.lower(), field_limits['default'])
    if len(input_string) > max_length:
        raise ValueError(f"{field_name} exceeds maximum length of {max_length} characters")
    
    # Check for suspicious character sequences
    suspicious_patterns = [
        r'<[^>]*>',  # HTML tags
        r'javascript:',  # JavaScript protocol
        r'data:',  # Data protocol
        r'vbscript:',  # VBScript protocol
        r'expression\s*\(',  # CSS expressions
        r'@import',  # CSS imports
        r'url\s*\(',  # CSS URLs
    ]
    
    for pattern in suspicious_patterns:
        if re.search(pattern, input_string, re.IGNORECASE):
            raise ValueError(f"Suspicious content detected in {field_name}")
    
    return input_string.strip()


class SecureModel(BaseModel):
    """Base model with security enhancements."""
    
    class Config:
        # Prevent arbitrary types
        arbitrary_types_allowed = False
        # Validate assignment
        validate_assignment = True
        # Use enum values
        use_enum_values = True
        # Extra fields not allowed
        extra = 'forbid'


class SecureUserCreate(SecureModel):
    """Secure user creation model."""
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: str = Field(..., max_length=254, description="Email address")
    password: str = Field(..., min_length=8, max_length=128, description="Password")
    full_name: str = Field(..., min_length=1, max_length=100, description="Full name")
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Validate username format and security."""
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError("Username can only contain letters, numbers, underscores, and hyphens")
        
        # Prevent common attack patterns
        if re.search(r'(admin|root|system|test|user|guest)', v, re.IGNORECASE):
            logger.warning(f"Potentially suspicious username: {v}")
        
        return v
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Validate email format and security."""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError("Invalid email format")
        
        # Prevent common attack patterns
        if re.search(r'[<>"\']', v):
            raise ValueError("Email contains invalid characters")
        
        return v.lower()  # Normalize to lowercase
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password security requirements."""
        # Complexity requirements
        if not re.search(r'[A-Z]', v):
            raise ValueError("Password must contain at least one uppercase letter")
        
        if not re.search(r'[a-z]', v):
            raise ValueError("Password must contain at least one lowercase letter")
        
        if not re.search(r'\d', v):
            raise ValueError("Password must contain at least one digit")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError("Password must contain at least one special character")
        
        # Check for common weak passwords
        weak_passwords = [
            'password', '123456', 'password123', 'admin', 'qwerty',
            'letmein', 'welcome', 'monkey', '1234567890', 'abc123'
        ]
        
        if v.lower() in weak_passwords:
            raise ValueError("Password is too common")
        
        return v
    
    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        """Validate and sanitize full name."""
        return sanitize_string(v)


class SecureUserLogin(SecureModel):
    """Secure user login model."""
    username: str = Field(..., min_length=1, max_length=50, description="Username")
    password: str = Field(..., min_length=1, description="Password")
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Validate username format."""
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError("Username can only contain letters, numbers, underscores, and hyphens")
        return v


class SecureChatRequest(SecureModel):
    """Secure chat request model."""
    message: str = Field(..., max_length=100000, description="Chat message")
    model: Optional[str] = Field(None, max_length=100, description="Model name")
    system_prompt: Optional[str] = Field(None, max_length=100000, description="System prompt")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="Temperature")
    max_tokens: Optional[int] = Field(None, ge=1, le=4096, description="Max tokens")
    
    @field_validator('message')
    @classmethod
    def validate_message(cls, v: str) -> str:
        """Validate and sanitize chat message."""
        return sanitize_text(v)
    
    @field_validator('model')
    @classmethod
    def validate_model(cls, v: Optional[str]) -> Optional[str]:
        """Validate model name."""
        if v is None:
            return v
        return sanitize_string(v)
    
    @field_validator('system_prompt')
    @classmethod
    def validate_system_prompt(cls, v: Optional[str]) -> Optional[str]:
        """Validate and sanitize system prompt."""
        if v is None:
            return v
        return sanitize_text(v)


class SecureSummarizationRequest(SecureModel):
    """Secure summarization request model."""
    text: str = Field(..., max_length=100000, description="Text to summarize")
    content_type: str = Field(
        default="general",
        description="Type of content",
        pattern="^(article|code|document|technical|general)$"
    )
    summary_level: str = Field(
        default="detailed",
        description="Level of detail for summary",
        pattern="^(brief|executive|detailed|comprehensive|bullet|tts_optimized)$"
    )
    max_length: Optional[int] = Field(
        default=None,
        description="Maximum length of summary in words",
        ge=10,
        le=5000
    )
    model: Optional[str] = Field(None, max_length=100, description="Model name")
    
    @field_validator('text')
    @classmethod
    def validate_text(cls, v: str) -> str:
        """Validate and sanitize text to summarize."""
        return sanitize_text(v)
    
    @field_validator('model')
    @classmethod
    def validate_model(cls, v: Optional[str]) -> Optional[str]:
        """Validate model name."""
        if v is None:
            return v
        return sanitize_string(v)


def sanitize_input(value: Any) -> Any:
    """Sanitize any input value."""
    if isinstance(value, str):
        # HTML encode
        value = html.escape(value, quote=True)
        # Remove null bytes
        value = value.replace('\x00', '')
        # Limit length
        if len(value) > 10000:
            value = value[:10000]
    elif isinstance(value, dict):
        return {k: sanitize_input(v) for k, v in value.items()}
    elif isinstance(value, list):
        return [sanitize_input(item) for item in value]
    
    return value


def validate_sql_input(value: str) -> bool:
    """Validate input for SQL injection patterns."""
    sql_patterns = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)",
        r"(\b(OR|AND)\s+\d+\s*=\s*\d+)",
        r"(\b(OR|AND)\s+['\"].*['\"]\s*=\s*['\"].*['\"])",
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
    
    for pattern in sql_patterns:
        if re.search(pattern, value, re.IGNORECASE):
            logger.warning(f"SQL injection pattern detected: {value[:100]}...")
            return False
    
    return True


def validate_command_input(value: str) -> bool:
    """Validate input for command injection patterns."""
    command_patterns = [
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
    ]
    
    for pattern in command_patterns:
        if re.search(pattern, value, re.IGNORECASE):
            logger.warning(f"Command injection pattern detected: {value[:100]}...")
            return False
    
    return True


def validate_xss_input(value: str) -> bool:
    """Validate input for XSS patterns."""
    xss_patterns = [
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
    
    for pattern in xss_patterns:
        if re.search(pattern, value, re.IGNORECASE):
            logger.warning(f"XSS pattern detected: {value[:100]}...")
            return False
    
    return True