"""
🐺 BLACKHAT EXPLOIT TESTING SUITE

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
from . import error_disclosure
from . import cors_exploits
from . import file_upload
from . import attack_chains

__all__ = [
    "jwt_exploits",
    "path_traversal", 
    "sql_injection",
    "error_disclosure",
    "cors_exploits",
    "file_upload",
    "attack_chains"
]
