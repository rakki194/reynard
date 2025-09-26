"""Model coordination service for caption generation.

This module handles model loading, coordination, and lifecycle management
with proper locking and resource management.
"""

import logging

from ..base import CaptionGenerator, ModelCategory
from ..coordination import get_loading_lock
from ..plugin_loader import get_captioner_manager

logger = logging.getLogger("uvicorn")


class ModelCoordinator:
    """Coordinates model loading and management for caption generation."""

    def __init__(self):
        self._manager = get_captioner_manager()

    def should_load_model(
        self,
        generator_name: str,
        *,
        is_batch: bool,
        batch_size: int = 0,
    ) -> bool:
        """Determine if a model should be loaded based on context."""
        captioner = self._manager.get_captioner(generator_name)
        if not captioner:
            return False

        category = captioner.model_category
        if category == ModelCategory.LIGHTWEIGHT:
            return True
        if category == ModelCategory.HEAVY:
            if is_batch and batch_size > 50:
                return True
            return True
        return True

    async def get_or_load_model(self, generator_name: str) -> CaptionGenerator | None:
        """Get or load a model with proper coordination."""
        if generator_name in self._manager.get_loaded_models():
            captioner = self._manager.get_captioner(generator_name)
            if captioner and captioner.is_loaded:
                return captioner

        lock = get_loading_lock(generator_name)
        async with lock:
            # Double-check after acquiring lock
            if generator_name in self._manager.get_loaded_models():
                captioner = self._manager.get_captioner(generator_name)
                if captioner and captioner.is_loaded:
                    return captioner

            success = await self._manager.load_captioner(generator_name)
            if success:
                logger.info(f"Loaded caption model with coordination: {generator_name}")
                return self._manager.get_captioner(generator_name)
            logger.error(f"Failed to load caption model: {generator_name}")
            return None

    def get_loaded_models(self) -> set:
        """Get set of currently loaded models."""
        return self._manager.get_loaded_models()

    def is_model_loaded(self, model_id: str) -> bool:
        """Check if a model is currently loaded."""
        return model_id in self._manager.get_loaded_models()

    async def load_model(self, generator_name: str) -> bool:
        """Load a specific model."""
        return await self._manager.load_captioner(generator_name)

    async def unload_model(self, generator_name: str) -> bool:
        """Unload a specific model."""
        return await self._manager.unload_captioner(generator_name)

    def get_available_generators(self) -> dict:
        """Get information about available generators."""
        return self._manager.get_available_captioners()

    def get_generator_info(self, generator_name: str) -> dict | None:
        """Get information about a specific generator."""
        return self._manager.get_available_captioners().get(generator_name)

    def is_generator_available(self, generator_name: str) -> bool:
        """Check if a generator is available."""
        return self._manager.is_captioner_available(generator_name)
