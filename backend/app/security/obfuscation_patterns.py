"""
Obfuscation Detection Patterns

This module contains regex patterns for detecting various
obfuscation techniques used in security attacks.
"""

# Comment obfuscation
COMMENT_OBFUSCATION_PATTERNS = [
    r'/\*.*?\*/',
    r'--.*$',
    r'#.*$',
]

# String splitting and concatenation
STRING_OBFUSCATION_PATTERNS = [
    r'[\'"]\s*\+\s*[\'"]',
    r'\bconcat\s*\(',
    r'\bconcat_ws\s*\(',
]

# Function obfuscation
FUNCTION_OBFUSCATION_PATTERNS = [
    r'\bchar\s*\(',
    r'\bchr\s*\(',
    r'\bascii\s*\(',
    r'\bord\s*\(',
]

# Hex obfuscation
HEX_OBFUSCATION_PATTERNS = [
    r'0x[0-9a-f]+',
    r'0X[0-9A-F]+',
]

# Unicode obfuscation
UNICODE_OBFUSCATION_PATTERNS = [
    r'\\u[0-9a-f]{4}',
    r'\\x[0-9a-f]{2}',
]

# Whitespace obfuscation
WHITESPACE_OBFUSCATION_PATTERNS = [
    r'\s+select\s+',
    r'\s+union\s+',
    r'\s+from\s+',
    r'\s+where\s+',
    r'\s+and\s+',
    r'\s+or\s+',
]

# Tab and newline obfuscation
CONTROL_CHARACTER_PATTERNS = [
    r'\t',
    r'\n',
    r'\r',
    r'\s{3,}',  # Multiple consecutive spaces
    r'\0',      # Null byte injection
    r'[\x00-\x1f\x7f-\x9f]',  # Control characters
]

# Advanced encoding
ENCODING_OBFUSCATION_PATTERNS = [
    r'%[0-9a-f]{2}',
    r'&[a-z]+;',
]

# SQL function obfuscation
SQL_FUNCTION_OBFUSCATION_PATTERNS = [
    r'\bif\s*\(',
    r'\bcase\s+when',
    r'\bwhen\s+.*\s+then',
]

# Mathematical obfuscation
MATH_OBFUSCATION_PATTERNS = [
    r'\bfloor\s*\(',
    r'\bceil\s*\(',
    r'\bround\s*\(',
    r'\babs\s*\(',
    r'\bmod\s*\(',
]

# String manipulation obfuscation
STRING_MANIPULATION_OBFUSCATION_PATTERNS = [
    r'\bsubstr\s*\(',
    r'\bsubstring\s*\(',
    r'\bmid\s*\(',
    r'\bleft\s*\(',
    r'\bright\s*\(',
]

# Date/time obfuscation
DATETIME_OBFUSCATION_PATTERNS = [
    r'\bnow\s*\(',
    r'\bcurrent_date\s*\(',
    r'\bcurrent_time\s*\(',
    r'\bcurrent_timestamp\s*\(',
]

# System variable obfuscation
SYSTEM_VARIABLE_OBFUSCATION_PATTERNS = [
    r'@@version',
    r'@@datadir',
    r'@@hostname',
    r'@@port',
    r'@@socket',
]

# Combine all obfuscation patterns
OBFUSCATION_PATTERNS = (
    COMMENT_OBFUSCATION_PATTERNS +
    STRING_OBFUSCATION_PATTERNS +
    FUNCTION_OBFUSCATION_PATTERNS +
    HEX_OBFUSCATION_PATTERNS +
    UNICODE_OBFUSCATION_PATTERNS +
    WHITESPACE_OBFUSCATION_PATTERNS +
    CONTROL_CHARACTER_PATTERNS +
    ENCODING_OBFUSCATION_PATTERNS +
    SQL_FUNCTION_OBFUSCATION_PATTERNS +
    MATH_OBFUSCATION_PATTERNS +
    STRING_MANIPULATION_OBFUSCATION_PATTERNS +
    DATETIME_OBFUSCATION_PATTERNS +
    SYSTEM_VARIABLE_OBFUSCATION_PATTERNS
)
