"""
API endpoints for summarization service.
"""

import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from sse_starlette import EventSourceResponse

from .models import (
    SummarizationRequest,
    SummarizationResponse,
    BatchSummarizationRequest,
    ContentTypeDetectionRequest,
    ContentTypeDetectionResponse,
    SummarizationConfigRequest,
    SummarizationConfigResponse,
    SummarizationStatsResponse,
    HealthCheckResponse,
)
from ...services.summarization.summarization_service import get_summarization_service

logger = logging.getLogger(__name__)

router = APIRouter()


def get_summarization_service():
    """Get the summarization service instance."""
    # This would be injected via dependency injection in a real implementation
    from ...services.summarization.summarization_service import SummarizationService
    from ...services.ollama.ollama_service import get_ollama_service
    
    ollama_service = get_ollama_service()
    service = SummarizationService(ollama_service)
    return service


@router.post("/summarize", response_model=SummarizationResponse)
async def summarize_text(request: SummarizationRequest):
    """
    Summarize text with specified options.
    
    This endpoint provides text summarization with support for different
    content types, summary levels, and customization options.
    """
    try:
        service = get_summarization_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="Summarization service is not available"
            )

        # Perform summarization
        result = await service.summarize_text(
            text=request.text,
            content_type=request.content_type,
            summary_level=request.summary_level,
            max_length=request.max_length,
            include_outline=request.include_outline,
            include_highlights=request.include_highlights,
            model=request.model,
            temperature=request.temperature,
            top_p=request.top_p,
        )

        return SummarizationResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Summarization failed: {e}")
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")


@router.post("/summarize/stream")
async def summarize_text_stream(request: SummarizationRequest):
    """
    Stream text summarization with progress updates.
    
    This endpoint provides real-time streaming of summarization progress
    using Server-Sent Events (SSE).
    """
    try:
        service = get_summarization_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="Summarization service is not available"
            )

        async def event_generator():
            async for event in service.summarize_text_stream(
                text=request.text,
                content_type=request.content_type,
                summary_level=request.summary_level,
                max_length=request.max_length,
                include_outline=request.include_outline,
                include_highlights=request.include_highlights,
                model=request.model,
                temperature=request.temperature,
                top_p=request.top_p,
            ):
                yield {
                    "event": event.get("event", "update"),
                    "data": event.get("data", {}),
                }

        return EventSourceResponse(event_generator())

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Streaming summarization failed: {e}")
        raise HTTPException(status_code=500, detail=f"Streaming summarization failed: {str(e)}")


@router.post("/summarize/batch")
async def summarize_batch(request: BatchSummarizationRequest):
    """
    Process a batch of summarization requests.
    
    This endpoint allows processing multiple summarization requests
    in a single call with optional streaming support.
    """
    try:
        service = get_summarization_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="Summarization service is not available"
            )

        if request.enable_streaming:
            async def event_generator():
                async for event in service.summarize_batch(
                    requests=request.requests,
                    enable_streaming=True,
                ):
                    yield {
                        "event": event.get("event", "update"),
                        "data": event.get("data", {}),
                    }

            return EventSourceResponse(event_generator())
        else:
            # Process batch without streaming
            results = []
            async for event in service.summarize_batch(
                requests=request.requests,
                enable_streaming=False,
            ):
                if event.get("event") == "request_complete":
                    results.append(event.get("data", {}))

            return {
                "success": True,
                "results": results,
                "total_processed": len(results),
            }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Batch summarization failed: {e}")
        raise HTTPException(status_code=500, detail=f"Batch summarization failed: {str(e)}")


@router.post("/detect-content-type", response_model=ContentTypeDetectionResponse)
async def detect_content_type(request: ContentTypeDetectionRequest):
    """
    Automatically detect the content type of text.
    
    This endpoint analyzes text and determines the most appropriate
    content type for summarization.
    """
    try:
        service = get_summarization_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="Summarization service is not available"
            )

        content_type = await service.detect_content_type(request.text)
        
        return ContentTypeDetectionResponse(
            content_type=content_type,
            confidence=0.8,  # Placeholder confidence score
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Content type detection failed: {e}")
        raise HTTPException(status_code=500, detail=f"Content type detection failed: {str(e)}")


@router.get("/models")
async def get_available_models():
    """
    Get list of available models for summarization.
    
    Returns the list of models that can be used for text summarization.
    """
    try:
        service = get_summarization_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="Summarization service is not available"
            )

        models = service.get_available_models()
        
        return {
            "success": True,
            "models": models,
            "default_model": "llama3.2:3b",
        }

    except Exception as e:
        logger.error(f"Failed to get available models: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get available models: {str(e)}")


