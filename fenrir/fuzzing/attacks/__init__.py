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

from .grammar import GrammarFuzzer
from .websocket import WebSocketFuzzer
from .ml import MLFuzzer
from .auth import AuthBypassFuzzer
from .traditional import TraditionalFuzzer

__all__ = [
    "GrammarFuzzer",
    "WebSocketFuzzer", 
    "MLFuzzer",
    "AuthBypassFuzzer",
    "TraditionalFuzzer"
]
