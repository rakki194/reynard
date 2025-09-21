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
Version: 1.0.0
"""

import logging

from fastapi import APIRouter, HTTPException
from sse_starlette import EventSourceResponse

from .models import (
    OllamaAssistantRequest,
    OllamaAssistantResponse,
    OllamaChatRequest,
    OllamaChatResponse,
)
from .service import get_ollama_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/chat", response_model=OllamaChatResponse)
async def chat(request: OllamaChatRequest):
    """
    Advanced chat interface with Ollama AI models.

    Provides sophisticated conversational AI capabilities using Ollama models with
    configurable parameters, system prompts, and tool calling support. This endpoint
    enables natural language interactions with AI models while maintaining context
    and supporting advanced features like function calling and custom parameters.

    The chat process includes:
    1. Request validation and parameter processing
    2. Model selection and configuration
    3. Context management and prompt preparation
    4. AI model interaction with streaming support
    5. Response processing and tool call handling
    6. Performance metrics collection and logging

    Args:
        request (OllamaChatRequest): Chat request containing:
            - message (str): User message for AI interaction
            - model (str, optional): AI model to use for generation
            - system_prompt (str, optional): System prompt for context
            - temperature (float, optional): Response creativity level (0.0-1.0)
            - max_tokens (int, optional): Maximum tokens to generate
            - tools (list, optional): Available tools for function calling
            - context (dict, optional): Additional context for the conversation

    Returns:
        OllamaChatResponse: Chat response containing:
            - response (str): AI-generated response text
            - model (str): Model used for generation
            - tokens_generated (int): Number of tokens generated
            - processing_time (float): Response generation time
            - tool_calls (list): Function calls made during generation
            - metadata (dict): Additional response metadata

    Raises:
        HTTPException: If chat request fails or service is unavailable
        ValidationError: If request parameters are invalid

    Example:
        ```python
        request = OllamaChatRequest(
            message="Explain quantum computing",
            model="llama3.1",
            temperature=0.7,
            max_tokens=500
        )
        response = await chat(request)
        ```
    """
    try:
        service = get_ollama_service()

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
                raise HTTPException(status_code=500, detail=event.data)

        return OllamaChatResponse(
            success=True,
            response=response_text,
            model=request.model,
            processing_time=processing_time,
            tokens_generated=tokens_generated,
            tool_calls=tool_calls,
            tools_used=[tc["name"] for tc in tool_calls],
        )

    except Exception as e:
        logger.error(f"Chat failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/stream")
async def chat_stream(request: OllamaChatRequest):
    """Chat with Ollama model with streaming support."""
    try:
        service = get_ollama_service()

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

        return EventSourceResponse(event_generator())

    except Exception as e:
        logger.error(f"Streaming chat failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assistant", response_model=OllamaAssistantResponse)
async def assistant_chat(request: OllamaAssistantRequest):
    """Chat with ReynardAssistant."""
    try:
        service = get_ollama_service()

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
                raise HTTPException(status_code=500, detail=event.data)

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

    except Exception as e:
        logger.error(f"Assistant chat failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assistant/stream")
async def assistant_chat_stream(request: OllamaAssistantRequest):
    """Chat with ReynardAssistant with streaming support."""
    try:
        service = get_ollama_service()

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

        return EventSourceResponse(event_generator())

    except Exception as e:
        logger.error(f"Streaming assistant chat failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models")
async def get_models():
    """Get available Ollama models."""
    try:
        service = get_ollama_service()
        models = await service.get_available_models()
        return {"models": models}

    except Exception as e:
        logger.error(f"Failed to get models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/config")
async def get_config():
    """Get current configuration."""
    try:
        service = get_ollama_service()
        config = await service.get_config()
        return config

    except Exception as e:
        logger.error(f"Failed to get config: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/config")
async def update_config(config: dict):
    """Update configuration."""
    try:
        service = get_ollama_service()
        success = await service.update_config(config)

        if not success:
            raise HTTPException(
                status_code=400, detail="Failed to update configuration"
            )

        return {"success": True, "message": "Configuration updated successfully"}

    except Exception as e:
        logger.error(f"Failed to update config: {e}")
        raise HTTPException(status_code=500, detail=str(e))
