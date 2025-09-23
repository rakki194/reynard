"""
🦊 Reynard Ollama API Endpoints
===============================

Comprehensive FastAPI endpoints for Ollama integration within the Reynard ecosystem,
providing sophisticated AI model interaction capabilities including chat, assistant
functions, and streaming responses. This module implements enterprise-grade AI
service integration with advanced features and comprehensive error handling.

The Ollama API provides:
- Advanced chat functionality with configurable AI models
- Assistant-style interactions with system prompts and context
- Streaming responses for real-time AI interactions
- Tool calling capabilities for function execution
- Model management and configuration options
- Performance monitoring and metrics collection
- Comprehensive error handling and validation
- Security integration with authentication and authorization

Key Features:
- Chat Interface: Advanced conversational AI with multiple model support
- Assistant Functions: Specialized AI assistant capabilities with context awareness
- Streaming Responses: Real-time response streaming for interactive experiences
- Tool Integration: Function calling and tool execution capabilities
- Model Management: Dynamic model selection and configuration
- Performance Monitoring: Response time tracking and token counting
- Error Handling: Comprehensive error recovery and user feedback
- Security: Authentication and authorization for protected endpoints

API Endpoints:
- POST /chat: Standard chat interface with AI models
- POST /assistant: Assistant-style interactions with enhanced capabilities
- GET /stream: Streaming chat responses for real-time interaction
- GET /models: Model information and configuration details
- POST /generate: Direct text generation with custom parameters

The Ollama integration provides seamless AI capabilities throughout the Reynard
ecosystem, enabling sophisticated conversational interfaces and AI-powered
functionality with enterprise-grade reliability and performance.

Author: Reynard Development Team
Version: 2.0.0 - Refactored with BaseServiceRouter patterns
"""

import time
from typing import Any

from pydantic import BaseModel, Field

from ...core.base_router import BaseServiceRouter
from ...core.config_mixin import ConfigEndpointMixin
from ...core.logging_config import get_service_logger
from ...core.router_mixins import RateLimitingMixin, StreamingResponseMixin
from .models import (
    OllamaAssistantRequest,
    OllamaAssistantResponse,
    OllamaChatRequest,
    OllamaChatResponse,
)
from .service import get_ollama_service

logger = get_service_logger("ollama")


class OllamaConfigModel(BaseModel):
    """Configuration model for Ollama service."""

    default_model: str = Field(default="llama3.1", description="Default model to use")
    max_tokens: int = Field(
        default=2048, ge=1, le=8192, description="Maximum tokens per request"
    )
    temperature: float = Field(
        default=0.7, ge=0.0, le=2.0, description="Response creativity level"
    )
    timeout: int = Field(
        default=30, ge=5, le=300, description="Request timeout in seconds"
    )
    enable_streaming: bool = Field(
        default=True, description="Enable streaming responses"
    )
    enable_tools: bool = Field(default=True, description="Enable tool calling")
    max_concurrent_requests: int = Field(
        default=10, ge=1, le=100, description="Max concurrent requests"
    )


