"""SQL Injection Detection Patterns

This module contains comprehensive regex patterns for detecting
SQL injection attempts across different attack vectors.
"""


def get_basic_sql_keywords() -> list[str]:
    """Core SQL keywords commonly used in injection attacks.

    These patterns detect fundamental SQL operations that are typically
    the foundation of injection attempts across different database systems.

    Returns:
        list: Compiled regex patterns for basic SQL keywords

    """
    return [
        r"\b(select|insert|update|delete|drop|create|alter|exec|execute|union|script)\b",
    ]


def get_comment_patterns() -> list[str]:
    """SQL comment patterns used to terminate queries and inject malicious code.

    Detects various comment syntaxes including single-line (--, #) and
    multi-line (/* */) comments that attackers use to bypass input validation.

    Returns:
        list: Compiled regex patterns for SQL comment syntax

    """
    return [
        r"(--|#|/\*|\*/)",
    ]


def get_logic_operator_patterns() -> list[str]:
    """Logic operator patterns for boolean-based SQL injection attacks.

    These patterns detect attempts to manipulate query logic using OR/AND
    operators combined with tautologies (1=1, '1'='1') to bypass
    authentication and authorization mechanisms.

    Returns:
        list: Compiled regex patterns for logic operator attacks

    """
    return [
        r"\b(or|and)\b.*=.*\b(or|and)\b",
        r"\b(or|and)\b.*\d+\s*=\s*\d+",
        r"\b(or|and)\b\s+\d+\s*=\s*\d+",
        r'\b(or|and)\b\s+[\'"]\s*=\s*[\'"]',
        r'\b(or|and)\b\s+[\'"]\d+[\'"]\s*=\s*[\'"]\d+[\'"]',
        r'\b(or|and)\b\s+[\'"]\d+[\'"]\s*=\s*\d+',
        r'\b(or|and)\b\s+\d+\s*=\s*[\'"]\d+[\'"]',
        r"\b(or|and)\b.*1.*=.*1",
        r"\b(or|and)\b.*\'1\'.*=.*\'1\'",
    ]


def get_union_attack_patterns() -> list[str]:
    """UNION-based SQL injection attack patterns.

    Detects attempts to combine results from multiple SELECT statements
    to extract data from different tables or databases. UNION attacks
    are commonly used for data exfiltration in SQL injection scenarios.

    Returns:
        list: Compiled regex patterns for UNION-based attacks

    """
    return [
        r"union.*select",
        r"union.*all.*select",
        r"union\s+select",
        r"union\s+all\s+select",
    ]


def get_function_call_patterns() -> list[str]:
    """Database function call patterns used in SQL injection attacks.

    Detects various database functions including string manipulation,
    time-based delays, file operations, and information gathering
    functions that attackers use to extract data or cause delays.

    Returns:
        list: Compiled regex patterns for malicious function calls

    """
    return [
        r"\b(char|ascii|substring|concat|version|database|user|schema|length|count|sum|avg|max|min)\s*\(",
        r"\b(sleep|waitfor|benchmark|pg_sleep|delay)\s*\(",
        r"\b(load_file|into\s+outfile|into\s+dumpfile|load\s+data)\b",
    ]


def get_information_schema_patterns() -> list[str]:
    """Information schema and system table access patterns.

    Detects attempts to access database metadata, system tables,
    and information schemas that contain sensitive information about
    database structure, users, and permissions.

    Returns:
        list: Compiled regex patterns for information schema access

    """
    return [
        r"\binformation_schema\b",
        r"\bsys\.",
        r"\bmysql\.",
        r"\bpg_",
        r"\bsqlite_",
    ]


def get_time_based_attack_patterns() -> list[str]:
    """Time-based blind SQL injection attack patterns.

    Detects attempts to cause intentional delays in query execution
    to infer information about database structure and data through
    response timing analysis.

    Returns:
        list: Compiled regex patterns for time-based attacks

    """
    return [
        r"\bwaitfor\s+delay\b",
        r"\bsleep\s*\(",
        r"\bbenchmark\s*\(",
        r"\bdelay\s*\(",
    ]


def get_error_based_attack_patterns() -> list[str]:
    """Error-based SQL injection attack patterns.

    Detects attempts to trigger database errors that reveal sensitive
    information through error messages. These attacks exploit functions
    that cause errors when used incorrectly.

    Returns:
        list: Compiled regex patterns for error-based attacks

    """
    return [
        r"\bextractvalue\s*\(",
        r"\bupdatexml\s*\(",
        r"\bexp\s*\(",
        r"\bfloor\s*\(",
        r"\brand\s*\(",
    ]


