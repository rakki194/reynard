"""
🐺 Attack Vector Modules

*alpha wolf dominance radiates* Specialized attack modules for different
types of fuzzing operations. Each module focuses on specific attack
vectors and vulnerability types.

Modules:
    grammar: Grammar-based fuzzing with learning mutations
    websocket: WebSocket-specific attack vectors
    ml: Machine learning model attack vectors
    auth: Authentication bypass attack vectors
    traditional: Traditional HTTP fuzzing attacks
"""

from .auth import AuthBypassFuzzer
from .grammar import GrammarFuzzer
from .ml import MLFuzzer
from .traditional import TraditionalFuzzer
from .websocket import WebSocketFuzzer

__all__ = [
    "AuthBypassFuzzer",
    "GrammarFuzzer",
    "MLFuzzer",
    "TraditionalFuzzer",
    "WebSocketFuzzer",
]