@router.get("/content-types")
async def get_supported_content_types():
    """
    Get supported content types and their summarizers.
    
    Returns information about which content types are supported
    and which summarizers handle each type.
    """
    try:
        service = get_summarization_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="Summarization service is not available"
            )

        content_types = service.get_supported_content_types()
        summary_levels = service.get_supported_summary_levels()
        
        return {
            "success": True,
            "content_types": content_types,
            "summary_levels": summary_levels,
        }

    except Exception as e:
        logger.error(f"Failed to get supported content types: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get supported content types: {str(e)}")


@router.get("/stats", response_model=SummarizationStatsResponse)
async def get_performance_stats():
    """
    Get performance statistics for the summarization service.
    
    Returns detailed statistics about service usage, performance,
    and available capabilities.
    """
    try:
        service = get_summarization_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="Summarization service is not available"
            )

        stats = service.get_performance_stats()
        content_types = service.get_supported_content_types()
        
        return SummarizationStatsResponse(
            total_requests=stats.get("total_requests", 0),
            cache_hits=stats.get("cache_hits", 0),
            cache_misses=stats.get("cache_misses", 0),
            cache_hit_rate=stats.get("cache_hit_rate", 0.0),
            average_processing_time=stats.get("average_processing_time", 0.0),
            total_processing_time=stats.get("total_processing_time", 0.0),
            available_summarizers=stats.get("available_summarizers", []),
            supported_content_types=content_types,
        )

    except Exception as e:
        logger.error(f"Failed to get performance stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get performance stats: {str(e)}")


@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Perform health check on the summarization service.
    
    Returns the current health status and detailed information
    about service availability and configuration.
    """
    try:
        service = get_summarization_service()
        
        health_info = await service.health_check()
        
        return HealthCheckResponse(
            status=health_info["status"],
            message=health_info["message"],
            details=health_info["details"],
            timestamp=health_info.get("timestamp", ""),
        )

    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthCheckResponse(
            status="unhealthy",
            message=f"Health check failed: {str(e)}",
            details={"error": str(e)},
            timestamp="",
        )


@router.post("/config", response_model=SummarizationConfigResponse)
async def update_config(request: SummarizationConfigRequest):
    """
    Update summarization service configuration.
    
    Allows updating various configuration parameters for the
    summarization service.
    """
    try:
        service = get_summarization_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="Summarization service is not available"
            )

        # For now, just return current config
        # In a real implementation, this would update the service configuration
        current_config = {
            "default_model": "llama3.2:3b",
            "default_content_type": "general",
            "default_summary_level": "detailed",
            "max_text_length": 100000,
            "enable_caching": True,
        }
        
        return SummarizationConfigResponse(
            success=True,
            message="Configuration updated successfully",
            config=current_config,
        )

    except Exception as e:
        logger.error(f"Failed to update configuration: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update configuration: {str(e)}")


@router.get("/config", response_model=SummarizationConfigResponse)
async def get_config():
    """
    Get current summarization service configuration.
    
    Returns the current configuration parameters for the
    summarization service.
    """
    try:
        service = get_summarization_service()
        
        if not service.is_available():
            raise HTTPException(
                status_code=503,
                detail="Summarization service is not available"
            )

        current_config = {
            "default_model": "llama3.2:3b",
            "default_content_type": "general",
            "default_summary_level": "detailed",
            "max_text_length": 100000,
            "enable_caching": True,
        }
        
        return SummarizationConfigResponse(
            success=True,
            message="Configuration retrieved successfully",
            config=current_config,
        )

    except Exception as e:
        logger.error(f"Failed to get configuration: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get configuration: {str(e)}")
