"""🦊 Reynard AI API Module
=========================

AI API module providing comprehensive AI model interaction capabilities
across multiple providers (Ollama, vLLM, SGLang, LLaMA.cpp) within the Reynard ecosystem.

This module provides:
- AI endpoints for chat, assistant, and streaming interactions
- Multi-provider support with consistent interfaces
- Type-safe data models with comprehensive validation
- Enterprise-grade error handling and monitoring
- Performance tracking and metrics collection

Author: Reynard Development Team
Version: 3.0.0 - AI service with multi-provider support
"""

from .endpoints import ai_router, router
from .models import (
    AIAssistantRequest,
    AIAssistantResponse,
    AIChatRequest,
    AIChatResponse,
    AIConfig,
    AIModelInfo,
    AIStats,
    AIStreamEvent,
)

__all__ = [
    # Router
    "router",
    "ai_router",
    # Request Models
    "AIChatRequest",
    "AIAssistantRequest",
    # Response Models
    "AIChatResponse",
    "AIAssistantResponse",
    # Event Models
    "AIStreamEvent",
    # Info Models
    "AIModelInfo",
    # Config Models
    "AIConfig",
    # Stats Models
    "AIStats",
]
