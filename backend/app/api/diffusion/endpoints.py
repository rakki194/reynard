"""
🦊 Reynard Diffusion API Endpoints
==================================

Comprehensive FastAPI endpoints for Diffusion-LLM integration within the Reynard ecosystem,
providing sophisticated text generation and infilling capabilities with advanced features
and comprehensive error handling.

The Diffusion API provides:
- Advanced text generation using diffusion models
- Text infilling capabilities with prefix/suffix support
- Streaming responses for real-time text generation
- Model management and configuration options
- Performance monitoring and metrics collection
- Comprehensive error handling and validation
- Security integration with authentication and authorization

Key Features:
- Text Generation: Advanced text generation with multiple model support
- Text Infilling: Sophisticated infilling capabilities with context awareness
- Streaming Responses: Real-time response streaming for interactive experiences
- Model Management: Dynamic model selection and configuration
- Performance Monitoring: Response time tracking and token counting
- Error Handling: Comprehensive error recovery and user feedback
- Security: Authentication and authorization for protected endpoints

API Endpoints:
- POST /generate: Standard text generation interface
- POST /infill: Text infilling with prefix/suffix support
- GET /stream: Streaming text generation for real-time interaction
- GET /models: Model information and configuration details
- GET /config: Configuration management endpoints

The Diffusion integration provides seamless text generation capabilities throughout the Reynard
ecosystem, enabling sophisticated AI-powered text generation with enterprise-grade reliability
and performance.

Author: Reynard Development Team
Version: 2.0.0 - Refactored with BaseServiceRouter patterns
"""

import time
from typing import Any

from pydantic import BaseModel, Field

from ...core.base_router import BaseServiceRouter
from ...core.config_mixin import ConfigEndpointMixin
from ...core.logging_config import get_service_logger
from ...core.router_mixins import StreamingResponseMixin
from .model_cache import get_model_cache
from .models import (
    DiffusionBatchGenerationRequest,
    DiffusionBatchGenerationResponse,
    DiffusionBatchInfillingRequest,
    DiffusionBatchInfillingResponse,
    DiffusionGenerationRequest,
    DiffusionGenerationResponse,
    DiffusionInfillingRequest,
    DiffusionInfillingResponse,
)
from .service import get_diffusion_service

logger = get_service_logger("diffusion")


class DiffusionConfigModel(BaseModel):
    """Configuration model for Diffusion service."""

    default_model: str = Field(
        default="diffusion-llm", description="Default model to use"
    )
    max_length: int = Field(
        default=512, ge=1, le=2048, description="Maximum text length per request"
    )
    temperature: float = Field(
        default=0.8, ge=0.0, le=2.0, description="Response creativity level"
    )
    top_p: float = Field(
        default=0.9, ge=0.0, le=1.0, description="Nucleus sampling parameter"
    )
    top_k: int = Field(default=50, ge=1, le=100, description="Top-k sampling parameter")
    repetition_penalty: float = Field(
        default=1.1, ge=0.0, le=2.0, description="Repetition penalty"
    )
    timeout: int = Field(
        default=60, ge=5, le=600, description="Request timeout in seconds"
    )
    enable_streaming: bool = Field(
        default=True, description="Enable streaming responses"
    )
    max_concurrent_requests: int = Field(
        default=5, ge=1, le=50, description="Max concurrent requests"
    )
    enable_model_caching: bool = Field(default=True, description="Enable model caching")


