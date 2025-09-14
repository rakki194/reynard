"""
🐺 FENRIR EXPLOIT TESTING SUITE

*snarls with predatory glee* This is where I prove that your precious Reynard codebase
has vulnerabilities that would make any attacker salivate with anticipation.

*bares fangs with savage satisfaction* No more theoretical attacks - this is REAL,
DESTRUCTIVE, and IRREFUTABLE exploit code that will tear your system apart!
"""

__version__ = "1.0.0"
__author__ = "🐺 The Wolf"
__description__ = "Comprehensive exploit testing suite for Reynard security vulnerabilities"

# Import exploit modules
from . import jwt_exploits
from . import path_traversal
from . import sql_injection
from . import cors_exploits
from . import api_exploits
from . import csrf_exploits
from . import fuzzing
from . import http_smuggling
from . import llm_exploits
from . import race_conditions
from . import rate_limiting
from . import ssrf_exploits
from . import unicode_exploits

__all__ = [
    "jwt_exploits",
    "path_traversal", 
    "sql_injection",
    "cors_exploits",
    "api_exploits",
    "csrf_exploits",
    "fuzzing",
    "http_smuggling",
    "llm_exploits",
    "race_conditions",
    "rate_limiting",
    "ssrf_exploits",
    "unicode_exploits"
]
