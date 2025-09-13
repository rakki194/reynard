"""
Tests for obfuscation detection patterns.

This module tests the regex patterns used for detecting
various obfuscation techniques in security attacks.
"""

import re
import pytest
from app.security.obfuscation_patterns import (
    COMMENT_OBFUSCATION_PATTERNS,
    STRING_OBFUSCATION_PATTERNS,
    FUNCTION_OBFUSCATION_PATTERNS,
    HEX_OBFUSCATION_PATTERNS,
    UNICODE_OBFUSCATION_PATTERNS,
    WHITESPACE_OBFUSCATION_PATTERNS,
    CONTROL_CHARACTER_PATTERNS,
    ENCODING_OBFUSCATION_PATTERNS,
    SQL_FUNCTION_OBFUSCATION_PATTERNS,
    MATH_OBFUSCATION_PATTERNS,
    STRING_MANIPULATION_OBFUSCATION_PATTERNS,
    DATETIME_OBFUSCATION_PATTERNS,
    SYSTEM_VARIABLE_OBFUSCATION_PATTERNS,
    OBFUSCATION_PATTERNS,
)


class TestCommentObfuscationPatterns:
    """Test comment obfuscation pattern detection."""

    def test_sql_comment_patterns(self):
        """Test detection of SQL comment patterns."""
        test_cases = [
            ("SELECT * FROM users /* comment */", True),
            ("SELECT * FROM users -- comment", True),
            ("SELECT * FROM users # comment", True),
            ("SELECT * FROM users", False),
            ("/* multi\nline\ncomment */", True),
            ("-- single line comment", True),
            ("# hash comment", True),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE | re.MULTILINE) 
                         for pattern in COMMENT_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"

    def test_nested_comments(self):
        """Test detection of nested comment patterns."""
        test_cases = [
            ("/* outer /* inner */ comment */", True),
            ("-- line 1\n-- line 2", True),
            ("# line 1\n# line 2", True),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE | re.MULTILINE) 
                         for pattern in COMMENT_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"