class DiffusionServiceRouter(
    BaseServiceRouter, ConfigEndpointMixin, StreamingResponseMixin
):
    """
    Diffusion service router with enterprise-grade patterns.

    Provides standardized service patterns including:
    - Centralized error handling and recovery
    - Configuration management with validation
    - Streaming response capabilities
    - Health monitoring and metrics
    - Service dependency management
    """

    def __init__(self):
        super().__init__(
            service_name="diffusion", prefix="/api/diffusion", tags=["diffusion"]
        )

        # Setup configuration endpoints
        self.setup_config_endpoints(DiffusionConfigModel)

        # Setup streaming endpoints
        self.setup_streaming_endpoints()

        # Setup Diffusion-specific endpoints
        self._setup_diffusion_endpoints()

        logger.info("DiffusionServiceRouter initialized with enterprise patterns")

    def get_service(self) -> Any:
        """Get the Diffusion service instance."""
        return get_diffusion_service()

    def check_service_health(self) -> Any:
        """Check Diffusion service health."""
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
            logger.exception("Diffusion service health check failed")
            return {
                "service_name": self.service_name,
                "is_healthy": False,
                "status": "unhealthy",
                "details": {"error": str(e)},
                "timestamp": time.time(),
            }

    def _setup_diffusion_endpoints(self) -> None:
        """Setup Diffusion-specific endpoints."""

        @self.router.post("/generate", response_model=DiffusionGenerationResponse)
        async def generate_text(request: DiffusionGenerationRequest):
            """Generate text using diffusion models."""
            return await self._standard_async_operation(
                "generate_text", self._handle_generate_request, request
            )

        @self.router.post("/generate/stream")
        async def generate_text_stream(request: DiffusionGenerationRequest):
            """Generate text with streaming support."""
            return await self._standard_async_operation(
                "generate_text_stream", self._handle_generate_stream_request, request
            )

        @self.router.post("/infill", response_model=DiffusionInfillingResponse)
        async def infill_text(request: DiffusionInfillingRequest):
            """Infill text using diffusion models."""
            return await self._standard_async_operation(
                "infill_text", self._handle_infill_request, request
            )

        @self.router.post("/infill/stream")
        async def infill_text_stream(request: DiffusionInfillingRequest):
            """Infill text with streaming support."""
            return await self._standard_async_operation(
                "infill_text_stream", self._handle_infill_stream_request, request
            )

        @self.router.get("/models")
        async def get_models():
            """Get available diffusion models."""
            return await self._standard_async_operation(
                "get_models", self._handle_get_models_request
            )

        @self.router.post(
            "/batch/generate", response_model=DiffusionBatchGenerationResponse
        )
        async def batch_generate_text(request: DiffusionBatchGenerationRequest):
            """Generate text for multiple inputs in batch with optimization."""
            return await self._standard_async_operation(
                "batch_generate_text", self._handle_batch_generate_request, request
            )

        @self.router.post(
            "/batch/infill", response_model=DiffusionBatchInfillingResponse
        )
        async def batch_infill_text(request: DiffusionBatchInfillingRequest):
            """Infill text for multiple requests in batch with optimization."""
            return await self._standard_async_operation(
                "batch_infill_text", self._handle_batch_infill_request, request
            )

        @self.router.get("/cache/stats")
        async def get_cache_stats():
            """Get model cache statistics and status."""
            return await self._standard_async_operation(
                "get_cache_stats", self._handle_get_cache_stats_request
            )

        @self.router.post("/cache/validate/{model_id}")
        async def validate_cached_model(model_id: str):
            """Validate a specific cached model."""
            return await self._standard_async_operation(
                "validate_cached_model", self._handle_validate_model_request, model_id
            )

    async def _handle_generate_request(
        self, request: DiffusionGenerationRequest
    ) -> DiffusionGenerationResponse:
        """Handle text generation request with standardized error handling."""
        service = self.get_service()

        # Convert request to service params
        from ...services.diffusion.models import DiffusionGenerationParams

        params = DiffusionGenerationParams(
            text=request.text,
            model_id=request.model_id,
            max_length=request.max_length,
            temperature=request.temperature,
            top_p=request.top_p,
            top_k=request.top_k,
            repetition_penalty=request.repetition_penalty,
            stream=False,  # Non-streaming for this endpoint
        )

        # Generate text
        generated_text = ""
        tokens_generated = 0
        processing_time = 0.0

        async for event in service.generate_stream(params):
            if event.type == "token":
                generated_text += event.data
                tokens_generated += 1
            elif event.type == "complete":
                processing_time = event.metadata.get("processing_time", 0.0)
            elif event.type == "error":
                from ...core.exceptions import InternalError

                raise InternalError(
                    message=f"Text generation error: {event.data}",
                    service_name=self.service_name,
                )

        return DiffusionGenerationResponse(
            success=True,
            generated_text=generated_text,
            model_id=request.model_id,
            processing_time=processing_time,
            tokens_generated=tokens_generated,
        )

    async def _handle_generate_stream_request(
        self, request: DiffusionGenerationRequest
    ):
        """Handle streaming text generation request."""
        service = self.get_service()

        # Convert request to service params
        from ...services.diffusion.models import DiffusionGenerationParams

        params = DiffusionGenerationParams(
            text=request.text,
            model_id=request.model_id,
            max_length=request.max_length,
            temperature=request.temperature,
            top_p=request.top_p,
            top_k=request.top_k,
            repetition_penalty=request.repetition_penalty,
            stream=True,
        )

        async def event_generator():
            async for event in service.generate_stream(params):
                yield {
                    "type": event.type,
                    "data": event.data,
                    "timestamp": event.timestamp,
                    "metadata": event.metadata,
                }

        return self.create_sse_response(event_generator())

    async def _handle_infill_request(
        self, request: DiffusionInfillingRequest
    ) -> DiffusionInfillingResponse:
        """Handle text infilling request with standardized error handling."""
        service = self.get_service()

        # Convert request to service params
        from ...services.diffusion.models import DiffusionInfillingParams

        params = DiffusionInfillingParams(
            prefix=request.prefix,
            suffix=request.suffix,
            model_id=request.model_id,
            max_length=request.max_length,
            temperature=request.temperature,
            top_p=request.top_p,
            stream=False,  # Non-streaming for this endpoint
        )

        # Infill text
        infilled_text = ""
        tokens_generated = 0
        processing_time = 0.0

        async for event in service.infill_stream(params):
            if event.type == "token":
                infilled_text += event.data
                tokens_generated += 1
            elif event.type == "complete":
                processing_time = event.metadata.get("processing_time", 0.0)
            elif event.type == "error":
                from ...core.exceptions import InternalError

                raise InternalError(
                    message=f"Text infilling error: {event.data}",
                    service_name=self.service_name,
                )

        return DiffusionInfillingResponse(
            success=True,
            infilled_text=infilled_text,
            model_id=request.model_id,
            processing_time=processing_time,
            tokens_generated=tokens_generated,
        )

    async def _handle_infill_stream_request(self, request: DiffusionInfillingRequest):
        """Handle streaming text infilling request."""
        service = self.get_service()

        # Convert request to service params
        from ...services.diffusion.models import DiffusionInfillingParams

        params = DiffusionInfillingParams(
            prefix=request.prefix,
            suffix=request.suffix,
            model_id=request.model_id,
            max_length=request.max_length,
            temperature=request.temperature,
            top_p=request.top_p,
            stream=True,
        )

        async def event_generator():
            async for event in service.infill_stream(params):
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

    async def _handle_batch_generate_request(
        self, request: DiffusionBatchGenerationRequest
    ) -> DiffusionBatchGenerationResponse:
        """Handle batch text generation request with optimization."""
        import asyncio
        import time

        start_time = time.time()
        cache = get_model_cache()

        # Get or load model from cache
        model = await cache.get_model(request.model_id)
        if model is None:
            # Load model and cache it
            service = self.get_service()
            model = await service.load_model(request.model_id)
            await cache.put_model(request.model_id, model)

        # Process texts in batches
        results = []
        total_tokens = 0
        actual_batch_size = min(request.batch_size, len(request.texts))

        if request.parallel_processing:
            # Parallel processing
            semaphore = asyncio.Semaphore(actual_batch_size)

            async def process_text(text: str, index: int) -> dict:
                async with semaphore:
                    try:
                        # Convert to single request format
                        single_request = DiffusionGenerationRequest(
                            text=text,
                            model_id=request.model_id,
                            max_length=request.max_length,
                            temperature=request.temperature,
                            top_p=request.top_p,
                            top_k=request.top_k,
                            repetition_penalty=request.repetition_penalty,
                            stream=False,
                        )

                        # Process single generation
                        response = await self._handle_generate_request(single_request)
                        return {
                            "index": index,
                            "input_text": text,
                            "generated_text": response.generated_text,
                            "tokens_generated": response.tokens_generated,
                            "processing_time": response.processing_time,
                            "success": response.success,
                        }
                    except Exception as e:
                        logger.error(f"Batch generation failed for text {index}: {e}")
                        return {
                            "index": index,
                            "input_text": text,
                            "generated_text": "",
                            "tokens_generated": 0,
                            "processing_time": 0.0,
                            "success": False,
                            "error": str(e),
                        }

            # Process all texts in parallel
            tasks = [process_text(text, i) for i, text in enumerate(request.texts)]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Handle any exceptions
            processed_results = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    processed_results.append(
                        {
                            "index": i,
                            "input_text": request.texts[i],
                            "generated_text": "",
                            "tokens_generated": 0,
                            "processing_time": 0.0,
                            "success": False,
                            "error": str(result),
                        }
                    )
                else:
                    processed_results.append(result)

            results = processed_results
        else:
            # Sequential processing
            for i, text in enumerate(request.texts):
                try:
                    single_request = DiffusionGenerationRequest(
                        text=text,
                        model_id=request.model_id,
                        max_length=request.max_length,
                        temperature=request.temperature,
                        top_p=request.top_p,
                        top_k=request.top_k,
                        repetition_penalty=request.repetition_penalty,
                        stream=False,
                    )

                    response = await self._handle_generate_request(single_request)
                    results.append(
                        {
                            "index": i,
                            "input_text": text,
                            "generated_text": response.generated_text,
                            "tokens_generated": response.tokens_generated,
                            "processing_time": response.processing_time,
                            "success": response.success,
                        }
                    )
                except Exception as e:
                    logger.error(f"Batch generation failed for text {i}: {e}")
                    results.append(
                        {
                            "index": i,
                            "input_text": text,
                            "generated_text": "",
                            "tokens_generated": 0,
                            "processing_time": 0.0,
                            "success": False,
                            "error": str(e),
                        }
                    )

        # Calculate statistics
        total_processing_time = time.time() - start_time
        average_processing_time = (
            total_processing_time / len(request.texts) if request.texts else 0.0
        )
        total_tokens = sum(result.get("tokens_generated", 0) for result in results)

        return DiffusionBatchGenerationResponse(
            success=True,
            results=results,
            total_processing_time=total_processing_time,
            average_processing_time=average_processing_time,
            tokens_generated=total_tokens,
            batch_size=actual_batch_size,
            parallel_processing_used=request.parallel_processing,
            metadata={
                "model_id": request.model_id,
                "total_texts": len(request.texts),
                "successful_generations": sum(
                    1 for r in results if r.get("success", False)
                ),
            },
        )

    async def _handle_batch_infill_request(
        self, request: DiffusionBatchInfillingRequest
    ) -> DiffusionBatchInfillingResponse:
        """Handle batch text infilling request with optimization."""
        import asyncio
        import time

        start_time = time.time()
        cache = get_model_cache()

        # Get or load model from cache
        model = await cache.get_model(request.model_id)
        if model is None:
            service = self.get_service()
            model = await service.load_model(request.model_id)
            await cache.put_model(request.model_id, model)

        # Process infill requests in batches
        results = []
        total_tokens = 0
        actual_batch_size = min(request.batch_size, len(request.infill_requests))

        if request.parallel_processing:
            # Parallel processing
            semaphore = asyncio.Semaphore(actual_batch_size)

            async def process_infill(infill_req: dict, index: int) -> dict:
                async with semaphore:
                    try:
                        single_request = DiffusionInfillingRequest(
                            prefix=infill_req["prefix"],
                            suffix=infill_req["suffix"],
                            model_id=request.model_id,
                            max_length=request.max_length,
                            temperature=request.temperature,
                            top_p=request.top_p,
                            stream=False,
                        )

                        response = await self._handle_infill_request(single_request)
                        return {
                            "index": index,
                            "prefix": infill_req["prefix"],
                            "suffix": infill_req["suffix"],
                            "infilled_text": response.infilled_text,
                            "tokens_generated": response.tokens_generated,
                            "processing_time": response.processing_time,
                            "success": response.success,
                        }
                    except Exception as e:
                        logger.error(f"Batch infilling failed for request {index}: {e}")
                        return {
                            "index": index,
                            "prefix": infill_req["prefix"],
                            "suffix": infill_req["suffix"],
                            "infilled_text": "",
                            "tokens_generated": 0,
                            "processing_time": 0.0,
                            "success": False,
                            "error": str(e),
                        }

            # Process all requests in parallel
            tasks = [
                process_infill(req, i) for i, req in enumerate(request.infill_requests)
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Handle any exceptions
            processed_results = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    processed_results.append(
                        {
                            "index": i,
                            "prefix": request.infill_requests[i]["prefix"],
                            "suffix": request.infill_requests[i]["suffix"],
                            "infilled_text": "",
                            "tokens_generated": 0,
                            "processing_time": 0.0,
                            "success": False,
                            "error": str(result),
                        }
                    )
                else:
                    processed_results.append(result)

            results = processed_results
        else:
            # Sequential processing
            for i, infill_req in enumerate(request.infill_requests):
                try:
                    single_request = DiffusionInfillingRequest(
                        prefix=infill_req["prefix"],
                        suffix=infill_req["suffix"],
                        model_id=request.model_id,
                        max_length=request.max_length,
                        temperature=request.temperature,
                        top_p=request.top_p,
                        stream=False,
                    )

                    response = await self._handle_infill_request(single_request)
                    results.append(
                        {
                            "index": i,
                            "prefix": infill_req["prefix"],
                            "suffix": infill_req["suffix"],
                            "infilled_text": response.infilled_text,
                            "tokens_generated": response.tokens_generated,
                            "processing_time": response.processing_time,
                            "success": response.success,
                        }
                    )
                except Exception as e:
                    logger.error(f"Batch infilling failed for request {i}: {e}")
                    results.append(
                        {
                            "index": i,
                            "prefix": infill_req["prefix"],
                            "suffix": infill_req["suffix"],
                            "infilled_text": "",
                            "tokens_generated": 0,
                            "processing_time": 0.0,
                            "success": False,
                            "error": str(e),
                        }
                    )

        # Calculate statistics
        total_processing_time = time.time() - start_time
        average_processing_time = (
            total_processing_time / len(request.infill_requests)
            if request.infill_requests
            else 0.0
        )
        total_tokens = sum(result.get("tokens_generated", 0) for result in results)

        return DiffusionBatchInfillingResponse(
            success=True,
            results=results,
            total_processing_time=total_processing_time,
            average_processing_time=average_processing_time,
            tokens_generated=total_tokens,
            batch_size=actual_batch_size,
            parallel_processing_used=request.parallel_processing,
            metadata={
                "model_id": request.model_id,
                "total_requests": len(request.infill_requests),
                "successful_infills": sum(
                    1 for r in results if r.get("success", False)
                ),
            },
        )

    async def _handle_get_cache_stats_request(self):
        """Handle get cache stats request."""
        cache = get_model_cache()
        stats = await cache.get_cache_stats()
        return stats

    async def _handle_validate_model_request(self, model_id: str):
        """Handle validate cached model request."""
        cache = get_model_cache()
        is_valid = await cache.validate_model(model_id)
        return {"model_id": model_id, "is_valid": is_valid, "timestamp": time.time()}


# Create router instance
diffusion_router = DiffusionServiceRouter()
router = diffusion_router.get_router()
