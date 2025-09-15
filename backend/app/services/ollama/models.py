"""
Data models for Ollama service.
"""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


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


class OllamaChatParams(BaseModel):
    """Parameters for Ollama chat."""

    message: str = Field(..., description="User message")
    model: str = Field("embeddinggemma:latest", description="Ollama model to use")
    system_prompt: str | None = Field(None, description="System prompt for context")
    temperature: float = Field(0.7, description="Sampling temperature")
    max_tokens: int = Field(2048, description="Maximum tokens to generate")
    stream: bool = Field(True, description="Enable streaming response")
    tools: list[dict[str, Any]] | None = Field(None, description="Available tools")
    context: dict[str, Any] | None = Field(None, description="Additional context")


class OllamaAssistantParams(BaseModel):
    """Parameters for ReynardAssistant."""

    message: str = Field(..., description="User message")
    assistant_type: str = Field("reynard", description="Assistant type")
    model: str = Field("embeddinggemma:latest", description="Ollama model to use")
    temperature: float = Field(0.7, description="Sampling temperature")
    max_tokens: int = Field(2048, description="Maximum tokens to generate")
    stream: bool = Field(True, description="Enable streaming response")
    context: dict[str, Any] | None = Field(None, description="Additional context")
    tools_enabled: bool = Field(True, description="Enable tool calling")


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


class OllamaStreamEvent(BaseModel):
    """Event model for streaming Ollama responses."""

    type: str = Field(..., description="Event type (token, tool_call, complete, error)")
    data: str = Field("", description="Event data (token text or tool call)")
    timestamp: float = Field(..., description="Event timestamp")
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata"
    )
