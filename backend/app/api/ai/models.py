"""🦊 Reynard AI API Data Models
=======================================

Comprehensive Pydantic data models for AI API endpoints within the Reynard
ecosystem. This module provides type-safe data structures for request and response
handling, validation, and serialization for all AI-related API interactions across
multiple providers (Ollama, vLLM, SGLang, LLaMA.cpp).

The AI Data Models provide:
- Type-safe request and response models with comprehensive validation
- Streaming event models for real-time AI interactions
- Assistant request models with advanced configuration options
- Tool calling models for function execution and integration
- Performance metrics models for monitoring and optimization
- Error handling models with detailed error information
- Metadata models for additional context and configuration
- Multi-provider support with provider-specific configurations

Key Features:
- Type Safety: Comprehensive Pydantic models with strict validation
- Request Validation: Input validation with length limits and type checking
- Response Models: Structured response data with performance metrics
- Streaming Support: Event-based models for real-time interactions
- Tool Integration: Models for function calling and tool execution
- Performance Tracking: Metrics collection and monitoring support
- Error Handling: Comprehensive error models with detailed information
- Documentation: Self-documenting models with field descriptions
- Multi-Provider: Support for multiple AI providers with consistent interface

Model Categories:
- Request Models: Input validation and parameter handling
- Response Models: Structured output with performance metrics
- Event Models: Streaming and real-time interaction support
- Assistant Models: Advanced AI assistant configuration
- Tool Models: Function calling and tool execution support
- Error Models: Comprehensive error handling and reporting
- Provider Models: Multi-provider configuration and management

The data models ensure type safety, validation, and comprehensive documentation
for all AI API interactions within the Reynard ecosystem.

Author: Reynard Development Team
Version: 3.0.0 - AI service with multi-provider support
"""

