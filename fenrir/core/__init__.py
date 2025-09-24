"""🐺 The Fuzzing Storm

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

# Core modules
# Attack modules (from exploits directory)
try:
    from .exploits.attacks import (
        AuthBypassFuzzer,
        GrammarFuzzer,
        MLFuzzer,
        TraditionalFuzzer,
        WebSocketFuzzer,
    )

    # Endpoint fuzzers (from exploits directory)
    from .exploits.endpoints import (
        DiffusionFuzzer,
        EmbeddingVisualizationFuzzer,
        HFCacheFuzzer,
        LazyLoadingFuzzer,
        SecureAuthFuzzer,
        SecureOllamaFuzzer,
        SecureSummarizationFuzzer,
        WebSocketFuzzer,
    )
except ImportError:
    # Handle relative imports when running as script
    pass
from .analysis import VulnerabilityAnalyzer
from .base_fuzzer import BaseFuzzer
from .endpoint_orchestrator import create_endpoint_orchestrator

# Main fuzzing framework
from .fuzzy import Fuzzy
from .generators.payload_generator import PayloadGenerator
from .mutations import LearningBasedMutations
from .results import AuthBypassResult, FuzzResult, MLFuzzResult, WebSocketResult
from .wrappers.exploit_wrappers import run_fenrir_exploit

__all__ = [
    # Main framework
    "Fuzzy",
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
    "TraditionalFuzzer",
]
