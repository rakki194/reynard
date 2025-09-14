"""
🐺 Core Fuzzing Framework

The foundational modules for the Reynard fuzzing framework.
These core components provide the essential building blocks for all fuzzing operations.

Modules:
    results: Data structures for fuzzing results and analysis
    mutations: Learning-based payload mutation engine
    analysis: Response analysis and vulnerability detection
    base: Base classes and interfaces for fuzzing components
"""

from .results import (
    FuzzResult,
    WebSocketResult, 
    MLFuzzResult,
    AuthBypassResult
)

from .mutations import LearningBasedMutations

from .analysis import VulnerabilityAnalyzer

from .base_fuzzer import BaseFuzzer
from .payload_composables import PayloadComposables, PayloadSet
from .endpoint_orchestrator import EndpointOrchestrator, create_endpoint_orchestrator

__all__ = [
    "FuzzResult",
    "WebSocketResult", 
    "MLFuzzResult",
    "AuthBypassResult",
    "LearningBasedMutations",
    "VulnerabilityAnalyzer",
    "BaseFuzzer",
    "PayloadComposables",
    "PayloadSet",
    "EndpointOrchestrator",
    "create_endpoint_orchestrator"
]