import re
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class AIChatRequest(BaseModel):
    """Request model for AI chat interactions with comprehensive validation.

    Provides type-safe request handling for chat interactions with AI models across
    multiple providers, including message validation, model configuration, and advanced
    parameters for controlling AI behavior and response generation.

    Attributes:
        message (str): User message for AI interaction (1-10000 characters)
        model (str): AI model to use for generation (default: "llama3.1:latest")
        provider (str | None): AI provider to use (ollama, vllm, sglang, llamacpp)
        system_prompt (str | None): System prompt for context and behavior control
        temperature (float): Sampling temperature for response creativity (0.1-2.0)
        max_tokens (int): Maximum tokens to generate (1-8192)
        stream (bool): Enable streaming response for real-time interaction
        tools (list[dict] | None): Available tools for function calling
        context (dict | None): Additional context for the conversation

    """

    message: str = Field(
        ...,
        description="User message",
        min_length=1,
        max_length=10000,
    )
    model: str = Field("llama3.1:latest", description="AI model to use")
    provider: str | None = Field(None, description="AI provider to use")
    system_prompt: str | None = Field(None, description="System prompt for context")
    temperature: float = Field(0.7, description="Sampling temperature", ge=0.1, le=2.0)
    max_tokens: int = Field(
        2048,
        description="Maximum tokens to generate",
        ge=1,
        le=8192,
    )
    stream: bool = Field(True, description="Enable streaming response")
    tools: list[dict[str, Any]] | None = Field(
        None,
        description="Available tools for the assistant",
    )
    context: dict[str, Any] | None = Field(None, description="Additional context")

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        """Validate message content for security and quality."""
        if not v or not v.strip():
            raise ValueError("Message cannot be empty or whitespace only")

        # Check for potential injection attempts
        dangerous_patterns = [
            r"<script[^>]*>.*?</script>",  # Script tags
            r"javascript:",  # JavaScript protocol
            r"data:text/html",  # Data URLs
            r"vbscript:",  # VBScript protocol
            r"on\w+\s*=",  # Event handlers
        ]

        for pattern in dangerous_patterns:
            if re.search(pattern, v, re.IGNORECASE):
                raise ValueError(
                    f"Message contains potentially dangerous content: {pattern}",
                )

        # Check for excessive repetition (potential spam)
        words = v.split()
        if len(words) > 10:
            word_counts = {}
            for word in words:
                word_counts[word] = word_counts.get(word, 0) + 1

            # Check if any word appears more than 30% of the time
            max_repetition = max(word_counts.values()) if word_counts else 0
            if max_repetition > len(words) * 0.3:
                raise ValueError("Message contains excessive repetition")

        return v.strip()

    @field_validator("model")
    @classmethod
    def validate_model(cls, v: str) -> str:
        """Validate model name format and safety."""
        if not v or not v.strip():
            raise ValueError("Model name cannot be empty")

        # Check for valid model name format (alphanumeric, colon, dash, underscore, dot)
        if not re.match(r"^[a-zA-Z0-9:._-]+$", v):
            raise ValueError("Model name contains invalid characters")

        # Check for reasonable length
        if len(v) > 100:
            raise ValueError("Model name is too long")

        return v.strip()

    @field_validator("provider")
    @classmethod
    def validate_provider(cls, v: str | None) -> str | None:
        """Validate provider name."""
        if v is None:
            return v

        valid_providers = ["ollama", "vllm", "sglang", "llamacpp"]
        if v.lower() not in valid_providers:
            raise ValueError(f"Invalid provider. Must be one of: {valid_providers}")

        return v.lower()

    @field_validator("system_prompt")
    @classmethod
    def validate_system_prompt(cls, v: str | None) -> str | None:
        """Validate system prompt content."""
        if v is None:
            return v

        if not v.strip():
            raise ValueError("System prompt cannot be empty or whitespace only")

        # Check for reasonable length
        if len(v) > 50000:  # 50KB limit
            raise ValueError("System prompt is too long")

        # Check for dangerous patterns
        dangerous_patterns = [
            r"<script[^>]*>.*?</script>",
            r"javascript:",
            r"data:text/html",
            r"vbscript:",
        ]

        for pattern in dangerous_patterns:
            if re.search(pattern, v, re.IGNORECASE):
                raise ValueError(
                    f"System prompt contains potentially dangerous content: {pattern}",
                )

        return v.strip()

    @field_validator("tools")
    @classmethod
    def validate_tools(
        cls,
        v: list[dict[str, Any]] | None,
    ) -> list[dict[str, Any]] | None:
        """Validate tools configuration."""
        if v is None:
            return v

        if len(v) > 50:  # Reasonable limit on number of tools
            raise ValueError("Too many tools provided (max 50)")

        for i, tool in enumerate(v):
            if not isinstance(tool, dict):
                raise ValueError(f"Tool {i} must be a dictionary")

            # Check required tool fields
            if "name" not in tool:
                raise ValueError(f"Tool {i} missing required 'name' field")

            if not isinstance(tool["name"], str) or not tool["name"].strip():
                raise ValueError(f"Tool {i} name must be a non-empty string")

            # Validate tool name format
            if not re.match(r"^[a-zA-Z0-9_-]+$", tool["name"]):
                raise ValueError(f"Tool {i} name contains invalid characters")

            # Check for reasonable tool size
            tool_str = str(tool)
            if len(tool_str) > 10000:  # 10KB per tool
                raise ValueError(f"Tool {i} is too large")

        return v

    @field_validator("context")
    @classmethod
    def validate_context(cls, v: dict[str, Any] | None) -> dict[str, Any] | None:
        """Validate context data."""
        if v is None:
            return v

        # Check for reasonable context size
        context_str = str(v)
        if len(context_str) > 100000:  # 100KB limit
            raise ValueError("Context data is too large")

        # Check for reasonable number of keys
        if len(v) > 100:
            raise ValueError("Too many context keys (max 100)")

        # Validate key names
        for key in v.keys():
            if not isinstance(key, str):
                raise ValueError("Context keys must be strings")
            if not re.match(r"^[a-zA-Z0-9_-]+$", key):
                raise ValueError(f"Context key '{key}' contains invalid characters")

        return v

    @model_validator(mode="after")
    def validate_request_consistency(self) -> "AIChatRequest":
        """Validate overall request consistency."""
        # Check if max_tokens is reasonable for the message length
        message_text = getattr(self, "message", "")
        if message_text:
            estimated_tokens = len(message_text.split()) * 1.3  # Rough estimation
            if self.max_tokens < estimated_tokens * 0.5:
                raise ValueError("max_tokens may be too low for the message length")

        # Check if temperature and max_tokens combination makes sense
        if self.temperature > 1.5 and self.max_tokens > 4000:
            # High temperature with high token count might be inefficient
            pass  # Just a warning, not an error

        return self


