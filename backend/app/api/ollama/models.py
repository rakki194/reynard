"""
Pydantic models for Ollama API endpoints.
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class OllamaChatRequest(BaseModel):
    """Request model for Ollama chat."""
    message: str = Field(..., description="User message", min_length=1, max_length=10000)
    model: str = Field("llama3.1", description="Ollama model to use")
    system_prompt: Optional[str] = Field(None, description="System prompt for context")
    temperature: float = Field(0.7, description="Sampling temperature", ge=0.1, le=2.0)
    max_tokens: int = Field(2048, description="Maximum tokens to generate", ge=1, le=8192)
    stream: bool = Field(True, description="Enable streaming response")
    tools: Optional[List[Dict[str, Any]]] = Field(None, description="Available tools for the assistant")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")


class OllamaChatResponse(BaseModel):
    """Response model for Ollama chat."""
    success: bool = Field(..., description="Whether chat was successful")
    response: str = Field("", description="Assistant response")
    model: str = Field(..., description="Model used for generation")
    processing_time: float = Field(..., description="Processing time in seconds")
    tokens_generated: int = Field(0, description="Number of tokens generated")
    tools_used: List[str] = Field(default_factory=list, description="Tools used during conversation")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class OllamaStreamEvent(BaseModel):
    """Event model for streaming Ollama responses."""
    type: str = Field(..., description="Event type (token, tool_call, complete, error)")
    data: str = Field("", description="Event data (token text or tool call)")
    timestamp: float = Field(..., description="Event timestamp")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class OllamaModelInfo(BaseModel):
    """Information about an Ollama model."""
    name: str = Field(..., description="Model name")
    size: int = Field(..., description="Model size in bytes")
    digest: str = Field(..., description="Model digest")
    modified_at: str = Field(..., description="Last modified timestamp")
    is_available: bool = Field(..., description="Whether model is currently available")
    context_length: int = Field(4096, description="Model context length")
    capabilities: List[str] = Field(default_factory=list, description="Model capabilities")


class OllamaAssistantRequest(BaseModel):
    """Request model for YipYapAssistant."""
    message: str = Field(..., description="User message", min_length=1, max_length=10000)
    assistant_type: str = Field("yipyap", description="Assistant type (yipyap, codewolf)")
    model: str = Field("llama3.1", description="Ollama model to use")
    temperature: float = Field(0.7, description="Sampling temperature", ge=0.1, le=2.0)
    max_tokens: int = Field(2048, description="Maximum tokens to generate", ge=1, le=8192)
    stream: bool = Field(True, description="Enable streaming response")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")
    tools_enabled: bool = Field(True, description="Enable tool calling")


class OllamaAssistantResponse(BaseModel):
    """Response model for YipYapAssistant."""
    success: bool = Field(..., description="Whether assistant response was successful")
    response: str = Field("", description="Assistant response")
    assistant_type: str = Field(..., description="Assistant type used")
    model: str = Field(..., description="Model used for generation")
    processing_time: float = Field(..., description="Processing time in seconds")
    tokens_generated: int = Field(0, description="Number of tokens generated")
    tools_used: List[str] = Field(default_factory=list, description="Tools used during conversation")
    reasoning: Optional[str] = Field(None, description="Assistant reasoning process")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class OllamaConfig(BaseModel):
    """Configuration for Ollama service."""
    enabled: bool = Field(True, description="Whether Ollama service is enabled")
    base_url: str = Field("http://localhost:11434", description="Ollama server URL")
    default_model: str = Field("llama3.1", description="Default model for generation")
    timeout_seconds: int = Field(300, description="Request timeout in seconds")
    max_concurrent_requests: int = Field(5, description="Maximum concurrent requests")
    assistant_enabled: bool = Field(True, description="Enable YipYapAssistant")
    tools_enabled: bool = Field(True, description="Enable tool calling")
    context_awareness: bool = Field(True, description="Enable context awareness")


class OllamaStats(BaseModel):
    """Statistics for Ollama service."""
    total_requests: int = Field(..., description="Total chat requests")
    successful_requests: int = Field(..., description="Successful chat requests")
    failed_requests: int = Field(..., description="Failed chat requests")
    average_processing_time: float = Field(..., description="Average processing time in seconds")
    total_tokens_generated: int = Field(..., description="Total tokens generated")
    model_usage: Dict[str, int] = Field(..., description="Model usage statistics")
    assistant_usage: Dict[str, int] = Field(..., description="Assistant usage statistics")
    tools_usage: Dict[str, int] = Field(..., description="Tools usage statistics")
    error_rate: float = Field(..., description="Error rate percentage")
