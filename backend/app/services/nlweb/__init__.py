"""
NLWeb Integration Service for Reynard

Provides intelligent tool suggestion, routing, and natural language processing
capabilities through NLWeb integration. Ported from Yipyap's battle-tested implementation.
"""

from .nlweb_service import NLWebService
from .nlweb_router import NLWebRouter
from .nlweb_tool_registry import NLWebToolRegistry
from .models import (
    NLWebSuggestionRequest,
    NLWebSuggestionResponse,
    NLWebHealthStatus,
    NLWebPerformanceStats,
    NLWebTool,
    NLWebContext,
    NLWebConfiguration,
    NLWebRollbackRequest,
    NLWebRollbackResponse,
    NLWebVerificationResponse,
    NLWebAskRequest,
    NLWebMCPRequest,
    NLWebSitesResponse,
)

__all__ = [
    "NLWebService",
    "NLWebRouter", 
    "NLWebToolRegistry",
    "NLWebSuggestionRequest",
    "NLWebSuggestionResponse",
    "NLWebHealthStatus",
    "NLWebPerformanceStats",
    "NLWebTool",
    "NLWebContext",
    "NLWebConfiguration",
    "NLWebRollbackRequest",
    "NLWebRollbackResponse",
    "NLWebVerificationResponse",
    "NLWebAskRequest",
    "NLWebMCPRequest",
    "NLWebSitesResponse",
]
