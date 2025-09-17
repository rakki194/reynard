"""
NLWeb Integration Service for Reynard

Provides intelligent tool suggestion, routing, and natural language processing
capabilities through NLWeb integration. Ported from Yipyap's battle-tested implementation.
"""

from .models import (
    NLWebAskRequest,
    NLWebConfiguration,
    NLWebContext,
    NLWebHealthStatus,
    NLWebMCPRequest,
    NLWebPerformanceStats,
    NLWebRollbackRequest,
    NLWebRollbackResponse,
    NLWebSitesResponse,
    NLWebSuggestionRequest,
    NLWebSuggestionResponse,
    NLWebTool,
    NLWebVerificationResponse,
)
from .nlweb_router import NLWebRouter
from .nlweb_service import NLWebService
from .nlweb_tool_registry import NLWebToolRegistry

__all__ = [
    "NLWebAskRequest",
    "NLWebConfiguration",
    "NLWebContext",
    "NLWebHealthStatus",
    "NLWebMCPRequest",
    "NLWebPerformanceStats",
    "NLWebRollbackRequest",
    "NLWebRollbackResponse",
    "NLWebRouter",
    "NLWebService",
    "NLWebSitesResponse",
    "NLWebSuggestionRequest",
    "NLWebSuggestionResponse",
    "NLWebTool",
    "NLWebToolRegistry",
    "NLWebVerificationResponse",
]
