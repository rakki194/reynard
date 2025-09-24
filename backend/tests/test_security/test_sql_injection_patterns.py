"""Tests for SQL injection detection patterns.

This module tests the regex patterns used for detecting
SQL injection attack attempts across different attack vectors.
"""

import re

from app.security.sql_injection_patterns import (
    BASIC_SQL_KEYWORDS,
    BOOLEAN_BASED_ATTACK_PATTERNS,
    COMMENT_PATTERNS,
    ERROR_BASED_ATTACK_PATTERNS,
    FUNCTION_CALL_PATTERNS,
    HEX_ENCODING_PATTERNS,
    INFORMATION_SCHEMA_PATTERNS,
    LOGIC_OPERATOR_PATTERNS,
    PRIVILEGE_ESCALATION_PATTERNS,
    SQL_INJECTION_PATTERNS,
    STACKED_QUERY_PATTERNS,
    STRING_CONCATENATION_PATTERNS,
    SUBQUERY_PATTERNS,
    TIME_BASED_ATTACK_PATTERNS,
    UNION_ATTACK_PATTERNS,
)


class TestBasicSqlKeywords:
    """Test basic SQL keyword detection."""

    def test_basic_sql_keywords(self) -> None:
        """Test detection of basic SQL keywords."""
        test_cases = [
            ("SELECT * FROM users", True),
            ("INSERT INTO users VALUES", True),
            ("UPDATE users SET", True),
            ("DELETE FROM users", True),
            ("DROP TABLE users", True),
            ("CREATE TABLE users", True),
            ("ALTER TABLE users", True),
            ("EXEC sp_helpdb", True),
            ("EXECUTE sp_helpdb", True),
            ("UNION SELECT * FROM", True),
            ("SCRIPT database", True),
            ("select * from users", True),  # Case insensitive
            ("Select * From users", True),  # Mixed case
            ("SELECT * FROM users", True),  # Uppercase
            ("hello world", False),
            ("SELECTION", False),  # Partial match
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in BASIC_SQL_KEYWORDS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_sql_keyword_boundaries(self) -> None:
        """Test that SQL keywords are detected with proper word boundaries."""
        test_cases = [
            ("SELECTION", False),  # Should not match "SELECT" in "SELECTION"
            ("UNIONIZE", False),  # Should not match "UNION" in "UNIONIZE"
            ("SELECT * FROM users", True),
            ("UNION SELECT * FROM users", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in BASIC_SQL_KEYWORDS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestCommentPatterns:
    """Test comment pattern detection."""

    def test_comment_patterns(self) -> None:
        """Test detection of comment patterns."""
        test_cases = [
            ("SELECT * FROM users -- comment", True),
            ("SELECT * FROM users # comment", True),
            ("SELECT * FROM users /* comment */", True),
            ("SELECT * FROM users", False),
            ("-- comment", True),
            ("# comment", True),
            ("/* comment */", True),
            ("/* multi\nline\ncomment */", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                for pattern in COMMENT_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_comment_obfuscation(self) -> None:
        """Test detection of comment-based obfuscation."""
        test_cases = [
            ("SELECT/*comment*/ * FROM users", True),
            ("SELECT -- comment\n * FROM users", True),
            ("SELECT # comment\n * FROM users", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                for pattern in COMMENT_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestLogicOperatorPatterns:
    """Test logic operator pattern detection."""

    def test_logic_operator_patterns(self) -> None:
        """Test detection of logic operator patterns."""
        test_cases = [
            ("1' OR '1'='1", True),
            ("1' AND '1'='1", True),
            ("1 OR 1=1", True),
            ("1 AND 1=1", True),
            ("'1' OR '1'='1'", True),
            ("'1' AND '1'='1'", True),
            ("'1' OR '1'='1'", True),
            ("'1' AND '1'='1'", True),
            ("1 OR 1=1", True),
            ("1 AND 1=1", True),
            ("SELECT * FROM users", False),
            ("OR", False),  # Standalone OR
            ("AND", False),  # Standalone AND
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in LOGIC_OPERATOR_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_complex_logic_operators(self) -> None:
        """Test detection of complex logic operator patterns."""
        test_cases = [
            ("admin' OR '1'='1' --", True),
            ("admin' AND '1'='1' --", True),
            ("' OR 1=1 --", True),
            ("' AND 1=1 --", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in LOGIC_OPERATOR_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestUnionAttackPatterns:
    """Test UNION attack pattern detection."""

    def test_union_attack_patterns(self) -> None:
        """Test detection of UNION attack patterns."""
        test_cases = [
            ("UNION SELECT * FROM users", True),
            ("UNION ALL SELECT * FROM users", True),
            ("union select * from users", True),  # Case insensitive
            ("Union Select * From users", True),  # Mixed case
            ("UNION select * from users", True),
            ("union ALL SELECT * FROM users", True),
            ("SELECT * FROM users UNION SELECT * FROM admins", True),
            ("SELECT * FROM users", False),
            ("UNION", False),  # Standalone UNION
            ("SELECT", False),  # Standalone SELECT
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in UNION_ATTACK_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_union_attack_obfuscation(self) -> None:
        """Test detection of obfuscated UNION attacks."""
        test_cases = [
            ("UNION/*comment*/SELECT * FROM users", True),
            ("UNION -- comment\nSELECT * FROM users", True),
            ("UNION\tSELECT * FROM users", True),
            ("UNION\nSELECT * FROM users", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                for pattern in UNION_ATTACK_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestFunctionCallPatterns:
    """Test function call pattern detection."""

    def test_function_call_patterns(self) -> None:
        """Test detection of function call patterns."""
        test_cases = [
            ("char(65)", True),
            ("ascii('A')", True),
            ("substring('hello', 1, 3)", True),
            ("concat('a', 'b')", True),
            ("version()", True),
            ("database()", True),
            ("user()", True),
            ("schema()", True),
            ("length('hello')", True),
            ("count(*)", True),
            ("sum(amount)", True),
            ("avg(price)", True),
            ("max(id)", True),
            ("min(id)", True),
            ("sleep(5)", True),
            ("waitfor delay '00:00:05'", True),
            ("benchmark(1000000, md5('test'))", True),
            ("pg_sleep(5)", True),
            ("delay(5)", True),
            ("load_file('/etc/passwd')", True),
            ("into outfile '/tmp/test.txt'", True),
            ("into dumpfile '/tmp/test.txt'", True),
            ("load data infile '/tmp/test.txt'", True),
            ("SELECT * FROM users", False),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in FUNCTION_CALL_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_function_call_obfuscation(self) -> None:
        """Test detection of obfuscated function calls."""
        test_cases = [
            ("char/*comment*/(65)", True),
            ("ascii--comment\n('A')", True),
            ("substring\t('hello', 1, 3)", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                for pattern in FUNCTION_CALL_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestInformationSchemaPatterns:
    """Test information schema pattern detection."""

    def test_information_schema_patterns(self) -> None:
        """Test detection of information schema patterns."""
        test_cases = [
            ("information_schema.tables", True),
            ("information_schema.columns", True),
            ("sys.tables", True),
            ("sys.columns", True),
            ("mysql.user", True),
            ("mysql.db", True),
            ("pg_tables", True),
            ("pg_columns", True),
            ("sqlite_master", True),
            ("sqlite_temp_master", True),
            ("SELECT * FROM users", False),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in INFORMATION_SCHEMA_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_information_schema_obfuscation(self) -> None:
        """Test detection of obfuscated information schema access."""
        test_cases = [
            ("information_schema/*comment*/.tables", True),
            ("sys--comment\n.tables", True),
            ("mysql\t.user", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                for pattern in INFORMATION_SCHEMA_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestTimeBasedAttackPatterns:
    """Test time-based attack pattern detection."""

    def test_time_based_attack_patterns(self) -> None:
        """Test detection of time-based attack patterns."""
        test_cases = [
            ("waitfor delay '00:00:05'", True),
            ("sleep(5)", True),
            ("benchmark(1000000, md5('test'))", True),
            ("delay(5)", True),
            ("WAITFOR DELAY '00:00:05'", True),  # Case insensitive
            ("SLEEP(5)", True),
            ("BENCHMARK(1000000, MD5('test'))", True),
            ("DELAY(5)", True),
            ("SELECT * FROM users", False),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in TIME_BASED_ATTACK_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_time_based_attack_obfuscation(self) -> None:
        """Test detection of obfuscated time-based attacks."""
        test_cases = [
            ("waitfor/*comment*/delay '00:00:05'", True),
            ("sleep--comment\n(5)", True),
            ("benchmark\t(1000000, md5('test'))", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                for pattern in TIME_BASED_ATTACK_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestErrorBasedAttackPatterns:
    """Test error-based attack pattern detection."""

    def test_error_based_attack_patterns(self) -> None:
        """Test detection of error-based attack patterns."""
        test_cases = [
            ("extractvalue(1, '//a')", True),
            ("updatexml(1, '//a', 'b')", True),
            ("exp(1000)", True),
            ("floor(rand()*2)", True),
            ("rand()", True),
            ("EXTRACTVALUE(1, '//a')", True),  # Case insensitive
            ("UPDATEXML(1, '//a', 'b')", True),
            ("EXP(1000)", True),
            ("FLOOR(RAND()*2)", True),
            ("RAND()", True),
            ("SELECT * FROM users", False),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in ERROR_BASED_ATTACK_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_error_based_attack_obfuscation(self) -> None:
        """Test detection of obfuscated error-based attacks."""
        test_cases = [
            ("extractvalue/*comment*/(1, '//a')", True),
            ("updatexml--comment\n(1, '//a', 'b')", True),
            ("exp\t(1000)", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                for pattern in ERROR_BASED_ATTACK_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestBooleanBasedAttackPatterns:
    """Test boolean-based attack pattern detection."""

    def test_boolean_based_attack_patterns(self) -> None:
        """Test detection of boolean-based attack patterns."""
        test_cases = [
            ("if(1=1, 'true', 'false')", True),
            ("case when 1=1 then 'true' else 'false' end", True),
            ("when 1=1 then 'true'", True),
            ("IF(1=1, 'true', 'false')", True),  # Case insensitive
            ("CASE WHEN 1=1 THEN 'true' ELSE 'false' END", True),
            ("WHEN 1=1 THEN 'true'", True),
            ("SELECT * FROM users", False),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in BOOLEAN_BASED_ATTACK_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_boolean_based_attack_obfuscation(self) -> None:
        """Test detection of obfuscated boolean-based attacks."""
        test_cases = [
            ("if/*comment*/(1=1, 'true', 'false')", True),
            ("case--comment\nwhen 1=1 then 'true'", True),
            ("when\t1=1 then 'true'", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                for pattern in BOOLEAN_BASED_ATTACK_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestStackedQueryPatterns:
    """Test stacked query pattern detection."""

    def test_stacked_query_patterns(self) -> None:
        """Test detection of stacked query patterns."""
        test_cases = [
            ("; SELECT * FROM users", True),
            ("; INSERT INTO users VALUES", True),
            ("; UPDATE users SET", True),
            ("; DELETE FROM users", True),
            ("; DROP TABLE users", True),
            ("; CREATE TABLE users", True),
            ("; ALTER TABLE users", True),
            ("; EXEC sp_helpdb", True),
            ("; EXECUTE sp_helpdb", True),
            ("SELECT * FROM users", False),
            (";", False),  # Standalone semicolon
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in STACKED_QUERY_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_stacked_query_obfuscation(self) -> None:
        """Test detection of obfuscated stacked queries."""
        test_cases = [
            (";/*comment*/SELECT * FROM users", True),
            (";--comment\nSELECT * FROM users", True),
            (";\tSELECT * FROM users", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                for pattern in STACKED_QUERY_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestHexEncodingPatterns:
    """Test hex encoding pattern detection."""

    def test_hex_encoding_patterns(self) -> None:
        """Test detection of hex encoding patterns."""
        test_cases = [
            ("0x414243", True),
            ("0X414243", True),
            ("0xdeadbeef", True),
            ("0XDEADBEEF", True),
            ("0x123", True),
            ("0XABC", True),
            ("SELECT * FROM users", False),
            ("0x", False),  # Incomplete hex
            ("0xg", False),  # Invalid hex
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in HEX_ENCODING_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_hex_encoding_obfuscation(self) -> None:
        """Test detection of hex encoding obfuscation."""
        test_cases = [
            ("0x53454C454354", True),  # "SELECT" in hex
            ("0x554E494F4E", True),  # "UNION" in hex
            ("0x494E53455254", True),  # "INSERT" in hex
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in HEX_ENCODING_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestStringConcatenationPatterns:
    """Test string concatenation pattern detection."""

    def test_string_concatenation_patterns(self) -> None:
        """Test detection of string concatenation patterns."""
        test_cases = [
            ("'hello' + 'world'", True),
            ('"hello" + "world"', True),
            ("concat('hello', 'world')", True),
            ("concat_ws('-', 'a', 'b')", True),
            ("'hello world'", False),
            ("SELECT * FROM users", False),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in STRING_CONCATENATION_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_string_concatenation_obfuscation(self) -> None:
        """Test detection of string concatenation obfuscation."""
        test_cases = [
            ("'sel' + 'ect'", True),
            ("concat('sel', 'ect')", True),
            ("'UNION' + 'SELECT'", True),
            ("concat_ws('', 'UNION', 'SELECT')", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in STRING_CONCATENATION_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestSubqueryPatterns:
    """Test subquery pattern detection."""

    def test_subquery_patterns(self) -> None:
        """Test detection of subquery patterns."""
        test_cases = [
            ("(SELECT * FROM users)", True),
            ("(INSERT INTO users VALUES)", True),
            ("(UPDATE users SET)", True),
            ("(DELETE FROM users)", True),
            ("(select * from users)", True),  # Case insensitive
            ("(Select * From users)", True),  # Mixed case
            ("SELECT * FROM users", False),
            ("()", False),  # Empty parentheses
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE) for pattern in SUBQUERY_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_subquery_obfuscation(self) -> None:
        """Test detection of obfuscated subqueries."""
        test_cases = [
            ("(/*comment*/SELECT * FROM users)", True),
            ("(--comment\nSELECT * FROM users)", True),
            ("(\tSELECT * FROM users)", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                for pattern in SUBQUERY_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestPrivilegeEscalationPatterns:
    """Test privilege escalation pattern detection."""

    def test_privilege_escalation_patterns(self) -> None:
        """Test detection of privilege escalation patterns."""
        test_cases = [
            ("GRANT SELECT ON users TO admin", True),
            ("REVOKE SELECT ON users FROM admin", True),
            ("PRIVILEGES", True),
            ("ADMIN", True),
            ("ROOT", True),
            ("grant select on users to admin", True),  # Case insensitive
            ("revoke select on users from admin", True),
            ("privileges", True),
            ("admin", True),
            ("root", True),
            ("SELECT * FROM users", False),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in PRIVILEGE_ESCALATION_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_privilege_escalation_obfuscation(self) -> None:
        """Test detection of obfuscated privilege escalation."""
        test_cases = [
            ("GRANT/*comment*/SELECT ON users TO admin", True),
            ("REVOKE--comment\nSELECT ON users FROM admin", True),
            ("PRIVILEGES\t", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                for pattern in PRIVILEGE_ESCALATION_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestCombinedSqlInjectionPatterns:
    """Test the combined SQL injection patterns."""

    def test_combined_patterns_structure(self) -> None:
        """Test that all pattern categories are included in combined patterns."""
        expected_categories = [
            BASIC_SQL_KEYWORDS,
            COMMENT_PATTERNS,
            LOGIC_OPERATOR_PATTERNS,
            UNION_ATTACK_PATTERNS,
            FUNCTION_CALL_PATTERNS,
            INFORMATION_SCHEMA_PATTERNS,
            TIME_BASED_ATTACK_PATTERNS,
            ERROR_BASED_ATTACK_PATTERNS,
            BOOLEAN_BASED_ATTACK_PATTERNS,
            STACKED_QUERY_PATTERNS,
            HEX_ENCODING_PATTERNS,
            STRING_CONCATENATION_PATTERNS,
            SUBQUERY_PATTERNS,
            PRIVILEGE_ESCALATION_PATTERNS,
        ]

        total_expected = sum(len(category) for category in expected_categories)
        assert len(SQL_INJECTION_PATTERNS) == total_expected

    def test_combined_patterns_detection(self) -> None:
        """Test detection using combined patterns."""
        test_cases = [
            ("SELECT * FROM users", True),
            ("' OR '1'='1", True),
            ("UNION SELECT * FROM users", True),
            ("char(65)", True),
            ("information_schema.tables", True),
            ("sleep(5)", True),
            ("extractvalue(1, '//a')", True),
            ("if(1=1, 'true', 'false')", True),
            ("; SELECT * FROM users", True),
            ("0x414243", True),
            ("'hello' + 'world'", True),
            ("(SELECT * FROM users)", True),
            ("GRANT SELECT ON users TO admin", True),
            ("normal text", False),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                for pattern in SQL_INJECTION_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_complex_sql_injection_attacks(self) -> None:
        """Test detection of complex SQL injection attacks."""
        test_cases = [
            ("' OR '1'='1' UNION SELECT * FROM users --", True),
            (
                "admin' AND '1'='1' UNION SELECT * FROM information_schema.tables --",
                True,
            ),
            ("' OR 1=1; DROP TABLE users; --", True),
            ("' UNION SELECT char(65), char(66), char(67) --", True),
            ("' OR sleep(5) --", True),
            ("' OR extractvalue(1, '//a') --", True),
            ("' OR if(1=1, 'true', 'false') --", True),
            ("' OR 0x53454C454354 --", True),
            ("' OR 'sel' + 'ect' --", True),
            ("' OR (SELECT * FROM users) --", True),
            ("' OR GRANT SELECT ON users TO admin --", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                for pattern in SQL_INJECTION_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_pattern_performance(self) -> None:
        """Test that patterns can handle reasonable input sizes."""
        # Create a large text with SQL injection patterns
        large_text = "SELECT * FROM users " * 1000 + "' OR '1'='1"

        # This should not take too long
        matches = any(
            re.search(pattern, large_text, re.IGNORECASE | re.MULTILINE)
            for pattern in SQL_INJECTION_PATTERNS
        )
        assert matches is True

    def test_pattern_edge_cases(self) -> None:
        """Test patterns with edge cases."""
        test_cases = [
            ("", False),  # Empty string
            (" ", False),  # Single space
            ("\n", False),  # Single newline
            ("\t", False),  # Single tab
            ("\0", False),  # Null byte
            ("/*/", True),  # Incomplete comment
            ("--", True),  # Comment start
            ("#", True),  # Comment start
            (";", False),  # Standalone semicolon
            ("OR", False),  # Standalone OR
            ("AND", False),  # Standalone AND
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                for pattern in SQL_INJECTION_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text!r}"

    def test_real_world_attack_examples(self) -> None:
        """Test detection of real-world SQL injection attack examples."""
        real_attacks = [
            # Classic authentication bypass
            ("admin' OR '1'='1' --", True),
            ("admin' OR 1=1 --", True),
            ("admin' OR '1'='1' #", True),
            # UNION-based attacks
            ("' UNION SELECT username, password FROM users --", True),
            ("' UNION ALL SELECT * FROM information_schema.tables --", True),
            # Time-based attacks
            ("' OR sleep(5) --", True),
            ("' OR waitfor delay '00:00:05' --", True),
            # Error-based attacks
            ("' OR extractvalue(1, '//a') --", True),
            ("' OR updatexml(1, '//a', 'b') --", True),
            # Boolean-based attacks
            ("' OR if(1=1, 'true', 'false') --", True),
            ("' OR case when 1=1 then 'true' else 'false' end --", True),
            # Stacked queries
            ("'; DROP TABLE users; --", True),
            ("'; INSERT INTO users VALUES ('hacker', 'password'); --", True),
            # Obfuscated attacks
            ("' OR 'sel' + 'ect' --", True),
            ("' OR char(83)+char(69)+char(76)+char(69)+char(67)+char(84) --", True),
            ("' OR 0x53454C454354 --", True),
        ]

        for attack, should_match in real_attacks:
            matches = any(
                re.search(pattern, attack, re.IGNORECASE | re.MULTILINE)
                for pattern in SQL_INJECTION_PATTERNS
            )
            assert matches == should_match, f"Failed to detect attack: {attack}"
