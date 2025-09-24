"""🐺 FENRIR EXPLOIT TESTING SUITE

*snarls with predatory glee* This is where I prove that your precious Reynard codebase
has vulnerabilities that would make any attacker salivate with anticipation.

*bares fangs with savage satisfaction* No more theoretical attacks - this is REAL,
DESTRUCTIVE, and IRREFUTABLE exploit code that will tear your system apart!
"""

__version__ = "1.0.0"
__author__ = "🐺 The Wolf"
__description__ = (
    "Comprehensive exploit testing suite for Reynard security vulnerabilities"
)

# Import core modules
from . import core

# Import exploit modules
from .exploits import (
    api_exploits,
    cors_exploits,
    csrf_exploits,
    http_smuggling,
    jwt_exploits,
    llm_exploits,
    path_traversal,
    race_conditions,
    rate_limiting,
    sql_injection,
    ssrf_exploits,
    unicode_exploits,
)

__all__ = [
    "api_exploits",
    "core",
    "cors_exploits",
    "csrf_exploits",
    "http_smuggling",
    "jwt_exploits",
    "llm_exploits",
    "path_traversal",
    "race_conditions",
    "rate_limiting",
    "sql_injection",
    "ssrf_exploits",
    "unicode_exploits",
]
