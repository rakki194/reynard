"""Main Diffusion-LLM service orchestrator.

This service manages diffusion-based text generation using DreamOn and LLaDA models
with streaming support, device management, and automatic fallback.
"""

import logging
import time
from collections.abc import AsyncIterable
from typing import Any

from .models import (
    DiffusionConfig,
    DiffusionGenerationParams,
    DiffusionInfillingParams,
    DiffusionModelInfo,
    DiffusionStats,
    DiffusionStreamEvent,
)

logger = logging.getLogger(__name__)


class DiffusionLLMService:
    """Main service for diffusion-based text generation."""

    def __init__(self):
        self._config: DiffusionConfig | None = None
        self._model_manager: DiffusionModelManager | None = None
        self._device_manager: DeviceManager | None = None
        self._stats: dict[str, Any] = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "total_processing_time": 0.0,
            "total_tokens_generated": 0,
            "model_usage": {},
            "device_usage": {},
        }
        self._enabled = False

    async def initialize(self, config: dict[str, Any]) -> bool:
        """Initialize the diffusion service."""
        try:
            self._config = DiffusionConfig(**config.get("diffusion", {}))
            self._enabled = self._config.enabled

            if not self._enabled:
                logger.info("Diffusion service disabled in configuration")
                return True

            # Initialize model and device managers
            self._model_manager = DiffusionModelManager()
            self._device_manager = DeviceManager()

            await self._model_manager.initialize(self._config)
            await self._device_manager.initialize(self._config)

            logger.info("Diffusion service initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize diffusion service: {e}")
            return False

    async def generate_stream(
        self, params: DiffusionGenerationParams,
    ) -> AsyncIterable[DiffusionStreamEvent]:
        """Generate text with streaming support."""
        if not self._enabled:
            yield DiffusionStreamEvent(
                type="error",
                data="Diffusion service is disabled",
                timestamp=time.time(),
            )
            return

        start_time = time.time()
        self._stats["total_requests"] += 1

        try:
            # Get model
            model = await self._model_manager.get_model(params.model_id)
            if not model:
                yield DiffusionStreamEvent(
                    type="error",
                    data=f"Model {params.model_id} not available",
                    timestamp=time.time(),
                )
                self._stats["failed_requests"] += 1
                return

            # Generate with streaming
            tokens_generated = 0
            async for event in model.generate_stream(params):
                if event.type == "token":
                    tokens_generated += 1
                    self._stats["total_tokens_generated"] += 1

                yield event

            # Update stats
            processing_time = time.time() - start_time
            self._stats["successful_requests"] += 1
            self._stats["total_processing_time"] += processing_time
            self._stats["model_usage"][params.model_id] = (
                self._stats["model_usage"].get(params.model_id, 0) + 1
            )

            # Final completion event
            yield DiffusionStreamEvent(
                type="complete",
                data="",
                timestamp=time.time(),
                metadata={
                    "tokens_generated": tokens_generated,
                    "processing_time": processing_time,
                },
            )

        except Exception as e:
            logger.error(f"Generation failed: {e}")
            self._stats["failed_requests"] += 1
            yield DiffusionStreamEvent(
                type="error",
                data=str(e),
                timestamp=time.time(),
            )

    async def infill_stream(
        self, params: DiffusionInfillingParams,
    ) -> AsyncIterable[DiffusionStreamEvent]:
        """Infill text with streaming support."""
        if not self._enabled:
            yield DiffusionStreamEvent(
                type="error",
                data="Diffusion service is disabled",
                timestamp=time.time(),
            )
            return

        start_time = time.time()
        self._stats["total_requests"] += 1

        try:
            # Get model
            model = await self._model_manager.get_model(params.model_id)
            if not model:
                yield DiffusionStreamEvent(
                    type="error",
                    data=f"Model {params.model_id} not available",
                    timestamp=time.time(),
                )
                self._stats["failed_requests"] += 1
                return

            # Infill with streaming
            tokens_generated = 0
            async for event in model.infill_stream(params):
                if event.type == "token":
                    tokens_generated += 1
                    self._stats["total_tokens_generated"] += 1

                yield event

            # Update stats
            processing_time = time.time() - start_time
            self._stats["successful_requests"] += 1
            self._stats["total_processing_time"] += processing_time
            self._stats["model_usage"][params.model_id] = (
                self._stats["model_usage"].get(params.model_id, 0) + 1
            )

            # Final completion event
            yield DiffusionStreamEvent(
                type="complete",
                data="",
                timestamp=time.time(),
                metadata={
                    "tokens_generated": tokens_generated,
                    "processing_time": processing_time,
                },
            )

        except Exception as e:
            logger.error(f"Infilling failed: {e}")
            self._stats["failed_requests"] += 1
            yield DiffusionStreamEvent(
                type="error",
                data=str(e),
                timestamp=time.time(),
            )

    async def get_available_models(self) -> list[DiffusionModelInfo]:
        """Get list of available models."""
        if not self._enabled or not self._model_manager:
            return []

        return await self._model_manager.get_available_models()

    async def get_config(self) -> dict[str, Any]:
        """Get current configuration."""
        if not self._config:
            return {}

        return self._config.model_dump()

    async def update_config(self, config: dict[str, Any]) -> bool:
        """Update configuration."""
        try:
            self._config = DiffusionConfig(**config)
            self._enabled = self._config.enabled

            if self._model_manager:
                await self._model_manager.update_config(self._config)

            if self._device_manager:
                await self._device_manager.update_config(self._config)

            return True

        except Exception as e:
            logger.error(f"Failed to update config: {e}")
            return False

    async def get_stats(self) -> DiffusionStats:
        """Get service statistics."""
        total_requests = self._stats["total_requests"]
        successful_requests = self._stats["successful_requests"]
        failed_requests = self._stats["failed_requests"]

        average_processing_time = 0.0
        if successful_requests > 0:
            average_processing_time = (
                self._stats["total_processing_time"] / successful_requests
            )

        error_rate = 0.0
        if total_requests > 0:
            error_rate = (failed_requests / total_requests) * 100

        return DiffusionStats(
            total_requests=total_requests,
            successful_requests=successful_requests,
            failed_requests=failed_requests,
            average_processing_time=average_processing_time,
            total_tokens_generated=self._stats["total_tokens_generated"],
            model_usage=self._stats["model_usage"].copy(),
            device_usage=self._stats["device_usage"].copy(),
            error_rate=error_rate,
        )

    async def health_check(self) -> bool:
        """Check service health."""
        if not self._enabled:
            return True

        try:
            if not self._model_manager or not self._device_manager:
                return False

            # Check if at least one model is available
            models = await self.get_available_models()
            return len(models) > 0

        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False

    async def reload_model(self, model_id: str) -> bool:
        """Reload a specific model."""
        if not self._enabled or not self._model_manager:
            return False

        try:
            return await self._model_manager.reload_model(model_id)
        except Exception as e:
            logger.error(f"Failed to reload model {model_id}: {e}")
            return False

    async def cleanup(self) -> None:
        """Cleanup resources."""
        try:
            if self._model_manager:
                await self._model_manager.cleanup()

            if self._device_manager:
                await self._device_manager.cleanup()

            logger.info("Diffusion service cleanup completed")

        except Exception as e:
            logger.error(f"Error during cleanup: {e}")


# Placeholder classes - these would be implemented in separate files
class DiffusionModelManager:
    """Manages diffusion models and their lifecycle."""

    async def initialize(self, config: DiffusionConfig) -> None:
        """Initialize the model manager."""

    async def get_model(self, model_id: str):
        """Get a model by ID."""
        return

    async def get_available_models(self) -> list[DiffusionModelInfo]:
        """Get available models."""
        return []

    async def update_config(self, config: DiffusionConfig) -> None:
        """Update configuration."""

    async def reload_model(self, model_id: str) -> bool:
        """Reload a model."""
        return False

    async def cleanup(self) -> None:
        """Cleanup resources."""


class DeviceManager:
    """Manages device selection and memory monitoring."""

    async def initialize(self, config: DiffusionConfig) -> None:
        """Initialize the device manager."""

    async def update_config(self, config: DiffusionConfig) -> None:
        """Update configuration."""

    async def cleanup(self) -> None:
        """Cleanup resources."""
