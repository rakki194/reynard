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
    
    # Check SQL injection patterns
    for pattern in SQL_INJECTION_PATTERNS:
        if re.search(pattern, input_string, re.IGNORECASE):
            raise ValueError(f"Invalid characters detected in {field_name}")
    
    # Check obfuscation patterns
    for pattern in OBFUSCATION_PATTERNS:
        if re.search(pattern, input_string, re.IGNORECASE):
            raise ValueError(f"Invalid characters detected in {field_name}")
    
    # Check XSS patterns
    for pattern in XSS_PATTERNS:
        if re.search(pattern, input_string, re.IGNORECASE):
            raise ValueError(f"Invalid characters detected in {field_name}")
    
    # Path traversal patterns
    if '..' in input_string or '~' in input_string:
        raise ValueError(f"Invalid characters detected in {field_name}")
    
    # Length validation
    if len(input_string) > 1000:
        raise ValueError(f"{field_name} is too long")
    
    return input_string.strip()
