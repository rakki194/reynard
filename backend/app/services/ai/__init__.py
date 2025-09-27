"""🦊 Reynard AI Services Package
===============================

AI services package providing multi-provider support for model serving
across the Reynard ecosystem. This package implements a sophisticated provider
abstraction layer that supports multiple model serving frameworks.

Supported Providers:
- Ollama: Local model serving with ReynardAssistant integration
- vLLM: High-performance production serving with PagedAttention
- SGLang: Complex structured generation workflows with RadixAttention
- LLaMA.cpp: Lightweight edge deployments with maximum portability

Key Features:
- Consistent Interface: Consistent API across all providers
- Intelligent Routing: Automatic provider selection and load balancing
- Fallback Mechanisms: Graceful degradation when providers are unavailable
- Performance Monitoring: Comprehensive metrics and health monitoring
- Configuration Management: Dynamic provider configuration and validation
- Service Integration: Seamless integration with existing Reynard services

Architecture:
- ModelProvider: Abstract base class for all providers
- AIService: Service managing multiple providers
- ProviderRegistry: Centralized provider registration and management
- AIServiceRouter: FastAPI router with multi-provider support

Author: Reynard Development Team
Version: 1.0.0
"""

from .ai_service import AIService, AIServiceConfig
from .interfaces.model_provider import (
    ChatMessage,
    ChatResult,
    GenerationResult,
    ModelCapability,
    ModelInfo,
    ModelProvider,
    ModelProviderConfig,
    ModelProviderRegistry,
    ProviderType,
)
from .provider_registry import (
    ProviderConfigManager,
    ProviderRegistry,
    get_config_manager,
    get_provider_registry,
)
# Provider imports are now done conditionally in ai_service.py to avoid loading disabled providers
# from .providers.llamacpp_provider import LLaMACppConfig, LLaMACppProvider
# from .providers.ollama_provider import OllamaConfig, OllamaProvider
# from .providers.sglang_provider import SGLangConfig, SGLangProvider, SGLangWorkflow
# from .providers.vllm_provider import VLLMConfig, VLLMProvider

# Import service access functions - moved to avoid circular import
# from app.core.ai_service_initializer import get_ai_service

__all__ = [
    # Core interfaces
    "ModelProvider",
    "ModelProviderConfig",
    "ModelProviderRegistry",
    "ProviderType",
    "ModelCapability",
    "ModelInfo",
    "ChatMessage",
    "ChatResult",
    "GenerationResult",
    # Services
    "AIService",
    "AIServiceConfig",
    "ProviderRegistry",
    "ProviderConfigManager",
    # Providers (imported conditionally to avoid loading disabled providers)
    # "OllamaProvider",
    # "OllamaConfig",
    # "VLLMProvider",
    # "VLLMConfig",
    # "SGLangProvider",
    # "SGLangConfig",
    # "SGLangWorkflow",
    # "LLaMACppProvider",
    # "LLaMACppConfig",
    # Registry functions
    "get_provider_registry",
    "get_config_manager",
    # Service access functions
]
