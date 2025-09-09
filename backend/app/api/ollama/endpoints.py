"""
Core API endpoints for Ollama service.
"""

import logging

from fastapi import APIRouter, HTTPException
from sse_starlette import EventSourceResponse

from .models import (
    OllamaChatRequest,
    OllamaChatResponse,
    OllamaAssistantRequest,
    OllamaAssistantResponse,
)
from .service import get_ollama_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/chat", response_model=OllamaChatResponse)
async def chat(request: OllamaChatRequest):
    """Chat with Ollama model."""
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
            context=request.context
        )
        
        # Chat with Ollama
        response_text = ""
        tokens_generated = 0
        processing_time = 0.0
        
        async for event in service.chat_stream(params):
            if event.type == "token":
                response_text += event.data
                tokens_generated += 1
            elif event.type == "complete":
                processing_time = event.metadata.get("processing_time", 0.0)
            elif event.type == "error":
                raise HTTPException(status_code=500, detail=event.data)
        
        return OllamaChatResponse(
            success=True,
            response=response_text,
            model=request.model,
            processing_time=processing_time,
            tokens_generated=tokens_generated
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
            context=request.context
        )
        
        async def event_generator():
            async for event in service.chat_stream(params):
                yield {
                    "type": event.type,
                    "data": event.data,
                    "timestamp": event.timestamp,
                    "metadata": event.metadata
                }
        
        return EventSourceResponse(event_generator())
        
    except Exception as e:
        logger.error(f"Streaming chat failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assistant", response_model=OllamaAssistantResponse)
async def assistant_chat(request: OllamaAssistantRequest):
    """Chat with YipYapAssistant."""
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
            tools_enabled=request.tools_enabled
        )
        
        # Chat with assistant
        response_text = ""
        tokens_generated = 0
        tools_used = []
        processing_time = 0.0
        
        async for event in service.assistant_stream(params):
            if event.type == "token":
                response_text += event.data
                tokens_generated += 1
            elif event.type == "tool_call":
                tool_name = event.metadata.get("tool_name", "unknown")
                tools_used.append(tool_name)
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
            tools_used=tools_used
        )
        
    except Exception as e:
        logger.error(f"Assistant chat failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assistant/stream")
async def assistant_chat_stream(request: OllamaAssistantRequest):
    """Chat with YipYapAssistant with streaming support."""
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
            tools_enabled=request.tools_enabled
        )
        
        async def event_generator():
            async for event in service.assistant_stream(params):
                yield {
                    "type": event.type,
                    "data": event.data,
                    "timestamp": event.timestamp,
                    "metadata": event.metadata
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
            raise HTTPException(status_code=400, detail="Failed to update configuration")
        
        return {"success": True, "message": "Configuration updated successfully"}
        
    except Exception as e:
        logger.error(f"Failed to update config: {e}")
        raise HTTPException(status_code=500, detail=str(e))