class AIChatResponse(BaseModel):
    """Response model for AI chat."""

    success: bool = Field(..., description="Whether chat was successful")
    response: str = Field("", description="AI response")
    model: str = Field(..., description="Model used for generation")
    provider: str = Field(..., description="Provider used for generation")
    processing_time: float = Field(..., description="Processing time in seconds")
    tokens_generated: int = Field(0, description="Number of tokens generated")
    tools_used: list[str] = Field(
        default_factory=list,
        description="Tools used during conversation",
    )
    tool_calls: list[dict[str, Any]] = Field(
        default_factory=list,
        description="Tool calls made by the model",
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional metadata",
    )


class AIStreamEvent(BaseModel):
    """Event model for streaming AI responses."""

    type: str = Field(..., description="Event type (token, tool_call, complete, error)")
    data: str = Field("", description="Event data (token text or tool call)")
    timestamp: float = Field(..., description="Event timestamp")
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional metadata",
    )


class AIModelInfo(BaseModel):
    """Information about an AI model."""

    name: str = Field(..., description="Model name")
    provider: str = Field(..., description="Provider name")
    size: int | None = Field(None, description="Model size in bytes")
    digest: str | None = Field(None, description="Model digest")
    modified_at: str | None = Field(None, description="Last modified timestamp")
    is_available: bool = Field(..., description="Whether model is currently available")
    context_length: int = Field(4096, description="Model context length")
    capabilities: list[str] = Field(
        default_factory=list,
        description="Model capabilities",
    )


class AIAssistantRequest(BaseModel):
    """Request model for AI assistant with comprehensive validation."""

    message: str = Field(
        ...,
        description="User message",
        min_length=1,
        max_length=10000,
    )
    assistant_type: str = Field(
        "reynard",
        description="Assistant type (reynard, codewolf, general, creative, analytical)",
    )
    model: str = Field("llama3.1:latest", description="AI model to use")
    provider: str | None = Field(None, description="AI provider to use")
    temperature: float = Field(0.7, description="Sampling temperature", ge=0.1, le=2.0)
    max_tokens: int = Field(
        2048,
        description="Maximum tokens to generate",
        ge=1,
        le=8192,
    )
    stream: bool = Field(True, description="Enable streaming response")
    context: dict[str, Any] | None = Field(None, description="Additional context")
    tools_enabled: bool = Field(True, description="Enable tool calling")

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        """Validate message content for security and quality."""
        if not v or not v.strip():
            raise ValueError("Message cannot be empty or whitespace only")

        # Check for potential injection attempts
        dangerous_patterns = [
            r"<script[^>]*>.*?</script>",  # Script tags
            r"javascript:",  # JavaScript protocol
            r"data:text/html",  # Data URLs
            r"vbscript:",  # VBScript protocol
            r"on\w+\s*=",  # Event handlers
        ]

        for pattern in dangerous_patterns:
            if re.search(pattern, v, re.IGNORECASE):
                raise ValueError(
                    f"Message contains potentially dangerous content: {pattern}",
                )

        # Check for excessive repetition (potential spam)
        words = v.split()
        if len(words) > 10:
            word_counts = {}
            for word in words:
                word_counts[word] = word_counts.get(word, 0) + 1

            # Check if any word appears more than 30% of the time
            max_repetition = max(word_counts.values()) if word_counts else 0
            if max_repetition > len(words) * 0.3:
                raise ValueError("Message contains excessive repetition")

        return v.strip()

    @field_validator("assistant_type")
    @classmethod
    def validate_assistant_type(cls, v: str) -> str:
        """Validate assistant type."""
        valid_types = ["reynard", "codewolf", "general", "creative", "analytical"]
        if v not in valid_types:
            raise ValueError(f"Invalid assistant type. Must be one of: {valid_types}")
        return v

    @field_validator("model")
    @classmethod
    def validate_model(cls, v: str) -> str:
        """Validate model name format and safety."""
        if not v or not v.strip():
            raise ValueError("Model name cannot be empty")

        # Check for valid model name format (alphanumeric, colon, dash, underscore, dot)
        if not re.match(r"^[a-zA-Z0-9:._-]+$", v):
            raise ValueError("Model name contains invalid characters")

        # Check for reasonable length
        if len(v) > 100:
            raise ValueError("Model name is too long")

        return v.strip()

    @field_validator("provider")
    @classmethod
    def validate_provider(cls, v: str | None) -> str | None:
        """Validate provider name."""
        if v is None:
            return v

        valid_providers = ["ollama", "vllm", "sglang", "llamacpp"]
        if v.lower() not in valid_providers:
            raise ValueError(f"Invalid provider. Must be one of: {valid_providers}")

        return v.lower()

    @field_validator("context")
    @classmethod
    def validate_context(cls, v: dict[str, Any] | None) -> dict[str, Any] | None:
        """Validate context data."""
        if v is None:
            return v

        # Check for reasonable context size
        context_str = str(v)
        if len(context_str) > 100000:  # 100KB limit
            raise ValueError("Context data is too large")

        # Check for reasonable number of keys
        if len(v) > 100:
            raise ValueError("Too many context keys (max 100)")

        # Validate key names
        for key in v.keys():
            if not isinstance(key, str):
                raise ValueError("Context keys must be strings")
            if not re.match(r"^[a-zA-Z0-9_-]+$", key):
                raise ValueError(f"Context key '{key}' contains invalid characters")

        return v

    @model_validator(mode="after")
    def validate_request_consistency(self) -> "AIAssistantRequest":
        """Validate overall request consistency."""
        # Check if max_tokens is reasonable for the message length
        message_text = getattr(self, "message", "")
        if message_text:
            estimated_tokens = len(message_text.split()) * 1.3  # Rough estimation
            if self.max_tokens < estimated_tokens * 0.5:
                raise ValueError("max_tokens may be too low for the message length")

        return self


