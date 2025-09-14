"""
🐺 The Fuzzing Storm

> *howls echo through the digital tempest*

Welcome to the most advanced fuzzing arsenal in the Reynard ecosystem.
This directory contains a modular fuzzing framework that orchestrates specialized attack engines
to tear apart your application's defenses with surgical precision and overwhelming force.

The modular architecture consists of:
- Core modules: Results, mutations, analysis, and base classes
- Attack modules: Grammar, WebSocket, ML, auth, and traditional fuzzing
- Comprehensive orchestrator: Coordinates all attack vectors
- Professional reporting: Detailed vulnerability analysis and recommendations

Usage:
    >>> from fenrir.fuzzing import Fuzzy
    >>> async with Fuzzy() as fuzzer:
    ...     await fuzzer.fuzz_authentication_endpoints()
    ...     fuzzer.generate_fuzz_report()
"""

# Main fuzzing framework
from .fuzzy import Fuzzy, main

# Modular components
from .endpoints import (
    EndpointFuzzer,
    EmbeddingVisualizationFuzzer,
    DiffusionFuzzer,
    LazyLoadingFuzzer,
    HFCacheFuzzer,
    SecureAuthFuzzer,
    SecureOllamaFuzzer,
    SecureSummarizationFuzzer,
    WebSocketFuzzer
)
from .wrappers import run_fenrir_exploit
from .generators import PayloadGenerator

# Core modules
from .core import (
    FuzzResult,
    WebSocketResult,
    MLFuzzResult,
    AuthBypassResult,
    LearningBasedMutations,
    VulnerabilityAnalyzer,
    BaseFuzzer
)

# Attack modules
from .attacks import (
    GrammarFuzzer,
    WebSocketFuzzer,
    MLFuzzer,
    AuthBypassFuzzer,
    TraditionalFuzzer
)

__all__ = [
    # Main framework
    "Fuzzy",
    "main",
    
    # Modular components
    "EndpointFuzzer",
    "EmbeddingVisualizationFuzzer",
    "DiffusionFuzzer",
    "LazyLoadingFuzzer",
    "HFCacheFuzzer",
    "SecureAuthFuzzer",
    "SecureOllamaFuzzer",
    "SecureSummarizationFuzzer",
    "WebSocketFuzzer",
    "run_fenrir_exploit",
    "PayloadGenerator",
    
    # Core modules
    "FuzzResult",
    "WebSocketResult",
    "MLFuzzResult",
    "AuthBypassResult",
    "LearningBasedMutations",
    "VulnerabilityAnalyzer",
    "BaseFuzzer",
    
    # Attack modules
    "GrammarFuzzer",
    "WebSocketFuzzer",
    "MLFuzzer",
    "AuthBypassFuzzer",
    "TraditionalFuzzer"
]
