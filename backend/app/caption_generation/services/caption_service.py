"""Main caption service orchestrator.

This module provides the main service interface that coordinates
model management, batch processing, and statistics tracking.
"""

import logging
import time
from collections.abc import Callable
from typing import Any

from .. import stats as stats_mod
from ..base import CaptionGenerator
from ..errors import CaptionError, format_error_message
from ..post_processing import post_process_caption
from ..retry_utils import DEFAULT_RETRY_CONFIG, retry_with_backoff
from ..types import CaptionResult, CaptionTask
from .batch_processor import BatchProcessor
from .model_coordinator import ModelCoordinator

logger = logging.getLogger("uvicorn")


class CaptionService:
    """Main service orchestrating caption generation with modular helpers."""

    def __init__(self):
        self._model_coordinator = ModelCoordinator()
        self._batch_processor = BatchProcessor(self._model_coordinator)
        self._retry_config = dict(DEFAULT_RETRY_CONFIG)
        self._total_processed = 0
        self._total_processing_time = 0.0
        self._active_tasks: set[str] = set()

    async def generate_single_caption(
        self,
        image_path,
        generator_name: str,
        config: dict[str, Any] | None = None,
        force: bool = False,
    ) -> CaptionResult:
        """Generate a caption for a single image."""
        start_time = time.time()
        config = config or {}

        try:
            if not self._model_coordinator.should_load_model(
                generator_name,
                is_batch=False,
            ):
                return CaptionResult(
                    image_path=image_path,
                    generator_name=generator_name,
                    success=False,
                    error="Model loading not allowed for single operation",
                    error_type="model_loading",
                    retryable=False,
                    caption_type=None,
                )

            model = await self._model_coordinator.get_or_load_model(generator_name)
            if not model:
                return CaptionResult(
                    image_path=image_path,
                    generator_name=generator_name,
                    success=False,
                    error=f"Model {generator_name} is not available. Please ensure the model is downloaded and try again.",
                    error_type="model_unavailable",
                    retryable=True,
                    caption_type=None,
                )

            if not force:
                caption_path = image_path.with_suffix(f".{model.caption_type.value}")
                logger.debug(
                    f"Checking if caption exists for {generator_name}: {caption_path}",
                )
                if caption_path.exists():
                    logger.info(
                        f"Caption already exists for {generator_name} at {caption_path}, skipping generation",
                    )
                    return CaptionResult(
                        image_path=image_path,
                        generator_name=generator_name,
                        success=False,
                        error="Caption already exists. Use 'force' option to regenerate.",
                        error_type="caption_exists",
                        retryable=False,
                        caption_type=model.caption_type.value,
                    )

            caption = await self._generate_caption_with_retry(model, image_path, config)
            if caption and config.get("post_process", True):
                caption = post_process_caption(
                    caption,
                    generator_name,
                    config.get("post_processing_settings"),
                )

            processing_time = time.time() - start_time
            stats_mod.record_usage(generator_name, processing_time, True)
            self._total_processed += 1
            self._total_processing_time += processing_time

            return CaptionResult(
                image_path=image_path,
                generator_name=generator_name,
                success=True,
                caption=caption,
                processing_time=processing_time,
                caption_type=model.caption_type.value,
            )

        except CaptionError as e:
            processing_time = time.time() - start_time
            logger.error(
                f"Caption generation error for {image_path}: {e}",
                exc_info=True,
            )
            stats_mod.record_usage(generator_name, processing_time, False)
            self._total_processed += 1
            self._total_processing_time += processing_time
            return CaptionResult(
                image_path=image_path,
                generator_name=generator_name,
                success=False,
                error=format_error_message(e),
                error_type=e.error_type,
                retryable=e.retryable,
                processing_time=processing_time,
                caption_type=None,
            )
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(
                f"Unexpected error generating caption for {image_path}: {e}",
                exc_info=True,
            )
            self._total_processed += 1
            self._total_processing_time += processing_time
            return CaptionResult(
                image_path=image_path,
                generator_name=generator_name,
                success=False,
                error=f"Unexpected error: {e!s}",
                error_type="unexpected",
                retryable=True,
                processing_time=processing_time,
                caption_type=None,
            )

    async def generate_batch_captions(
        self,
        tasks: list[CaptionTask],
        progress_callback: Callable[[dict[str, Any]], None] | None = None,
        max_concurrent: int = 4,
    ) -> list[CaptionResult]:
        """Generate captions for multiple images in batch."""
        return await self._batch_processor.process_batch(
            tasks,
            progress_callback,
            max_concurrent,
        )

    async def _generate_caption_with_retry(
        self,
        model: CaptionGenerator,
        image_path,
        config: dict[str, Any],
    ) -> str:
        """Generate caption with retry logic."""

        async def _generate() -> str:
            try:
                return await model.generate(image_path, **config)
            except Exception as e:
                from ..errors import CaptionGenerationError

                retryable = any(
                    p in str(e).lower()
                    for p in [
                        "timeout",
                        "connection",
                        "network",
                        "temporary",
                        "server error",
                        "rate limit",
                        "memory",
                        "cuda",
                    ]
                )
                raise CaptionGenerationError(model.name, str(e), retryable=retryable)

        return await retry_with_backoff(
            _generate,
            "caption generation",
            config=self._retry_config,
        )

    # Introspection and control
    def get_available_generators(self) -> dict[str, dict[str, Any]]:
        """Get information about available generators."""
        return self._model_coordinator.get_available_generators()

    def get_generator_info(self, generator_name: str) -> dict[str, Any] | None:
        """Get information about a specific generator."""
        return self._model_coordinator.get_generator_info(generator_name)

    def is_generator_available(self, generator_name: str) -> bool:
        """Check if a generator is available."""
        return self._model_coordinator.is_generator_available(generator_name)

    def get_loaded_models(self) -> set:
        """Get set of currently loaded models."""
        return self._model_coordinator.get_loaded_models()

    def is_model_loaded(self, model_id: str) -> bool:
        """Check if a model is currently loaded."""
        return self._model_coordinator.is_model_loaded(model_id)

    async def load_model(self, generator_name: str) -> bool:
        """Load a specific model."""
        return await self._model_coordinator.load_model(generator_name)

    async def unload_model(self, generator_name: str) -> bool:
        """Unload a specific model."""
        return await self._model_coordinator.unload_model(generator_name)

    def unload_all_models(self) -> None:
        """Unload all models."""

    # Stats facade
    def get_model_usage_stats(self, model_name: str) -> dict[str, Any] | None:
        """Get usage statistics for a specific model."""
        return stats_mod.get_model_usage_stats(model_name)

    def get_health_status(self, model_name: str | None = None) -> dict[str, Any]:
        """Get health status for system or specific model."""
        if model_name:
            return stats_mod.get_health_status(model_name=model_name)
        return stats_mod.get_health_status(
            total_processed=self._total_processed,
            total_processing_time=self._total_processing_time,
        )

    def get_circuit_breaker_state(self, model_name: str) -> dict[str, Any]:
        """Get circuit breaker state for a specific model."""
        return stats_mod.get_circuit_breaker_state(model_name)

    def get_queue_status(self) -> dict[str, Any]:
        """Get request queue status."""
        return stats_mod.get_queue_status()

    def get_system_statistics(self) -> dict[str, Any]:
        """Get comprehensive system statistics."""
        return {
            "total_processed": self._total_processed,
            "total_processing_time": self._total_processing_time,
            "average_processing_time": self._total_processing_time
            / max(self._total_processed, 1),
            "active_tasks": len(self._active_tasks),
            "loaded_models": len(self.get_loaded_models()),
            "available_generators": len(self.get_available_generators()),
            "usage_stats": {k: v for k, v in (stats_mod._model_usage_stats).items()},
            "health_status": self.get_health_status(),
            "queue_status": self.get_queue_status(),
        }
