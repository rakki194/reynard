"""Caption service for Reynard Backend.

This module provides the business logic for caption generation operations
including single and batch processing.
"""

import json
import logging
from pathlib import Path
from typing import Any

from fastapi import UploadFile

from ...caption_generation import CaptionTask, get_caption_service
from .models import BatchCaptionRequest, CaptionRequest, CaptionResponse, GeneratorInfo

logger = logging.getLogger("uvicorn")


class CaptionAPIService:
    """Service for managing caption generation operations."""

    def __init__(self):
        self._caption_service = get_caption_service()

    def get_available_generators(self) -> dict[str, GeneratorInfo]:
        """Get information about all available caption generators."""
        try:
            generators = self._caption_service.get_available_generators()
            return {name: GeneratorInfo(**info) for name, info in generators.items()}
        except Exception as e:
            logger.error(f"Failed to get available generators: {e}")
            raise

    def get_generator_info(self, generator_name: str) -> GeneratorInfo | None:
        """Get information about a specific caption generator."""
        try:
            info = self._caption_service.get_generator_info(generator_name)
            if not info:
                return None
            return GeneratorInfo(**info)
        except Exception as e:
            logger.error(f"Failed to get generator info for {generator_name}: {e}")
            raise

    async def generate_single_caption(self, request: CaptionRequest) -> CaptionResponse:
        """Generate a caption for a single image."""
        try:
            # Validate image path
            image_path = Path(request.image_path)
            if not image_path.exists():
                raise ValueError(f"Image not found: {request.image_path}")

            # Check if generator is available
            if not self._caption_service.is_generator_available(request.generator_name):
                raise ValueError(
                    f"Generator '{request.generator_name}' is not available",
                )

            # Generate caption
            result = await self._caption_service.generate_single_caption(
                image_path=image_path,
                generator_name=request.generator_name,
                config=request.config,
                force=request.force,
            )

            return CaptionResponse(
                success=result.success,
                image_path=str(result.image_path),
                generator_name=result.generator_name,
                caption=result.caption,
                error=result.error,
                error_type=result.error_type,
                retryable=result.retryable,
                processing_time=result.processing_time,
                caption_type=result.caption_type,
            )

        except Exception as e:
            logger.error(f"Failed to generate caption: {e}")
            raise

    async def generate_batch_captions(
        self,
        request: BatchCaptionRequest,
    ) -> list[CaptionResponse]:
        """Generate captions for multiple images in batch."""
        try:
            # Validate all image paths
            tasks = []
            for task_request in request.tasks:
                image_path = Path(task_request.image_path)
                if not image_path.exists():
                    raise ValueError(f"Image not found: {task_request.image_path}")

                # Check if generator is available
                if not self._caption_service.is_generator_available(
                    task_request.generator_name,
                ):
                    raise ValueError(
                        f"Generator '{task_request.generator_name}' is not available",
                    )

                tasks.append(
                    CaptionTask(
                        image_path=image_path,
                        generator_name=task_request.generator_name,
                        config=task_request.config,
                        force=task_request.force,
                        post_process=task_request.post_process,
                    ),
                )

            # Generate captions
            results = await self._caption_service.generate_batch_captions(
                tasks=tasks,
                max_concurrent=request.max_concurrent,
            )

            return [
                CaptionResponse(
                    success=result.success,
                    image_path=str(result.image_path),
                    generator_name=result.generator_name,
                    caption=result.caption,
                    error=result.error,
                    error_type=result.error_type,
                    retryable=result.retryable,
                    processing_time=result.processing_time,
                    caption_type=result.caption_type,
                )
                for result in results
            ]

        except Exception as e:
            logger.error(f"Failed to generate batch captions: {e}")
            raise

    async def load_model(
        self,
        model_name: str,
        config: dict[str, Any] | None = None,
    ) -> bool:
        """Load a specific caption model."""
        try:
            # Check if generator exists
            if not self._caption_service.is_generator_available(model_name):
                raise ValueError(f"Generator '{model_name}' not found")

            # Load the model
            return await self._caption_service.load_model(model_name)

        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            raise

    async def unload_model(self, model_name: str) -> bool:
        """Unload a specific caption model."""
        try:
            return await self._caption_service.unload_model(model_name)
        except Exception as e:
            logger.error(f"Failed to unload model {model_name}: {e}")
            raise

    def get_loaded_models(self) -> list[str]:
        """Get list of currently loaded models."""
        try:
            return list(self._caption_service.get_loaded_models())
        except Exception as e:
            logger.error(f"Failed to get loaded models: {e}")
            raise

    async def upload_and_generate_caption(
        self,
        file: UploadFile,
        generator_name: str,
        config: str | None = None,
        force: bool = False,
        post_process: bool = True,
    ) -> CaptionResponse:
        """Upload an image and generate a caption for it."""
        try:
            # Check if generator is available
            if not self._caption_service.is_generator_available(generator_name):
                raise ValueError(f"Generator '{generator_name}' is not available")

            # Save uploaded file temporarily
            temp_path = Path(f"/tmp/{file.filename}")
            with open(temp_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)

            try:
                # Parse config if provided
                config_dict = json.loads(config) if config else {}

                # Generate caption
                result = await self._caption_service.generate_single_caption(
                    image_path=temp_path,
                    generator_name=generator_name,
                    config=config_dict,
                    force=force,
                )

                return CaptionResponse(
                    success=result.success,
                    image_path=file.filename,
                    generator_name=result.generator_name,
                    caption=result.caption,
                    error=result.error,
                    error_type=result.error_type,
                    retryable=result.retryable,
                    processing_time=result.processing_time,
                    caption_type=result.caption_type,
                )

            finally:
                # Clean up temporary file
                if temp_path.exists():
                    temp_path.unlink()

        except Exception as e:
            logger.error(f"Failed to upload and generate caption: {e}")
            raise

    def get_system_statistics(self) -> dict[str, Any]:
        """Get comprehensive system statistics and usage metrics."""
        try:
            return self._caption_service.get_system_statistics()
        except Exception as e:
            logger.error(f"Failed to get system statistics: {e}")
            raise

    def get_health_status(self, model_name: str | None = None) -> dict[str, Any]:
        """Get system health status."""
        try:
            return self._caption_service.get_health_status(model_name)
        except Exception as e:
            logger.error(f"Failed to get health status: {e}")
            raise

    def get_model_usage_stats(self, model_name: str) -> dict[str, Any] | None:
        """Get usage statistics for a specific model."""
        try:
            return self._caption_service.get_model_usage_stats(model_name)
        except Exception as e:
            logger.error(f"Failed to get model usage stats: {e}")
            raise

    def get_circuit_breaker_state(self, model_name: str) -> dict[str, Any]:
        """Get circuit breaker state for a specific model."""
        try:
            return self._caption_service.get_circuit_breaker_state(model_name)
        except Exception as e:
            logger.error(f"Failed to get circuit breaker state: {e}")
            raise

    def get_queue_status(self) -> dict[str, Any]:
        """Get request queue status."""
        try:
            return self._caption_service.get_queue_status()
        except Exception as e:
            logger.error(f"Failed to get queue status: {e}")
            raise


# Global service instance
_caption_api_service: CaptionAPIService | None = None


def get_caption_api_service() -> CaptionAPIService:
    """Get the global caption API service instance."""
    global _caption_api_service
    if _caption_api_service is None:
        _caption_api_service = CaptionAPIService()
    return _caption_api_service
