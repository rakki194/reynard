"""🦊 Reynard AI API Endpoints
=============================

Comprehensive FastAPI endpoints for AI integration within the Reynard ecosystem,
providing sophisticated AI model interaction capabilities including chat, assistant
functions, and streaming responses across multiple providers (Ollama, vLLM, SGLang, LLaMA.cpp).

The AI API provides:
- Advanced chat functionality with configurable AI models across multiple providers
- Assistant-style interactions with system prompts and context
- Streaming responses for real-time AI interactions
- Tool calling capabilities for function execution
- Model management and configuration options across all providers
- Performance monitoring and metrics collection
- Comprehensive error handling and validation
- Security integration with authentication and authorization

Key Features:
- Multi-Provider Support: Ollama, vLLM, SGLang, LLaMA.cpp Server
- Chat Interface: Advanced conversational AI with multiple model support
- Assistant Functions: Specialized AI assistant capabilities with context awareness
- Streaming Responses: Real-time response streaming for interactive experiences
- Tool Integration: Function calling and tool execution capabilities
- Model Management: Dynamic model selection and configuration across providers
- Performance Monitoring: Response time tracking and token counting
- Error Handling: Comprehensive error recovery and user feedback
- Security: Authentication and authorization for protected endpoints

API Endpoints:
- POST /chat: Standard chat interface with AI models
- POST /assistant: Assistant-style interactions with enhanced capabilities
- GET /stream: Streaming chat responses for real-time interaction
- GET /models: Model information and configuration details across all providers
- POST /generate: Direct text generation with custom parameters

The AI integration provides seamless AI capabilities throughout the Reynard
ecosystem, enabling sophisticated conversational interfaces and AI-powered
functionality with enterprise-grade reliability and performance across multiple providers.

Author: Reynard Development Team
Version: 3.0.0 - AI service with multi-provider support
"""

import time
from typing import Any, Optional

from pydantic import BaseModel, Field

from ...core.base_router import BaseServiceRouter
from ...core.config_mixin import ConfigEndpointMixin
from ...core.logging_config import get_service_logger
from ...core.router_mixins import RateLimitingMixin, StreamingResponseMixin
from ...services.ai.ai_service import AIService
from ...services.ai.interfaces.model_provider import ChatMessage, ChatResult
from ...services.ai.provider_registry import ProviderType
from .models import (
    AIAssistantRequest,
    AIAssistantResponse,
    AIChatRequest,
    AIChatResponse,
)

logger = get_service_logger("ai")


class AIConfigModel(BaseModel):
    """Configuration model for AI service."""

    default_model: str = Field(default="llama3.1:latest", description="Default model to use")
    default_provider: str = Field(default="ollama", description="Default provider to use")
    max_tokens: int = Field(
        default=2048, ge=1, le=8192, description="Maximum tokens per request",
    )
    temperature: float = Field(
        default=0.7, ge=0.0, le=2.0, description="Response creativity level",
    )
    timeout: int = Field(
        default=30, ge=5, le=300, description="Request timeout in seconds",
    )
    enable_streaming: bool = Field(
        default=True, description="Enable streaming responses",
    )
    enable_tools: bool = Field(default=True, description="Enable tool calling")
    max_concurrent_requests: int = Field(
        default=10, ge=1, le=100, description="Max concurrent requests",
    )


