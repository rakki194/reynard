"""
Input Validator

This module provides the main input validation function that
orchestrates all security pattern checks.
"""

import re
from .sql_injection_patterns import SQL_INJECTION_PATTERNS
from .obfuscation_patterns import OBFUSCATION_PATTERNS
from .xss_patterns import XSS_PATTERNS


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
    
    # Check SQL injection patterns
    for pattern in SQL_INJECTION_PATTERNS:
        if re.search(pattern, input_string, re.IGNORECASE):
            raise ValueError(f"SQL injection attempt detected in {field_name}")
    
    # Check obfuscation patterns
    for pattern in OBFUSCATION_PATTERNS:
        if re.search(pattern, input_string, re.IGNORECASE):
            raise ValueError(f"Obfuscation attempt detected in {field_name}")
    
    # Check XSS patterns
    for pattern in XSS_PATTERNS:
        if re.search(pattern, input_string, re.IGNORECASE):
            raise ValueError(f"XSS attempt detected in {field_name}")
    
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