def get_boolean_based_attack_patterns() -> list[str]:
    """Boolean-based blind SQL injection attack patterns.

    Detects attempts to manipulate query conditions using IF statements,
    CASE expressions, and conditional logic to infer information
    about database content through boolean responses.

    Returns:
        list: Compiled regex patterns for boolean-based attacks

    """
    return [
        r"\bif\s*\(",
        r"\bcase\s+when",
        r"\bwhen\s+.*\s+then",
    ]


def get_stacked_query_patterns() -> list[str]:
    """Stacked query SQL injection attack patterns.

    Detects attempts to execute multiple SQL statements in sequence
    by using semicolon separators. These attacks can perform
    multiple operations in a single request.

    Returns:
        list: Compiled regex patterns for stacked query attacks

    """
    return [
        r";\s*(select|insert|update|delete|drop|create|alter|exec|execute)",
    ]


def get_hex_encoding_patterns() -> list[str]:
    """Hexadecimal encoding patterns used to bypass input filters.

    Detects attempts to encode SQL injection payloads in hexadecimal
    format to evade detection by security filters and input validation.

    Returns:
        list: Compiled regex patterns for hex-encoded attacks

    """
    return [
        r"0x[0-9a-f]+",
        r"0X[0-9A-F]+",
    ]


def get_string_concatenation_patterns() -> list[str]:
    """String concatenation patterns used in SQL injection attacks.

    Detects attempts to manipulate string values using concatenation
    operators and functions to construct malicious SQL statements
    or bypass input validation.

    Returns:
        list: Compiled regex patterns for string concatenation attacks

    """
    return [
        r'[\'"]\s*\+\s*[\'"]',
        r"\bconcat\s*\(",
        r"\bconcat_ws\s*\(",
    ]


def get_subquery_patterns() -> list[str]:
    """Subquery patterns used in advanced SQL injection attacks.

    Detects attempts to embed additional SQL statements within
    parentheses to create nested queries for data extraction
    or system manipulation.

    Returns:
        list: Compiled regex patterns for subquery attacks

    """
    return [
        r"\(\s*select\s+",
        r"\(\s*insert\s+",
        r"\(\s*update\s+",
        r"\(\s*delete\s+",
    ]


def get_privilege_escalation_patterns() -> list[str]:
    """Privilege escalation patterns in SQL injection attacks.

    Detects attempts to manipulate database permissions, grant
    additional privileges, or access administrative functions
    through SQL injection vulnerabilities.

    Returns:
        list: Compiled regex patterns for privilege escalation attacks

    """
    return [
        r"\bgrant\b",
        r"\brevoke\b",
        r"\bprivileges\b",
        r"\badmin\b",
        r"\broot\b",
    ]


def get_all_sql_injection_patterns() -> list[str]:
    """Comprehensive collection of all SQL injection attack patterns.

    This function combines all individual pattern categories into a single
    collection for comprehensive SQL injection detection. It includes
    patterns for all major attack vectors and techniques.

    Returns:
        list: Combined list of all SQL injection detection patterns

    """
    return (
        get_basic_sql_keywords()
        + get_comment_patterns()
        + get_logic_operator_patterns()
        + get_union_attack_patterns()
        + get_function_call_patterns()
        + get_information_schema_patterns()
        + get_time_based_attack_patterns()
        + get_error_based_attack_patterns()
        + get_boolean_based_attack_patterns()
        + get_stacked_query_patterns()
        + get_hex_encoding_patterns()
        + get_string_concatenation_patterns()
        + get_subquery_patterns()
        + get_privilege_escalation_patterns()
    )


# Legacy constants for backward compatibility
BASIC_SQL_KEYWORDS = get_basic_sql_keywords()
COMMENT_PATTERNS = get_comment_patterns()
LOGIC_OPERATOR_PATTERNS = get_logic_operator_patterns()
UNION_ATTACK_PATTERNS = get_union_attack_patterns()
FUNCTION_CALL_PATTERNS = get_function_call_patterns()
INFORMATION_SCHEMA_PATTERNS = get_information_schema_patterns()
TIME_BASED_ATTACK_PATTERNS = get_time_based_attack_patterns()
ERROR_BASED_ATTACK_PATTERNS = get_error_based_attack_patterns()
BOOLEAN_BASED_ATTACK_PATTERNS = get_boolean_based_attack_patterns()
STACKED_QUERY_PATTERNS = get_stacked_query_patterns()
HEX_ENCODING_PATTERNS = get_hex_encoding_patterns()
STRING_CONCATENATION_PATTERNS = get_string_concatenation_patterns()
SUBQUERY_PATTERNS = get_subquery_patterns()
PRIVILEGE_ESCALATION_PATTERNS = get_privilege_escalation_patterns()
SQL_INJECTION_PATTERNS = get_all_sql_injection_patterns()
