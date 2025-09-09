"""
SQL Injection Detection Patterns

This module contains comprehensive regex patterns for detecting
SQL injection attempts across different attack vectors.
"""

# Basic SQL keywords (case-insensitive)
BASIC_SQL_KEYWORDS = [
    r'\b(select|insert|update|delete|drop|create|alter|exec|execute|union|script)\b',
]

# Comment patterns (all variations)
COMMENT_PATTERNS = [
    r'(--|#|/\*|\*/)',
]

# Logic operators (enhanced patterns)
LOGIC_OPERATOR_PATTERNS = [
    r'\b(or|and)\b.*=.*\b(or|and)\b',
    r'\b(or|and)\b.*\d+\s*=\s*\d+',
    r'\b(or|and)\b\s+\d+\s*=\s*\d+',
    r'\b(or|and)\b\s+[\'"]\s*=\s*[\'"]',
    r'\b(or|and)\b\s+[\'"]\d+[\'"]\s*=\s*[\'"]\d+[\'"]',
    r'\b(or|and)\b\s+[\'"]\d+[\'"]\s*=\s*\d+',
    r'\b(or|and)\b\s+\d+\s*=\s*[\'"]\d+[\'"]',
    r'\b(or|and)\b.*1.*=.*1',
    r'\b(or|and)\b.*\'1\'.*=.*\'1\'',
]

# UNION attacks (all variations)
UNION_ATTACK_PATTERNS = [
    r'union.*select',
    r'union.*all.*select',
    r'union\s+select',
    r'union\s+all\s+select',
]

# Function calls (enhanced detection)
FUNCTION_CALL_PATTERNS = [
    r'\b(char|ascii|substring|concat|version|database|user|schema|length|count|sum|avg|max|min)\s*\(',
    r'\b(sleep|waitfor|benchmark|pg_sleep|delay)\s*\(',
    r'\b(load_file|into\s+outfile|into\s+dumpfile|load\s+data)\b',
]

# Information schema (all variations)
INFORMATION_SCHEMA_PATTERNS = [
    r'\binformation_schema\b',
    r'\bsys\.',
    r'\bmysql\.',
    r'\bpg_',
    r'\bsqlite_',
]

# Time-based attacks (enhanced)
TIME_BASED_ATTACK_PATTERNS = [
    r'\bwaitfor\s+delay\b',
    r'\bsleep\s*\(',
    r'\bbenchmark\s*\(',
    r'\bdelay\s*\(',
]

# Error-based attacks (enhanced)
ERROR_BASED_ATTACK_PATTERNS = [
    r'\bextractvalue\s*\(',
    r'\bupdatexml\s*\(',
    r'\bexp\s*\(',
    r'\bfloor\s*\(',
    r'\brand\s*\(',
]

# Boolean-based attacks
BOOLEAN_BASED_ATTACK_PATTERNS = [
    r'\bif\s*\(',
    r'\bcase\s+when',
    r'\bwhen\s+.*\s+then',
]

# Stacked queries (enhanced)
STACKED_QUERY_PATTERNS = [
    r';\s*(select|insert|update|delete|drop|create|alter|exec|execute)',
]

# Hex encoding attempts (enhanced)
HEX_ENCODING_PATTERNS = [
    r'0x[0-9a-f]+',
    r'0X[0-9A-F]+',
]

# String concatenation (enhanced)
STRING_CONCATENATION_PATTERNS = [
    r'[\'"]\s*\+\s*[\'"]',
    r'\bconcat\s*\(',
    r'\bconcat_ws\s*\(',
]

# Subqueries (enhanced)
SUBQUERY_PATTERNS = [
    r'\(\s*select\s+',
    r'\(\s*insert\s+',
    r'\(\s*update\s+',
    r'\(\s*delete\s+',
]

# Privilege escalation
PRIVILEGE_ESCALATION_PATTERNS = [
    r'\bgrant\b',
    r'\brevoke\b',
    r'\bprivileges\b',
    r'\badmin\b',
    r'\broot\b',
]

# Combine all SQL injection patterns
SQL_INJECTION_PATTERNS = (
    BASIC_SQL_KEYWORDS +
    COMMENT_PATTERNS +
    LOGIC_OPERATOR_PATTERNS +
    UNION_ATTACK_PATTERNS +
    FUNCTION_CALL_PATTERNS +
    INFORMATION_SCHEMA_PATTERNS +
    TIME_BASED_ATTACK_PATTERNS +
    ERROR_BASED_ATTACK_PATTERNS +
    BOOLEAN_BASED_ATTACK_PATTERNS +
    STACKED_QUERY_PATTERNS +
    HEX_ENCODING_PATTERNS +
    STRING_CONCATENATION_PATTERNS +
    SUBQUERY_PATTERNS +
    PRIVILEGE_ESCALATION_PATTERNS
)