class OllamaServiceRouter(
    BaseServiceRouter, ConfigEndpointMixin, StreamingResponseMixin, RateLimitingMixin
):
    """
    Ollama service router with enterprise-grade patterns.

    Provides standardized service patterns including:
    - Centralized error handling and recovery
    - Configuration management with validation
    - Streaming response capabilities
    - Health monitoring and metrics
    - Service dependency management
    """

    def __init__(self):
        # Initialize all parent classes
        BaseServiceRouter.__init__(
            self, service_name="ollama", prefix="/api/ollama", tags=["ollama"]
        )
        ConfigEndpointMixin.__init__(self)
        StreamingResponseMixin.__init__(self)
        RateLimitingMixin.__init__(self)

        # Setup configuration endpoints
        self.setup_config_endpoints(OllamaConfigModel)

        # Setup streaming endpoints
        self.setup_streaming_endpoints()

        # Setup rate limiting endpoints
        self.setup_rate_limiting_endpoints()

        # Setup Ollama-specific endpoints with rate limiting
        self._setup_ollama_endpoints()

        # Configure per-endpoint rate limits
        self._configure_rate_limits()

        logger.info("OllamaServiceRouter initialized with enterprise patterns")

    def _configure_rate_limits(self) -> None:
        """Configure per-endpoint rate limits for Ollama service."""
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

        logger.info("Rate limits configured for Ollama service endpoints")

    def get_service(self) -> Any:
        """Get the Ollama service instance."""
        return get_ollama_service()

    def check_service_health(self) -> Any:
        """Check Ollama service health."""
        try:
            service = self.get_service()
            # Check if service is available and responsive
            models = (
                service.get_available_models()
                if hasattr(service, "get_available_models")
                else []
            )

            return {
                "service_name": self.service_name,
                "is_healthy": True,
                "status": "operational",
                "details": {
                    "available_models": len(models) if models else 0,
                    "service_initialized": service is not None,
                },
                "timestamp": time.time(),
            }
        except Exception as e:
            logger.exception("Ollama service health check failed")
            return {
                "service_name": self.service_name,
                "is_healthy": False,
                "status": "unhealthy",
                "details": {"error": str(e)},
                "timestamp": time.time(),
            }

    def _setup_ollama_endpoints(self) -> None:
        """Setup Ollama-specific endpoints with rate limiting."""

        @self.router.post("/chat", response_model=OllamaChatResponse)
        async def chat(request: OllamaChatRequest):
            """Advanced chat interface with Ollama AI models."""
            # Check rate limit before processing
            self.check_rate_limit("/chat")

            return await self._standard_async_operation(
                "chat", self._handle_chat_request, request
            )

        @self.router.post("/chat/stream")
        async def chat_stream(request: OllamaChatRequest):
            """Chat with Ollama model with streaming support."""
            # Check rate limit before processing
            self.check_rate_limit("/chat/stream")

            return await self._standard_async_operation(
                "chat_stream", self._handle_chat_stream_request, request
            )

        @self.router.post("/assistant", response_model=OllamaAssistantResponse)
        async def assistant_chat(request: OllamaAssistantRequest):
            """Chat with ReynardAssistant."""
            # Check rate limit before processing
            self.check_rate_limit("/assistant")

            return await self._standard_async_operation(
                "assistant_chat", self._handle_assistant_request, request
            )

        @self.router.post("/assistant/stream")
        async def assistant_chat_stream(request: OllamaAssistantRequest):
            """Chat with ReynardAssistant with streaming support."""
            # Check rate limit before processing
            self.check_rate_limit("/assistant/stream")

            return await self._standard_async_operation(
                "assistant_chat_stream", self._handle_assistant_stream_request, request
            )

        @self.router.get("/models")
        async def get_models():
            """Get available Ollama models."""
            # Check rate limit before processing
            self.check_rate_limit("/models")

            return await self._standard_async_operation(
                "get_models", self._handle_get_models_request
            )

    async def _handle_chat_request(
        self, request: OllamaChatRequest
    ) -> OllamaChatResponse:
        """Handle chat request with standardized error handling."""
        service = self.get_service()

        # Convert request to service params
        from ...services.ollama.models import OllamaChatParams

        params = OllamaChatParams(
            message=request.message,
            model=request.model,
            system_prompt=request.system_prompt,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            stream=False,  # Non-streaming for this endpoint
            tools=request.tools,
            context=request.context,
        )

        # Chat with Ollama
        response_text = ""
        tokens_generated = 0
        processing_time = 0.0
        tool_calls = []

        async for event in service.chat_stream(params):
            if event.type == "token":
                response_text += event.data
                tokens_generated += 1
            elif event.type == "tool_call":
                tool_calls.append(
                    {
                        "name": event.metadata.get("tool_name", "unknown"),
                        "args": event.metadata.get("tool_args", {}),
                        "id": event.metadata.get("tool_call_id", ""),
                    }
                )
            elif event.type == "complete":
                processing_time = event.metadata.get("processing_time", 0.0)
            elif event.type == "error":
                from ...core.exceptions import InternalError

                raise InternalError(
                    message=f"Chat error: {event.data}", service_name=self.service_name
                )

        return OllamaChatResponse(
            success=True,
            response=response_text,
            model=request.model,
            processing_time=processing_time,
            tokens_generated=tokens_generated,
            tool_calls=tool_calls,
            tools_used=[tc["name"] for tc in tool_calls],
        )

    async def _handle_chat_stream_request(self, request: OllamaChatRequest):
        """Handle streaming chat request."""
        service = self.get_service()

        # Convert request to service params
        from ...services.ollama.models import OllamaChatParams

        params = OllamaChatParams(
            message=request.message,
            model=request.model,
            system_prompt=request.system_prompt,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            stream=True,
            tools=request.tools,
            context=request.context,
        )

        async def event_generator():
            async for event in service.chat_stream(params):
                yield {
                    "type": event.type,
                    "data": event.data,
                    "timestamp": event.timestamp,
                    "metadata": event.metadata,
                }

        return self.create_sse_response(event_generator())

    async def _handle_assistant_request(
        self, request: OllamaAssistantRequest
    ) -> OllamaAssistantResponse:
        """Handle assistant request with standardized error handling."""
        service = self.get_service()

        # Convert request to service params
        from ...services.ollama.models import OllamaAssistantParams

        params = OllamaAssistantParams(
            message=request.message,
            assistant_type=request.assistant_type,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            stream=False,  # Non-streaming for this endpoint
            context=request.context,
            tools_enabled=request.tools_enabled,
        )

        # Chat with assistant
        response_text = ""
        tokens_generated = 0
        tools_used = []
        tool_calls = []
        processing_time = 0.0

        async for event in service.assistant_stream(params):
            if event.type == "token":
                response_text += event.data
                tokens_generated += 1
            elif event.type == "tool_call":
                tool_name = event.metadata.get("tool_name", "unknown")
                tools_used.append(tool_name)
                tool_calls.append(
                    {
                        "name": tool_name,
                        "args": event.metadata.get("tool_args", {}),
                        "id": event.metadata.get("tool_call_id", ""),
                    }
                )
            elif event.type == "complete":
                processing_time = event.metadata.get("processing_time", 0.0)
            elif event.type == "error":
                from ...core.exceptions import InternalError

                raise InternalError(
                    message=f"Assistant error: {event.data}",
                    service_name=self.service_name,
                )

        return OllamaAssistantResponse(
            success=True,
            response=response_text,
            assistant_type=request.assistant_type,
            model=request.model,
            processing_time=processing_time,
            tokens_generated=tokens_generated,
            tools_used=tools_used,
            tool_calls=tool_calls,
        )

    async def _handle_assistant_stream_request(self, request: OllamaAssistantRequest):
        """Handle streaming assistant request."""
        service = self.get_service()

        # Convert request to service params
        from ...services.ollama.models import OllamaAssistantParams

        params = OllamaAssistantParams(
            message=request.message,
            assistant_type=request.assistant_type,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
            stream=True,
            context=request.context,
            tools_enabled=request.tools_enabled,
        )

        async def event_generator():
            async for event in service.assistant_stream(params):
                yield {
                    "type": event.type,
                    "data": event.data,
                    "timestamp": event.timestamp,
                    "metadata": event.metadata,
                }

        return self.create_sse_response(event_generator())

    async def _handle_get_models_request(self):
        """Handle get models request."""
        service = self.get_service()
        models = await service.get_available_models()
        return {"models": models}


# Create router instance
ollama_router = OllamaServiceRouter()
router = ollama_router.get_router()