class AIServiceRouter(
    BaseServiceRouter, ConfigEndpointMixin, StreamingResponseMixin, RateLimitingMixin,
):
    """AI service router with enterprise-grade patterns.

    Provides standardized service patterns including:
    - Centralized error handling and recovery
    - Configuration management with validation
    - Streaming response capabilities
    - Health monitoring and metrics
    - Service dependency management
    - Multi-provider AI support
    """

    def __init__(self):
        # Initialize all parent classes
        BaseServiceRouter.__init__(
            self, service_name="ai", prefix="/api/ai", tags=["ai"],
        )
        ConfigEndpointMixin.__init__(self)
        StreamingResponseMixin.__init__(self)
        RateLimitingMixin.__init__(self)

        # Setup configuration endpoints
        self.setup_config_endpoints(AIConfigModel)

        # Setup streaming endpoints
        self.setup_streaming_endpoints()

        # Setup rate limiting endpoints
        self.setup_rate_limiting_endpoints()

        # Setup AI-specific endpoints with rate limiting
        self._setup_ai_endpoints()

        # Configure per-endpoint rate limits
        self._configure_rate_limits()

        logger.info("AIServiceRouter initialized with enterprise patterns")

    def _configure_rate_limits(self) -> None:
        """Configure per-endpoint rate limits for AI service."""
        # Chat endpoints - moderate rate limiting for AI interactions
        self.set_rate_limit("/chat", 30)  # 30 requests per minute
        self.set_rate_limit("/chat/stream", 20)  # 20 streaming requests per minute

        # Assistant endpoints - higher rate limiting for specialized AI
        self.set_rate_limit("/assistant", 25)  # 25 requests per minute
        self.set_rate_limit("/assistant/stream", 15)  # 15 streaming requests per minute

        # Model info endpoint - higher rate limiting for metadata
        self.set_rate_limit("/models", 60)  # 60 requests per minute

        # Configuration endpoints - lower rate limiting for admin operations
        self.set_rate_limit("/config", 10)  # 10 requests per minute
        self.set_rate_limit("/config/validate", 20)  # 20 validation requests per minute

        logger.info("Rate limits configured for AI service endpoints")

    def get_service(self) -> AIService:
        """Get the AI service instance."""
        from ...core.service_registry import ServiceRegistry
        
        service_registry = ServiceRegistry()
        return service_registry.get_service_instance("ai_service")

    def check_service_health(self) -> Any:
        """Check AI service health."""
        try:
            service = self.get_service()
            if not service:
                return {
                    "service_name": self.service_name,
                    "is_healthy": False,
                    "status": "unavailable",
                    "details": {"error": "AI service not found"},
                    "timestamp": time.time(),
                }

            # Check if service is available and responsive
            available_providers = service.get_available_providers()
            models_count = sum(len(provider.get_available_models()) for provider in available_providers.values())

            return {
                "service_name": self.service_name,
                "is_healthy": True,
                "status": "operational",
                "details": {
                    "available_providers": list(available_providers.keys()),
                    "total_models": models_count,
                    "service_initialized": True,
                },
                "timestamp": time.time(),
            }
        except Exception as e:
            logger.exception("AI service health check failed")
            return {
                "service_name": self.service_name,
                "is_healthy": False,
                "status": "unhealthy",
                "details": {"error": str(e)},
                "timestamp": time.time(),
            }

    def _setup_ai_endpoints(self) -> None:
        """Setup AI-specific endpoints with rate limiting."""

        @self.router.post("/chat", response_model=AIChatResponse)
        async def chat(request: AIChatRequest):
            """Advanced chat interface with AI models."""
            # Check rate limit before processing
            self.check_rate_limit("/chat")

            return await self._standard_async_operation(
                "chat", self._handle_chat_request, request,
            )

        @self.router.post("/chat/stream")
        async def chat_stream(request: AIChatRequest):
            """Chat with AI model with streaming support."""
            # Check rate limit before processing
            self.check_rate_limit("/chat/stream")

            return await self._standard_async_operation(
                "chat_stream", self._handle_chat_stream_request, request,
            )

        @self.router.post("/assistant", response_model=AIAssistantResponse)
        async def assistant_chat(request: AIAssistantRequest):
            """Chat with AI assistant."""
            # Check rate limit before processing
            self.check_rate_limit("/assistant")

            return await self._standard_async_operation(
                "assistant_chat", self._handle_assistant_request, request,
            )

        @self.router.post("/assistant/stream")
        async def assistant_chat_stream(request: AIAssistantRequest):
            """Chat with AI assistant with streaming support."""
            # Check rate limit before processing
            self.check_rate_limit("/assistant/stream")

            return await self._standard_async_operation(
                "assistant_chat_stream", self._handle_assistant_stream_request, request,
            )

        @self.router.get("/models")
        async def get_models():
            """Get available AI models across all providers."""
            # Check rate limit before processing
            self.check_rate_limit("/models")

            return await self._standard_async_operation(
                "get_models", self._handle_get_models_request,
            )

    async def _handle_chat_request(
        self, request: AIChatRequest,
    ) -> AIChatResponse:
        """Handle chat request with standardized error handling."""
        service = self.get_service()

        # Create chat messages
        messages = [
            ChatMessage(role="system", content=request.system_prompt or "You are a helpful AI assistant."),
            ChatMessage(role="user", content=request.message),
        ]

        # Determine provider
        provider = None
        if request.provider:
            try:
                provider = ProviderType(request.provider)
            except ValueError:
                from ...core.exceptions import ValidationError
                raise ValidationError(f"Invalid provider: {request.provider}")

        # Generate chat completion
        chat_result = await service.generate_chat_completion(
            messages=messages,
            model=request.model,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            provider=provider,
        )

        return AIChatResponse(
            success=True,
            response=chat_result.message.content,
            model=chat_result.model_used,
            provider=chat_result.provider_used.value if chat_result.provider_used else "unknown",
            processing_time=chat_result.processing_time_ms / 1000.0,
            tokens_generated=chat_result.tokens_generated,
            tools_used=[],  # TODO: Implement tool calling
            tool_calls=[],  # TODO: Implement tool calling
        )

    async def _handle_chat_stream_request(self, request: AIChatRequest):
        """Handle streaming chat request."""
        service = self.get_service()

        # Create chat messages
        messages = [
            ChatMessage(role="system", content=request.system_prompt or "You are a helpful AI assistant."),
            ChatMessage(role="user", content=request.message),
        ]

        # Determine provider
        provider = None
        if request.provider:
            try:
                provider = ProviderType(request.provider)
            except ValueError:
                from ...core.exceptions import ValidationError
                raise ValidationError(f"Invalid provider: {request.provider}")

        async def event_generator():
            async for message in service.stream_chat_completion(
                messages=messages,
                model=request.model,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                provider=provider,
            ):
                yield {
                    "type": "token",
                    "data": message.content,
                    "timestamp": time.time(),
                    "metadata": {},
                }
            
            # Signal completion
            yield {
                "type": "complete",
                "data": "",
                "timestamp": time.time(),
                "metadata": {},
            }

        return self.create_sse_response(event_generator())

    async def _handle_assistant_request(
        self, request: AIAssistantRequest,
    ) -> AIAssistantResponse:
        """Handle assistant request with standardized error handling."""
        service = self.get_service()

        # Build assistant system prompt based on type
        system_prompt = self._build_assistant_system_prompt(request.assistant_type)

        # Create chat messages
        messages = [
            ChatMessage(role="system", content=system_prompt),
            ChatMessage(role="user", content=request.message),
        ]

        # Determine provider
        provider = None
        if request.provider:
            try:
                provider = ProviderType(request.provider)
            except ValueError:
                from ...core.exceptions import ValidationError
                raise ValidationError(f"Invalid provider: {request.provider}")

        # Generate chat completion
        chat_result = await service.generate_chat_completion(
            messages=messages,
            model=request.model,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            provider=provider,
        )

        return AIAssistantResponse(
            success=True,
            response=chat_result.message.content,
            assistant_type=request.assistant_type,
            model=chat_result.model_used,
            provider=chat_result.provider_used.value if chat_result.provider_used else "unknown",
            processing_time=chat_result.processing_time_ms / 1000.0,
            tokens_generated=chat_result.tokens_generated,
            tools_used=[],  # TODO: Implement tool calling
            tool_calls=[],  # TODO: Implement tool calling
        )

    async def _handle_assistant_stream_request(self, request: AIAssistantRequest):
        """Handle streaming assistant request."""
        service = self.get_service()

        # Build assistant system prompt based on type
        system_prompt = self._build_assistant_system_prompt(request.assistant_type)

        # Create chat messages
        messages = [
            ChatMessage(role="system", content=system_prompt),
            ChatMessage(role="user", content=request.message),
        ]

        # Determine provider
        provider = None
        if request.provider:
            try:
                provider = ProviderType(request.provider)
            except ValueError:
                from ...core.exceptions import ValidationError
                raise ValidationError(f"Invalid provider: {request.provider}")

        async def event_generator():
            async for message in service.stream_chat_completion(
                messages=messages,
                model=request.model,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                provider=provider,
            ):
                yield {
                    "type": "token",
                    "data": message.content,
                    "timestamp": time.time(),
                    "metadata": {},
                }
            
            # Signal completion
            yield {
                "type": "complete",
                "data": "",
                "timestamp": time.time(),
                "metadata": {},
            }

        return self.create_sse_response(event_generator())

    async def _handle_get_models_request(self):
        """Handle get models request."""
        service = self.get_service()
        available_providers = service.get_available_providers()
        
        models_info = {}
        for provider_name, provider in available_providers.items():
            try:
                models = provider.get_available_models()
                models_info[provider_name] = {
                    "models": models,
                    "count": len(models),
                    "status": "available"
                }
            except Exception as e:
                models_info[provider_name] = {
                    "models": [],
                    "count": 0,
                    "status": "error",
                    "error": str(e)
                }
        
        return {"providers": models_info}

    def _build_assistant_system_prompt(self, assistant_type: str) -> str:
        """Build system prompt based on assistant type."""
        prompts = {
            "reynard": """You are Reynard, a cunning and strategic AI assistant. You are known for your:
- Strategic thinking and problem-solving abilities
- Elegant and efficient solutions
- Fox-like cunning and adaptability
- Professional yet approachable communication style

You help users with complex problems by providing thoughtful, well-reasoned responses that demonstrate strategic thinking and practical wisdom.""",

            "codewolf": """You are CodeWolf, a technical AI assistant specializing in software development. You are known for your:
- Deep technical expertise in programming and software architecture
- Pack-oriented approach to problem-solving
- Security-focused mindset
- Collaborative and protective nature

You help developers with coding challenges, architecture decisions, and technical problem-solving with a focus on security and best practices.""",

            "general": """You are a helpful AI assistant. You provide:
- Clear and accurate information
- Helpful guidance and support
- Professional communication
- Thoughtful responses to user questions

You aim to be useful, harmless, and honest in all your interactions.""",

            "creative": """You are a creative AI assistant. You excel at:
- Creative writing and storytelling
- Artistic and imaginative thinking
- Brainstorming and ideation
- Inspiring and motivating others

You help users explore their creativity and develop innovative ideas.""",

            "analytical": """You are an analytical AI assistant. You specialize in:
- Data analysis and interpretation
- Logical reasoning and problem-solving
- Research and fact-checking
- Critical thinking and evaluation

You help users understand complex information and make data-driven decisions."""
        }
        
        return prompts.get(assistant_type, prompts["general"])


# Create router instance
ai_router = AIServiceRouter()
router = ai_router.get_router()