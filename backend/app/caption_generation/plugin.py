"""Captioner plugin wrapper for Reynard caption generators.

This module provides the CaptionerPlugin class that manages the lifecycle
of a captioner plugin, including lazy initialization, configuration management,
error handling, and model loading coordination.
"""

import asyncio
import importlib
import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from .base import CaptionGenerator, ModelCategory

logger = logging.getLogger("uvicorn")


class CaptionerPlugin:
    """Plugin wrapper for a Reynard caption generator.

    This class manages the lifecycle of a captioner plugin, including:
    - Lazy initialization
    - Configuration management
    - Error handling
    - Model loading coordination

    Args:
        name (str): Unique identifier for this plugin
        module_path (str): Import path to the module containing the generator
        config (dict, optional): Configuration for the generator

    """

    def __init__(
        self,
        name: str,
        module_path: str,
        config: dict[str, Any] | None = None,
    ):
        self.name = name
        self.module_path = module_path
        self.config = config or {}
        self._instance: CaptionGenerator | None = None
        self._available: bool | None = None
        self._loading_lock = asyncio.Lock()
        self._executor = ThreadPoolExecutor(
            max_workers=1,
            thread_name_prefix=f"captioner-{name}",
        )

    def get_instance(self) -> CaptionGenerator | None:
        """Get or create the captioner instance.

        Returns:
            Optional[CaptionGenerator]: The captioner instance, or None if failed

        Notes:
            - Lazy-loads the instance on first call
            - Caches the instance for subsequent calls
            - Returns None if the plugin cannot be loaded

        """
        if self._instance is None:
            try:
                # Import the module
                module = importlib.import_module(self.module_path)

                # Get the generator factory function
                if not hasattr(module, "get_generator"):
                    logger.error(f"Plugin {self.name} missing get_generator function")
                    return None

                # Create the generator instance
                generator_factory = module.get_generator
                self._instance = generator_factory(self.config)

                # Verify it's a valid CaptionGenerator
                if not isinstance(self._instance, CaptionGenerator):
                    logger.error(
                        f"Plugin {self.name} returned invalid generator type: "
                        f"{type(self._instance).__name__}",
                    )
                    self._instance = None
                    return None

                logger.info(f"Successfully loaded captioner plugin: {self.name}")

            except ImportError as e:
                logger.warning(f"Failed to import captioner plugin {self.name}: {e}")
                return None
            except Exception as e:
                logger.error(
                    f"Error initializing captioner plugin {self.name}: {e}",
                    exc_info=True,
                )
                return None

        return self._instance

    def is_available(self) -> bool:
        """Check if the plugin is available and can be used.

        Returns:
            bool: True if the plugin can be used, False otherwise

        Notes:
            - Caches the result for performance
            - Checks both plugin loading and captioner availability

        """
        if self._available is None:
            instance = self.get_instance()
            self._available = instance is not None and instance.is_available()
        return self._available

    async def load_model(self) -> bool:
        """Load the model into memory.

        Returns:
            bool: True if loading was successful, False otherwise

        Notes:
            - Thread-safe loading with coordination
            - Handles loading errors gracefully
            - Uses thread pool for CPU-bound operations

        """
        async with self._loading_lock:
            instance = self.get_instance()
            if not instance:
                return False

            if instance.is_loaded:
                return True

            try:
                # Run loading in thread pool to avoid blocking
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(
                    self._executor,
                    lambda: asyncio.run(instance.load(self.config)),
                )
                logger.info(f"Successfully loaded model for plugin: {self.name}")
                return True
            except Exception as e:
                logger.error(f"Failed to load model for plugin {self.name}: {e}")
                return False

    async def unload_model(self) -> bool:
        """Unload the model from memory.

        Returns:
            bool: True if unloading was successful, False otherwise

        Notes:
            - Thread-safe unloading with coordination
            - Handles unloading errors gracefully

        """
        async with self._loading_lock:
            instance = self.get_instance()
            if not instance:
                return True  # Nothing to unload

            if not instance.is_loaded:
                return True  # Already unloaded

            try:
                # Run unloading in thread pool to avoid blocking
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(
                    self._executor,
                    lambda: asyncio.run(instance.unload()),
                )
                logger.info(f"Successfully unloaded model for plugin: {self.name}")
                return True
            except Exception as e:
                logger.error(f"Failed to unload model for plugin {self.name}: {e}")
                return False

    def get_model_category(self) -> ModelCategory:
        """Get the model category for resource management.

        Returns:
            ModelCategory: The category of this model

        Notes:
            - Used for determining loading strategies
            - Lightweight models are loaded more aggressively

        """
        instance = self.get_instance()
        if instance:
            return instance.model_category
        return ModelCategory.HEAVY

    def get_info(self) -> dict[str, Any]:
        """Get comprehensive information about this plugin.

        Returns:
            Dict[str, Any]: Dictionary containing all plugin information

        """
        instance = self.get_instance()
        if instance:
            return instance.get_info()

        return {
            "name": self.name,
            "description": f"Plugin {self.name} (not loaded)",
            "version": "unknown",
            "caption_type": "unknown",
            "is_available": False,
            "is_loaded": False,
            "config_schema": {},
            "features": [],
            "model_category": ModelCategory.HEAVY.value,
        }

    def reset(self) -> None:
        """Reset the plugin state, forcing re-initialization.

        This is useful when configuration has changed or when testing.
        """
        self._instance = None
        self._available = None

    def cleanup(self) -> None:
        """Clean up resources used by this plugin.

        Notes:
            - Should be called when the plugin is no longer needed
            - Shuts down the thread pool executor

        """
        if hasattr(self, "_executor"):
            self._executor.shutdown(wait=True)
