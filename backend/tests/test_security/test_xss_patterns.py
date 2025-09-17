"""
Tests for XSS detection patterns.

This module tests the regex patterns used for detecting
Cross-Site Scripting (XSS) attack attempts.
"""

import re

from app.security.xss_patterns import (
    CSS_INJECTION_PATTERNS,
    EVENT_HANDLER_PATTERNS,
    HTML_TAG_PATTERNS,
    JAVASCRIPT_PROTOCOL_PATTERNS,
    SCRIPT_INJECTION_PATTERNS,
    XSS_PATTERNS,
)


class TestScriptInjectionPatterns:
    """Test script injection pattern detection."""

    def test_script_injection_patterns(self):
        """Test detection of script injection patterns."""
        test_cases = [
            ("<script>alert('XSS')</script>", True),
            ("<script src='evil.js'></script>", True),
            ("<script type='text/javascript'>alert('XSS')</script>", True),
            ("javascript:alert('XSS')", True),
            ("onload=alert('XSS')", True),
            ("onerror=alert('XSS')", True),
            ("onclick=alert('XSS')", True),
            ("<iframe src='evil.html'></iframe>", True),
            ("<object data='evil.swf'></object>", True),
            ("<embed src='evil.swf'></embed>", True),
            ("<script>", True),  # Opening tag only
            ("</script>", True),  # Closing tag only
            ("<iframe>", True),  # Opening tag only
            ("<object>", True),  # Opening tag only
            ("<embed>", True),  # Opening tag only
            ("normal text", False),
            ("<div>content</div>", False),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in SCRIPT_INJECTION_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_script_injection_obfuscation(self):
        """Test detection of obfuscated script injection."""
        test_cases = [
            ("<script>alert(String.fromCharCode(88,83,83))</script>", True),
            ("<script>eval('alert(\\'XSS\\')')</script>", True),
            ("<script>setTimeout('alert(\\'XSS\\')', 1000)</script>", True),
            ("<script>setInterval('alert(\\'XSS\\')', 1000)</script>", True),
            ("<script>Function('alert(\\'XSS\\')')()</script>", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in SCRIPT_INJECTION_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_script_injection_case_variations(self):
        """Test detection of script injection with case variations."""
        test_cases = [
            ("<SCRIPT>alert('XSS')</SCRIPT>", True),
            ("<Script>alert('XSS')</Script>", True),
            ("<sCrIpT>alert('XSS')</sCrIpT>", True),
            ("JAVASCRIPT:alert('XSS')", True),
            ("JavaScript:alert('XSS')", True),
            ("JaVaScRiPt:alert('XSS')", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in SCRIPT_INJECTION_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestEventHandlerPatterns:
    """Test event handler pattern detection."""

    def test_event_handler_patterns(self):
        """Test detection of event handler patterns."""
        test_cases = [
            ("onload=alert('XSS')", True),
            ("onerror=alert('XSS')", True),
            ("onclick=alert('XSS')", True),
            ("onmouseover=alert('XSS')", True),
            ("onfocus=alert('XSS')", True),
            ("onblur=alert('XSS')", True),
            ("onchange=alert('XSS')", True),
            ("onsubmit=alert('XSS')", True),
            ("onreset=alert('XSS')", True),
            ("onselect=alert('XSS')", True),
            ("onkeydown=alert('XSS')", True),
            ("onkeyup=alert('XSS')", True),
            ("onkeypress=alert('XSS')", True),
            ("ONLOAD=alert('XSS')", True),  # Case insensitive
            ("OnLoad=alert('XSS')", True),  # Mixed case
            ("OnLoAd=alert('XSS')", True),  # Mixed case
            ("normal text", False),
            ("onload", False),  # Incomplete event handler
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in EVENT_HANDLER_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_event_handler_obfuscation(self):
        """Test detection of obfuscated event handlers."""
        test_cases = [
            ("onload = alert('XSS')", True),  # Spaces around equals
            ("onload= alert('XSS')", True),  # Space after equals
            ("onload =alert('XSS')", True),  # Space before equals
            ("onload\t=alert('XSS')", True),  # Tab before equals
            ("onload\n=alert('XSS')", True),  # Newline before equals
            ("onload\r=alert('XSS')", True),  # Carriage return before equals
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in EVENT_HANDLER_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_event_handler_in_html_context(self):
        """Test detection of event handlers in HTML context."""
        test_cases = [
            ("<img onload=alert('XSS')>", True),
            ("<div onclick=alert('XSS')>content</div>", True),
            ("<input onfocus=alert('XSS')>", True),
            ("<form onsubmit=alert('XSS')>", True),
            ("<body onload=alert('XSS')>", True),
            ("<html onload=alert('XSS')>", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in EVENT_HANDLER_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestJavaScriptProtocolPatterns:
    """Test JavaScript protocol pattern detection."""

    def test_javascript_protocol_patterns(self):
        """Test detection of JavaScript protocol patterns."""
        test_cases = [
            ("javascript:alert('XSS')", True),
            ("vbscript:alert('XSS')", True),
            ("data:text/html,<script>alert('XSS')</script>", True),
            ("about:blank", True),
            ("JAVASCRIPT:alert('XSS')", True),  # Case insensitive
            ("JavaScript:alert('XSS')", True),  # Mixed case
            ("JaVaScRiPt:alert('XSS')", True),  # Mixed case
            ("VBSCRIPT:alert('XSS')", True),  # Case insensitive
            ("VbScript:alert('XSS')", True),  # Mixed case
            ("DATA:text/html,<script>alert('XSS')</script>", True),
            ("ABOUT:blank", True),
            ("http://example.com", False),
            ("https://example.com", False),
            ("ftp://example.com", False),
            ("mailto:user@example.com", False),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in JAVASCRIPT_PROTOCOL_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_javascript_protocol_obfuscation(self):
        """Test detection of obfuscated JavaScript protocols."""
        test_cases = [
            ("javascript :alert('XSS')", True),  # Space after colon
            ("javascript\t:alert('XSS')", True),  # Tab after colon
            ("javascript\n:alert('XSS')", True),  # Newline after colon
            ("javascript\r:alert('XSS')", True),  # Carriage return after colon
            ("javascript%3Aalert('XSS')", True),  # URL encoded colon
            ("javascript%3aalert('XSS')", True),  # URL encoded colon (lowercase)
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in JAVASCRIPT_PROTOCOL_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_javascript_protocol_in_links(self):
        """Test detection of JavaScript protocols in links."""
        test_cases = [
            ("<a href='javascript:alert(\\'XSS\\')'>click</a>", True),
            ("<a href=\"javascript:alert('XSS')\">click</a>", True),
            ("<img src='javascript:alert(\\'XSS\\')'>", True),
            ("<iframe src='javascript:alert(\\'XSS\\')'></iframe>", True),
            ("<object data='javascript:alert(\\'XSS\\')'></object>", True),
            ("<embed src='javascript:alert(\\'XSS\\')'></embed>", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in JAVASCRIPT_PROTOCOL_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestHtmlTagPatterns:
    """Test HTML tag pattern detection."""

    def test_html_tag_patterns(self):
        """Test detection of HTML tag patterns."""
        test_cases = [
            ("<script>alert('XSS')</script>", True),
            ("<iframe src='evil.html'></iframe>", True),
            ("<object data='evil.swf'></object>", True),
            ("<embed src='evil.swf'></embed>", True),
            ("<applet code='evil.class'></applet>", True),
            ("<form action='evil.php'></form>", True),
            ("<input type='text'>", True),
            ("<textarea>content</textarea>", True),
            ("<select><option>option</option></select>", True),
            ("<script>", True),  # Opening tag only
            ("</script>", True),  # Closing tag only
            ("<iframe>", True),  # Opening tag only
            ("</iframe>", True),  # Closing tag only
            ("<object>", True),  # Opening tag only
            ("</object>", True),  # Closing tag only
            ("<embed>", True),  # Opening tag only
            ("<applet>", True),  # Opening tag only
            ("</applet>", True),  # Closing tag only
            ("<form>", True),  # Opening tag only
            ("</form>", True),  # Closing tag only
            ("<input>", True),  # Opening tag only
            ("<textarea>", True),  # Opening tag only
            ("</textarea>", True),  # Closing tag only
            ("<select>", True),  # Opening tag only
            ("</select>", True),  # Closing tag only
            ("<option>", True),  # Opening tag only
            ("</option>", True),  # Closing tag only
            ("<div>content</div>", False),
            ("<span>content</span>", False),
            ("<p>content</p>", False),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE) for pattern in HTML_TAG_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_html_tag_case_variations(self):
        """Test detection of HTML tags with case variations."""
        test_cases = [
            ("<SCRIPT>alert('XSS')</SCRIPT>", True),
            ("<Script>alert('XSS')</Script>", True),
            ("<sCrIpT>alert('XSS')</sCrIpT>", True),
            ("<IFRAME src='evil.html'></IFRAME>", True),
            ("<Iframe src='evil.html'></Iframe>", True),
            ("<iFrAmE src='evil.html'></iFrAmE>", True),
            ("<OBJECT data='evil.swf'></OBJECT>", True),
            ("<Object data='evil.swf'></Object>", True),
            ("<oBjEcT data='evil.swf'></oBjEcT>", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE) for pattern in HTML_TAG_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_html_tag_obfuscation(self):
        """Test detection of obfuscated HTML tags."""
        test_cases = [
            ("<script>alert('XSS')</script>", True),
            ("<script >alert('XSS')</script>", True),  # Space before closing bracket
            ("<script\t>alert('XSS')</script>", True),  # Tab before closing bracket
            ("<script\n>alert('XSS')</script>", True),  # Newline before closing bracket
            (
                "<script\r>alert('XSS')</script>",
                True,
            ),  # Carriage return before closing bracket
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE) for pattern in HTML_TAG_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestCssInjectionPatterns:
    """Test CSS injection pattern detection."""

    def test_css_injection_patterns(self):
        """Test detection of CSS injection patterns."""
        test_cases = [
            ("expression(alert('XSS'))", True),
            ("url('javascript:alert(\\'XSS\\')')", True),
            ("@import url('evil.css')", True),
            ("behavior: url('evil.htc')", True),
            ("-moz-binding: url('evil.xml')", True),
            ("EXPRESSION(alert('XSS'))", True),  # Case insensitive
            ("Expression(alert('XSS'))", True),  # Mixed case
            ("ExPrEsSiOn(alert('XSS'))", True),  # Mixed case
            ("URL('javascript:alert(\\'XSS\\')')", True),
            ("@IMPORT url('evil.css')", True),
            ("BEHAVIOR: url('evil.htc')", True),
            ("-MOZ-BINDING: url('evil.xml')", True),
            ("color: red", False),
            ("background: url('image.jpg')", False),
            ("font-family: Arial", False),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in CSS_INJECTION_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_css_injection_obfuscation(self):
        """Test detection of obfuscated CSS injection."""
        test_cases = [
            ("expression (alert('XSS'))", True),  # Space after expression
            ("expression\t(alert('XSS'))", True),  # Tab after expression
            ("expression\n(alert('XSS'))", True),  # Newline after expression
            ("expression\r(alert('XSS'))", True),  # Carriage return after expression
            ("url (javascript:alert(\\'XSS\\'))", True),  # Space after url
            ("@import url ('evil.css')", True),  # Space after url
            ("behavior : url('evil.htc')", True),  # Space after colon
            ("-moz-binding : url('evil.xml')", True),  # Space after colon
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in CSS_INJECTION_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_css_injection_in_style_context(self):
        """Test detection of CSS injection in style context."""
        test_cases = [
            ("<div style='expression(alert(\\'XSS\\'))'>content</div>", True),
            ("<span style='url(javascript:alert(\\'XSS\\'))'>content</span>", True),
            ("<p style='@import url(evil.css)'>content</p>", True),
            ("<h1 style='behavior: url(evil.htc)'>content</h1>", True),
            ("<div style='-moz-binding: url(evil.xml)'>content</div>", True),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE)
                for pattern in CSS_INJECTION_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"


class TestCombinedXssPatterns:
    """Test the combined XSS patterns."""

    def test_combined_patterns_structure(self):
        """Test that all pattern categories are included in combined patterns."""
        expected_categories = [
            SCRIPT_INJECTION_PATTERNS,
            EVENT_HANDLER_PATTERNS,
            JAVASCRIPT_PROTOCOL_PATTERNS,
            HTML_TAG_PATTERNS,
            CSS_INJECTION_PATTERNS,
        ]

        total_expected = sum(len(category) for category in expected_categories)
        assert len(XSS_PATTERNS) == total_expected

    def test_combined_patterns_detection(self):
        """Test detection using combined patterns."""
        test_cases = [
            ("<script>alert('XSS')</script>", True),
            ("onload=alert('XSS')", True),
            ("javascript:alert('XSS')", True),
            ("<iframe src='evil.html'></iframe>", True),
            ("expression(alert('XSS'))", True),
            ("normal text", False),
            ("<div>content</div>", False),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE) for pattern in XSS_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_complex_xss_attacks(self):
        """Test detection of complex XSS attacks."""
        test_cases = [
            # Script injection with obfuscation
            ("<script>alert(String.fromCharCode(88,83,83))</script>", True),
            ("<script>eval('alert(\\'XSS\\')')</script>", True),
            # Event handler injection
            ("<img onload=alert('XSS')>", True),
            ("<div onclick=alert('XSS')>content</div>", True),
            # JavaScript protocol injection
            ("<a href='javascript:alert(\\'XSS\\')'>click</a>", True),
            ("<img src='javascript:alert(\\'XSS\\')'>", True),
            # HTML tag injection
            ("<iframe src='evil.html'></iframe>", True),
            ("<object data='evil.swf'></object>", True),
            # CSS injection
            ("<div style='expression(alert(\\'XSS\\'))'>content</div>", True),
            ("<span style='url(javascript:alert(\\'XSS\\'))'>content</span>", True),
            # Combined attacks
            ("<script>onload=alert('XSS')</script>", True),
            (
                "<iframe onload=alert('XSS') src='javascript:alert(\\'XSS\\')'></iframe>",
                True,
            ),
            (
                "<div style='expression(alert(\\'XSS\\'))' onclick=alert('XSS')>content</div>",
                True,
            ),
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE) for pattern in XSS_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text}"

    def test_pattern_performance(self):
        """Test that patterns can handle reasonable input sizes."""
        # Create a large text with XSS patterns
        large_text = "<div>content</div> " * 1000 + "<script>alert('XSS')</script>"

        # This should not take too long
        matches = any(
            re.search(pattern, large_text, re.IGNORECASE) for pattern in XSS_PATTERNS
        )
        assert matches is True

    def test_pattern_edge_cases(self):
        """Test patterns with edge cases."""
        test_cases = [
            ("", False),  # Empty string
            (" ", False),  # Single space
            ("\n", False),  # Single newline
            ("\t", False),  # Single tab
            ("\0", False),  # Null byte
            ("<", False),  # Incomplete tag
            (">", False),  # Incomplete tag
            ("<script", True),  # Incomplete script tag
            ("</script", True),  # Incomplete script tag
            ("onload", False),  # Incomplete event handler
            ("javascript", False),  # Incomplete protocol
        ]

        for text, should_match in test_cases:
            matches = any(
                re.search(pattern, text, re.IGNORECASE) for pattern in XSS_PATTERNS
            )
            assert matches == should_match, f"Failed for: {text!r}"

    def test_real_world_xss_examples(self):
        """Test detection of real-world XSS attack examples."""
        real_attacks = [
            # Basic script injection
            ("<script>alert('XSS')</script>", True),
            ("<script>alert(String.fromCharCode(88,83,83))</script>", True),
            # Event handler injection
            ("<img onload=alert('XSS')>", True),
            ("<div onclick=alert('XSS')>content</div>", True),
            ("<body onload=alert('XSS')>", True),
            # JavaScript protocol injection
            ("<a href='javascript:alert(\\'XSS\\')'>click</a>", True),
            ("<img src='javascript:alert(\\'XSS\\')'>", True),
            # HTML tag injection
            ("<iframe src='evil.html'></iframe>", True),
            ("<object data='evil.swf'></object>", True),
            ("<embed src='evil.swf'></embed>", True),
            # CSS injection
            ("<div style='expression(alert(\\'XSS\\'))'>content</div>", True),
            ("<span style='url(javascript:alert(\\'XSS\\'))'>content</span>", True),
            # Obfuscated attacks
            ("<script>eval('alert(\\'XSS\\')')</script>", True),
            ("<script>setTimeout('alert(\\'XSS\\')', 1000)</script>", True),
            ("<script>setInterval('alert(\\'XSS\\')', 1000)</script>", True),
            ("<script>Function('alert(\\'XSS\\')')()</script>", True),
            # Case variations
            ("<SCRIPT>alert('XSS')</SCRIPT>", True),
            ("<Script>alert('XSS')</Script>", True),
            ("<sCrIpT>alert('XSS')</sCrIpT>", True),
            ("JAVASCRIPT:alert('XSS')", True),
            ("JavaScript:alert('XSS')", True),
            ("JaVaScRiPt:alert('XSS')", True),
            # Whitespace obfuscation
            ("<script >alert('XSS')</script>", True),
            ("<script\t>alert('XSS')</script>", True),
            ("<script\n>alert('XSS')</script>", True),
            ("onload = alert('XSS')", True),
            ("onload= alert('XSS')", True),
            ("onload =alert('XSS')", True),
            ("javascript :alert('XSS')", True),
            ("javascript\t:alert('XSS')", True),
            ("javascript\n:alert('XSS')", True),
        ]

        for attack, should_match in real_attacks:
            matches = any(
                re.search(pattern, attack, re.IGNORECASE) for pattern in XSS_PATTERNS
            )
            assert matches == should_match, f"Failed to detect attack: {attack}"

    def test_false_positives(self):
        """Test that patterns don't produce false positives for legitimate content."""
        legitimate_content = [
            ("<div>content</div>", False),
            ("<span>content</span>", False),
            ("<p>content</p>", False),
            ("<h1>content</h1>", False),
            ("<ul><li>item</li></ul>", False),
            ("<table><tr><td>cell</td></tr></table>", False),
            ("<form><input type='text'><button>submit</button></form>", False),
            ("<style>body { color: red; }</style>", False),
            ("<link rel='stylesheet' href='style.css'>", False),
            ("<meta charset='utf-8'>", False),
            ("<title>Page Title</title>", False),
            ("<head><title>Page Title</title></head>", False),
            ("<body><h1>Welcome</h1></body>", False),
            (
                "<html><head><title>Page</title></head><body>Content</body></html>",
                False,
            ),
        ]

        for content, should_match in legitimate_content:
            matches = any(
                re.search(pattern, content, re.IGNORECASE) for pattern in XSS_PATTERNS
            )
            assert matches == should_match, f"False positive for: {content}"
