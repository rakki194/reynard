"""
🦊 Reynard Ollama API Data Models
=================================

Comprehensive Pydantic data models for Ollama API endpoints within the Reynard
ecosystem. This module provides type-safe data structures for request and response
handling, validation, and serialization for all Ollama-related API interactions.

The Ollama Data Models provide:
- Type-safe request and response models with comprehensive validation
- Streaming event models for real-time AI interactions
- Assistant request models with advanced configuration options
- Tool calling models for function execution and integration
- Performance metrics models for monitoring and optimization
- Error handling models with detailed error information
- Metadata models for additional context and configuration

Key Features:
- Type Safety: Comprehensive Pydantic models with strict validation
- Request Validation: Input validation with length limits and type checking
- Response Models: Structured response data with performance metrics
- Streaming Support: Event-based models for real-time interactions
- Tool Integration: Models for function calling and tool execution
- Performance Tracking: Metrics collection and monitoring support
- Error Handling: Comprehensive error models with detailed information
- Documentation: Self-documenting models with field descriptions

Model Categories:
- Request Models: Input validation and parameter handling
- Response Models: Structured output with performance metrics
- Event Models: Streaming and real-time interaction support
- Assistant Models: Advanced AI assistant configuration
- Tool Models: Function calling and tool execution support
- Error Models: Comprehensive error handling and reporting

The data models ensure type safety, validation, and comprehensive documentation
for all Ollama API interactions within the Reynard ecosystem.

Author: Reynard Development Team
Version: 1.0.0
"""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class OllamaChatRequest(BaseModel):
    """
    Request model for Ollama chat interactions with comprehensive validation.
    
    Provides type-safe request handling for chat interactions with Ollama AI models,
    including message validation, model configuration, and advanced parameters for
    controlling AI behavior and response generation.
    
    Attributes:
        message (str): User message for AI interaction (1-10000 characters)
        model (str): Ollama model to use for generation (default: "embeddinggemma:latest")
        system_prompt (str | None): System prompt for context and behavior control
        temperature (float): Sampling temperature for response creativity (0.1-2.0)
        max_tokens (int): Maximum tokens to generate (1-8192)
        stream (bool): Enable streaming response for real-time interaction
        tools (list[dict] | None): Available tools for function calling
        context (dict | None): Additional context for the conversation
    """

    message: str = Field(
        ..., description="User message", min_length=1, max_length=10000
    )
    model: str = Field("embeddinggemma:latest", description="Ollama model to use")
    system_prompt: str | None = Field(None, description="System prompt for context")
    temperature: float = Field(0.7, description="Sampling temperature", ge=0.1, le=2.0)
    max_tokens: int = Field(
        2048, description="Maximum tokens to generate", ge=1, le=8192
    )
    stream: bool = Field(True, description="Enable streaming response")
    tools: list[dict[str, Any]] | None = Field(
        None, description="Available tools for the assistant"
    )
    context: dict[str, Any] | None = Field(None, description="Additional context")


class OllamaChatResponse(BaseModel):
    """Response model for Ollama chat."""

    success: bool = Field(..., description="Whether chat was successful")
    response: str = Field("", description="Assistant response")
    model: str = Field(..., description="Model used for generation")
    processing_time: float = Field(..., description="Processing time in seconds")
    tokens_generated: int = Field(0, description="Number of tokens generated")
    tools_used: list[str] = Field(
        default_factory=list, description="Tools used during conversation"
    )
    tool_calls: list[dict[str, Any]] = Field(
        default_factory=list, description="Tool calls made by the model"
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata"
    )


class OllamaStreamEvent(BaseModel):
    """Event model for streaming Ollama responses."""

    type: str = Field(..., description="Event type (token, tool_call, complete, error)")
    data: str = Field("", description="Event data (token text or tool call)")
    timestamp: float = Field(..., description="Event timestamp")
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata"
    )


class OllamaModelInfo(BaseModel):
    """Information about an Ollama model."""

    name: str = Field(..., description="Model name")
    size: int = Field(..., description="Model size in bytes")
    digest: str = Field(..., description="Model digest")
    modified_at: str = Field(..., description="Last modified timestamp")
    is_available: bool = Field(..., description="Whether model is currently available")
    context_length: int = Field(4096, description="Model context length")
    capabilities: list[str] = Field(
        default_factory=list, description="Model capabilities"
    )


class OllamaAssistantRequest(BaseModel):
    """Request model for ReynardAssistant."""

    message: str = Field(
        ..., description="User message", min_length=1, max_length=10000
    )
    assistant_type: str = Field(
        "reynard", description="Assistant type (reynard, codewolf)"
    )
    model: str = Field("embeddinggemma:latest", description="Ollama model to use")
    temperature: float = Field(0.7, description="Sampling temperature", ge=0.1, le=2.0)
    max_tokens: int = Field(
        2048, description="Maximum tokens to generate", ge=1, le=8192
    )
    stream: bool = Field(True, description="Enable streaming response")
    context: dict[str, Any] | None = Field(None, description="Additional context")
    tools_enabled: bool = Field(True, description="Enable tool calling")


class OllamaAssistantResponse(BaseModel):
    """Response model for ReynardAssistant."""

    success: bool = Field(..., description="Whether assistant response was successful")
    response: str = Field("", description="Assistant response")
    assistant_type: str = Field(..., description="Assistant type used")
    model: str = Field(..., description="Model used for generation")
    processing_time: float = Field(..., description="Processing time in seconds")
    tokens_generated: int = Field(0, description="Number of tokens generated")
    tools_used: list[str] = Field(
        default_factory=list, description="Tools used during conversation"
    )
    tool_calls: list[dict[str, Any]] = Field(
        default_factory=list, description="Tool calls made by the assistant"
    )
    reasoning: str | None = Field(None, description="Assistant reasoning process")
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata"
    )


class OllamaConfig(BaseModel):
    """Configuration for Ollama service."""

    enabled: bool = Field(True, description="Whether Ollama service is enabled")
    base_url: str = Field("http://localhost:11434", description="Ollama server URL")
    default_model: str = Field(
        "embeddinggemma:latest", description="Default model for generation"
    )
    timeout_seconds: int = Field(300, description="Request timeout in seconds")
    max_concurrent_requests: int = Field(5, description="Maximum concurrent requests")
    assistant_enabled: bool = Field(True, description="Enable ReynardAssistant")
    tools_enabled: bool = Field(True, description="Enable tool calling")
    context_awareness: bool = Field(True, description="Enable context awareness")


class OllamaStats(BaseModel):
    """Statistics for Ollama service."""

    model_config = ConfigDict(protected_namespaces=())

    total_requests: int = Field(..., description="Total chat requests")
    successful_requests: int = Field(..., description="Successful chat requests")
    failed_requests: int = Field(..., description="Failed chat requests")
    average_processing_time: float = Field(
        ..., description="Average processing time in seconds"
    )
    total_tokens_generated: int = Field(..., description="Total tokens generated")
    usage_stats: dict[str, int] = Field(
        ..., description="Model usage statistics", alias="model_usage"
    )
    assistant_usage: dict[str, int] = Field(
        ..., description="Assistant usage statistics"
    )
    tools_usage: dict[str, int] = Field(..., description="Tools usage statistics")
    error_rate: float = Field(..., description="Error rate percentage")