class TestStringObfuscationPatterns:
    """Test string obfuscation pattern detection."""

    def test_string_concatenation_patterns(self):
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
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in STRING_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"

    def test_complex_string_obfuscation(self):
        """Test detection of complex string obfuscation."""
        test_cases = [
            ("'sel' + 'ect'", True),
            ("concat('sel', 'ect')", True),
            ("'UNION' + 'SELECT'", True),
            ("concat_ws('', 'UNION', 'SELECT')", True),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in STRING_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"


class TestFunctionObfuscationPatterns:
    """Test function obfuscation pattern detection."""

    def test_character_function_patterns(self):
        """Test detection of character function patterns."""
        test_cases = [
            ("char(65)", True),
            ("chr(65)", True),
            ("ascii('A')", True),
            ("ord('A')", True),
            ("CHAR(65)", True),
            ("CHR(65)", True),
            ("ASCII('A')", True),
            ("ORD('A')", True),
            ("SELECT * FROM users", False),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in FUNCTION_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"

    def test_character_function_obfuscation(self):
        """Test detection of character function obfuscation."""
        test_cases = [
            ("char(83)+char(69)+char(76)+char(69)+char(67)+char(84)", True),
            ("chr(83)+chr(69)+chr(76)+chr(69)+chr(67)+chr(84)", True),
            ("ascii('S')+ascii('E')+ascii('L')", True),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in FUNCTION_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"


class TestHexObfuscationPatterns:
    """Test hex obfuscation pattern detection."""

    def test_hex_patterns(self):
        """Test detection of hex patterns."""
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
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in HEX_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"

    def test_hex_obfuscation_attacks(self):
        """Test detection of hex obfuscation in attacks."""
        test_cases = [
            ("0x53454C454354", True),  # "SELECT" in hex
            ("0x554E494F4E", True),    # "UNION" in hex
            ("0x494E53455254", True),  # "INSERT" in hex
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in HEX_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"


class TestUnicodeObfuscationPatterns:
    """Test unicode obfuscation pattern detection."""

    def test_unicode_patterns(self):
        """Test detection of unicode patterns."""
        test_cases = [
            ("\\u0041", True),  # Unicode escape
            ("\\u0042", True),
            ("\\x41", True),    # Hex escape
            ("\\x42", True),
            ("\\u0041\\u0042", True),
            ("\\x41\\x42", True),
            ("SELECT * FROM users", False),
            ("\\u", False),     # Incomplete unicode
            ("\\x", False),     # Incomplete hex
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in UNICODE_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"

    def test_unicode_obfuscation_attacks(self):
        """Test detection of unicode obfuscation in attacks."""
        test_cases = [
            ("\\u0053\\u0045\\u004C\\u0045\\u0043\\u0054", True),  # "SELECT"
            ("\\x53\\x45\\x4C\\x45\\x43\\x54", True),              # "SELECT"
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in UNICODE_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"


class TestWhitespaceObfuscationPatterns:
    """Test whitespace obfuscation pattern detection."""

    def test_whitespace_patterns(self):
        """Test detection of whitespace obfuscation patterns."""
        test_cases = [
            ("SELECT * FROM users", True),   # Contains "select"
            ("UNION SELECT * FROM users", True),  # Contains "union"
            ("INSERT INTO users", True),     # Contains "from" (in FROM users)
            ("WHERE id = 1", True),          # Contains "where"
            ("AND name = 'test'", True),     # Contains "and"
            ("OR status = 1", True),         # Contains "or"
            ("SELECT*FROM users", False),    # No spaces around keywords
            ("hello world", False),          # No SQL keywords
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in WHITESPACE_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"

    def test_whitespace_obfuscation_attacks(self):
        """Test detection of whitespace obfuscation in attacks."""
        test_cases = [
            ("SEL ECT * FROM users", True),
            ("UNI ON SELECT * FROM users", True),
            ("INS ERT INTO users", True),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in WHITESPACE_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"


class TestControlCharacterPatterns:
    """Test control character pattern detection."""

    def test_control_character_patterns(self):
        """Test detection of control character patterns."""
        test_cases = [
            ("SELECT\t* FROM users", True),   # Tab character
            ("SELECT\n* FROM users", True),   # Newline character
            ("SELECT\r* FROM users", True),   # Carriage return
            ("SELECT   * FROM users", True),  # Multiple spaces
            ("SELECT\0* FROM users", True),   # Null byte
            ("SELECT * FROM users", False),   # Normal spaces
            ("SELECT\x00* FROM users", True), # Null byte (hex)
            ("SELECT\x1F* FROM users", True), # Control character
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in CONTROL_CHARACTER_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"

    def test_control_character_attacks(self):
        """Test detection of control character attacks."""
        test_cases = [
            ("SEL\tECT * FROM users", True),
            ("UNI\nON SELECT * FROM users", True),
            ("INS\rERT INTO users", True),
            ("SEL\0ECT * FROM users", True),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in CONTROL_CHARACTER_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"


class TestEncodingObfuscationPatterns:
    """Test encoding obfuscation pattern detection."""

    def test_encoding_patterns(self):
        """Test detection of encoding obfuscation patterns."""
        test_cases = [
            ("%41%42%43", True),      # URL encoding
            ("&lt;script&gt;", True), # HTML entities
            ("&amp;", True),          # HTML entities
            ("&quot;", True),         # HTML entities
            ("SELECT * FROM users", False),
            ("%", False),             # Incomplete encoding
            ("&", False),             # Incomplete entity
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in ENCODING_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"

    def test_encoding_obfuscation_attacks(self):
        """Test detection of encoding obfuscation in attacks."""
        test_cases = [
            ("%53%45%4C%45%43%54", True),  # "SELECT" in URL encoding
            ("&lt;script&gt;alert(1)&lt;/script&gt;", True),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in ENCODING_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"


class TestSqlFunctionObfuscationPatterns:
    """Test SQL function obfuscation pattern detection."""

    def test_sql_function_patterns(self):
        """Test detection of SQL function obfuscation patterns."""
        test_cases = [
            ("if(1=1, 'true', 'false')", True),
            ("case when 1=1 then 'true' else 'false' end", True),
            ("when 1=1 then 'true'", True),
            ("SELECT * FROM users", False),
            ("if", False),             # Incomplete function
            ("case", False),           # Incomplete case
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in SQL_FUNCTION_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"

    def test_sql_function_obfuscation_attacks(self):
        """Test detection of SQL function obfuscation in attacks."""
        test_cases = [
            ("if(1=1, (SELECT * FROM users), '')", True),
            ("case when 1=1 then (SELECT * FROM users) else '' end", True),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in SQL_FUNCTION_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"


class TestMathObfuscationPatterns:
    """Test mathematical obfuscation pattern detection."""

    def test_math_function_patterns(self):
        """Test detection of mathematical function patterns."""
        test_cases = [
            ("floor(1.5)", True),
            ("ceil(1.5)", True),
            ("round(1.5)", True),
            ("abs(-1)", True),
            ("mod(10, 3)", True),
            ("FLOOR(1.5)", True),
            ("CEIL(1.5)", True),
            ("ROUND(1.5)", True),
            ("ABS(-1)", True),
            ("MOD(10, 3)", True),
            ("SELECT * FROM users", False),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in MATH_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"

    def test_math_obfuscation_attacks(self):
        """Test detection of mathematical obfuscation in attacks."""
        test_cases = [
            ("floor(rand()*2)", True),
            ("ceil(rand()*2)", True),
            ("round(rand()*2)", True),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in MATH_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"


class TestStringManipulationObfuscationPatterns:
    """Test string manipulation obfuscation pattern detection."""

    def test_string_manipulation_patterns(self):
        """Test detection of string manipulation patterns."""
        test_cases = [
            ("substr('hello', 1, 3)", True),
            ("substring('hello', 1, 3)", True),
            ("mid('hello', 1, 3)", True),
            ("left('hello', 3)", True),
            ("right('hello', 3)", True),
            ("SUBSTR('hello', 1, 3)", True),
            ("SUBSTRING('hello', 1, 3)", True),
            ("MID('hello', 1, 3)", True),
            ("LEFT('hello', 3)", True),
            ("RIGHT('hello', 3)", True),
            ("SELECT * FROM users", False),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in STRING_MANIPULATION_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"

    def test_string_manipulation_obfuscation_attacks(self):
        """Test detection of string manipulation obfuscation in attacks."""
        test_cases = [
            ("substr('SELECT', 1, 6)", True),
            ("substring('UNION', 1, 5)", True),
            ("left('INSERT', 6)", True),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in STRING_MANIPULATION_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"


class TestDatetimeObfuscationPatterns:
    """Test datetime obfuscation pattern detection."""

    def test_datetime_patterns(self):
        """Test detection of datetime function patterns."""
        test_cases = [
            ("now()", True),
            ("current_date()", True),
            ("current_time()", True),
            ("current_timestamp()", True),
            ("NOW()", True),
            ("CURRENT_DATE()", True),
            ("CURRENT_TIME()", True),
            ("CURRENT_TIMESTAMP()", True),
            ("SELECT * FROM users", False),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in DATETIME_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"

    def test_datetime_obfuscation_attacks(self):
        """Test detection of datetime obfuscation in attacks."""
        test_cases = [
            ("sleep(now())", True),
            ("waitfor delay current_time()", True),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in DATETIME_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"


class TestSystemVariableObfuscationPatterns:
    """Test system variable obfuscation pattern detection."""

    def test_system_variable_patterns(self):
        """Test detection of system variable patterns."""
        test_cases = [
            ("@@version", True),
            ("@@datadir", True),
            ("@@hostname", True),
            ("@@port", True),
            ("@@socket", True),
            ("@@VERSION", True),
            ("@@DATADIR", True),
            ("@@HOSTNAME", True),
            ("@@PORT", True),
            ("@@SOCKET", True),
            ("SELECT * FROM users", False),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in SYSTEM_VARIABLE_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"

    def test_system_variable_obfuscation_attacks(self):
        """Test detection of system variable obfuscation in attacks."""
        test_cases = [
            ("SELECT @@version", True),
            ("UNION SELECT @@datadir", True),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE) 
                         for pattern in SYSTEM_VARIABLE_OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"


class TestCombinedObfuscationPatterns:
    """Test the combined obfuscation patterns."""

    def test_combined_patterns_structure(self):
        """Test that all pattern categories are included in combined patterns."""
        expected_categories = [
            COMMENT_OBFUSCATION_PATTERNS,
            STRING_OBFUSCATION_PATTERNS,
            FUNCTION_OBFUSCATION_PATTERNS,
            HEX_OBFUSCATION_PATTERNS,
            UNICODE_OBFUSCATION_PATTERNS,
            WHITESPACE_OBFUSCATION_PATTERNS,
            CONTROL_CHARACTER_PATTERNS,
            ENCODING_OBFUSCATION_PATTERNS,
            SQL_FUNCTION_OBFUSCATION_PATTERNS,
            MATH_OBFUSCATION_PATTERNS,
            STRING_MANIPULATION_OBFUSCATION_PATTERNS,
            DATETIME_OBFUSCATION_PATTERNS,
            SYSTEM_VARIABLE_OBFUSCATION_PATTERNS,
        ]
        
        total_expected = sum(len(category) for category in expected_categories)
        assert len(OBFUSCATION_PATTERNS) == total_expected

    def test_combined_patterns_detection(self):
        """Test detection using combined patterns."""
        test_cases = [
            ("SELECT * FROM users /* comment */", True),
            ("'sel' + 'ect' * FROM users", True),
            ("char(83)+char(69)+char(76)", True),
            ("0x53454C454354", True),
            ("\\u0053\\u0045\\u004C", True),
            ("SEL ECT * FROM users", True),
            ("SELECT\t* FROM users", True),
            ("%53%45%4C%45%43%54", True),
            ("if(1=1, 'true', 'false')", True),
            ("floor(rand()*2)", True),
            ("substr('hello', 1, 3)", True),
            ("now()", True),
            ("@@version", True),
            ("normal text", False),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE | re.MULTILINE) 
                         for pattern in OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"

    def test_complex_obfuscation_attacks(self):
        """Test detection of complex obfuscation attacks."""
        test_cases = [
            ("/* comment */ 'sel' + 'ect' /* comment */", True),
            ("char(83)+char(69)+char(76)+char(69)+char(67)+char(84)", True),
            ("0x53454C454354 /* comment */", True),
            ("\\u0053\\u0045\\u004C\\u0045\\u0043\\u0054", True),
            ("SEL\tECT * FROM users", True),
            ("%53%45%4C%45%43%54", True),
            ("if(1=1, (SELECT * FROM users), '')", True),
            ("floor(rand()*2)", True),
            ("substr('SELECT', 1, 6)", True),
            ("sleep(now())", True),
            ("SELECT @@version", True),
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE | re.MULTILINE) 
                         for pattern in OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {text}"

    def test_pattern_performance(self):
        """Test that patterns can handle reasonable input sizes."""
        # Create a large text with obfuscation patterns
        large_text = "SELECT * FROM users " * 1000 + "/* comment */"
        
        # This should not take too long
        matches = any(re.search(pattern, large_text, re.IGNORECASE | re.MULTILINE) 
                     for pattern in OBFUSCATION_PATTERNS)
        assert matches is True

    def test_pattern_edge_cases(self):
        """Test patterns with edge cases."""
        test_cases = [
            ("", False),  # Empty string
            (" ", False),  # Single space
            ("\n", False),  # Single newline
            ("\t", True),   # Single tab (control character)
            ("\0", True),   # Null byte
            ("/*/", True),  # Incomplete comment
            ("--", True),   # Comment start
            ("#", True),    # Comment start
        ]
        
        for text, should_match in test_cases:
            matches = any(re.search(pattern, text, re.IGNORECASE | re.MULTILINE) 
                         for pattern in OBFUSCATION_PATTERNS)
            assert matches == should_match, f"Failed for: {repr(text)}"
