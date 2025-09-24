"""XSS Detection Patterns

This module contains regex patterns for detecting
Cross-Site Scripting (XSS) attack attempts.
"""

# Script injection patterns
SCRIPT_INJECTION_PATTERNS = [
    r"<script[^>]*>.*?</script>",
    r"javascript:",
    r"on\w+\s*=",
    r"<iframe[^>]*>",
    r"<object[^>]*>",
    r"<embed[^>]*>",
]

# Event handler patterns
EVENT_HANDLER_PATTERNS = [
    r"onload\s*=",
    r"onerror\s*=",
    r"onclick\s*=",
    r"onmouseover\s*=",
    r"onfocus\s*=",
    r"onblur\s*=",
    r"onchange\s*=",
    r"onsubmit\s*=",
    r"onreset\s*=",
    r"onselect\s*=",
    r"onkeydown\s*=",
    r"onkeyup\s*=",
    r"onkeypress\s*=",
]

# JavaScript protocol patterns
JAVASCRIPT_PROTOCOL_PATTERNS = [
    r"javascript\s*:",
    r"vbscript\s*:",
    r"data\s*:",
    r"about\s*:",
]

# HTML tag patterns
HTML_TAG_PATTERNS = [
    r"<script",
    r"</script>",
    r"<iframe",
    r"</iframe>",
    r"<object",
    r"</object>",
    r"<embed",
    r"<applet",
    r"</applet>",
    r"<form",
    r"</form>",
    r"<input",
    r"<textarea",
    r"</textarea>",
    r"<select",
    r"</select>",
    r"<option",
    r"</option>",
]

# CSS injection patterns
CSS_INJECTION_PATTERNS = [
    r"expression\s*\(",
    r"url\s*\(",
    r"@import",
    r"behavior\s*:",
    r"-moz-binding",
]

# Combine all XSS patterns
XSS_PATTERNS = (
    SCRIPT_INJECTION_PATTERNS
    + EVENT_HANDLER_PATTERNS
    + JAVASCRIPT_PROTOCOL_PATTERNS
    + HTML_TAG_PATTERNS
    + CSS_INJECTION_PATTERNS
)
