"""
🐺 SQL INJECTION BYPASS EXPLOITS

*snarls with predatory glee* Your regex-based SQL injection detection is WEAK!
Obfuscated payloads, encoding tricks, and pattern evasion will bypass your filters!

*bares fangs with savage satisfaction* These exploits will tear through your
input validation and show you exactly how an attacker would inject SQL.
"""

from .regex_bypass import RegexBypassExploit
from .obfuscated_payloads import ObfuscatedSQLInjectionExploit
from .blind_injection import BlindInjectionExploit
from .union_attacks import UnionBasedExploit

__all__ = [
    "RegexBypassExploit",
    "ObfuscatedSQLInjectionExploit",
    "BlindInjectionExploit",
    "UnionBasedExploit"
]