class AIAssistantResponse(BaseModel):
    """Response model for AI assistant."""

    success: bool = Field(..., description="Whether assistant response was successful")
    response: str = Field("", description="Assistant response")
    assistant_type: str = Field(..., description="Assistant type used")
    model: str = Field(..., description="Model used for generation")
    provider: str = Field(..., description="Provider used for generation")
    processing_time: float = Field(..., description="Processing time in seconds")
    tokens_generated: int = Field(0, description="Number of tokens generated")
    tools_used: list[str] = Field(
        default_factory=list,
        description="Tools used during conversation",
    )
    tool_calls: list[dict[str, Any]] = Field(
        default_factory=list,
        description="Tool calls made by the assistant",
    )
    reasoning: str | None = Field(None, description="Assistant reasoning process")
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional metadata",
    )


class AIConfig(BaseModel):
    """Configuration for AI service."""

    enabled: bool = Field(True, description="Whether AI service is enabled")
    default_model: str = Field(
        "llama3.1:latest",
        description="Default model for generation",
    )
    default_provider: str = Field("ollama", description="Default provider to use")
    timeout_seconds: int = Field(300, description="Request timeout in seconds")
    max_concurrent_requests: int = Field(5, description="Maximum concurrent requests")
    assistant_enabled: bool = Field(True, description="Enable AI assistants")
    tools_enabled: bool = Field(True, description="Enable tool calling")
    context_awareness: bool = Field(True, description="Enable context awareness")
    providers: dict[str, dict[str, Any]] = Field(
        default_factory=dict,
        description="Provider-specific configurations",
    )


class AIStats(BaseModel):
    """Statistics for AI service."""

    model_config = ConfigDict(protected_namespaces=())

    total_requests: int = Field(..., description="Total AI requests")
    successful_requests: int = Field(..., description="Successful AI requests")
    failed_requests: int = Field(..., description="Failed AI requests")
    average_processing_time: float = Field(
        ...,
        description="Average processing time in seconds",
    )
    total_tokens_generated: int = Field(..., description="Total tokens generated")
    provider_usage: dict[str, int] = Field(
        ...,
        description="Provider usage statistics",
    )
    model_usage: dict[str, int] = Field(
        ...,
        description="Model usage statistics",
    )
    assistant_usage: dict[str, int] = Field(
        ...,
        description="Assistant usage statistics",
    )
    tools_usage: dict[str, int] = Field(..., description="Tools usage statistics")
    error_rate: float = Field(..., description="Error rate percentage")
