"""
Plugin loading system for Reynard caption generators.

This module provides the infrastructure for dynamically discovering and loading
caption generator plugins. It implements a plugin registry pattern that allows
the Reynard application to discover available captioners at runtime without
requiring hard-coded dependencies.

Key features:
- Dynamic plugin discovery from the plugins directory
- Lazy loading of captioner instances to minimize startup time
- Configuration management for plugins
- Error isolation to prevent plugin failures from affecting the application
- Model category management for resource optimization

The plugin system supports:
- Runtime detection of available captioners
- Configuration updates without application restart
- Graceful handling of missing dependencies
- Model lifecycle management
"""

import asyncio
import importlib
import logging
from pathlib import Path
from typing import Any, Dict, Optional, Set
from concurrent.futures import ThreadPoolExecutor

from .base import CaptionGenerator, ModelCategory

logger = logging.getLogger("uvicorn")


class CaptionerPlugin:
    """
    Plugin wrapper for a Reynard caption generator.

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
        self, name: str, module_path: str, config: Optional[Dict[str, Any]] = None
    ):
        self.name = name
        self.module_path = module_path
        self.config = config or {}
        self._instance: Optional[CaptionGenerator] = None
        self._available: Optional[bool] = None
        self._loading_lock = asyncio.Lock()
        self._executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix=f"captioner-{name}")

    def get_instance(self) -> Optional[CaptionGenerator]:
        """
        Get or create the captioner instance.

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
                generator_factory = getattr(module, "get_generator")
                self._instance = generator_factory(self.config)

                # Verify it's a valid CaptionGenerator
                if not isinstance(self._instance, CaptionGenerator):
                    logger.error(
                        f"Plugin {self.name} returned invalid generator type: "
                        f"{type(self._instance).__name__}"
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
        """
        Check if the plugin is available and can be used.

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
        """
        Load the model into memory.

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
                await loop.run_in_executor(self._executor, lambda: asyncio.run(instance.load(self.config)))
                logger.info(f"Successfully loaded model for plugin: {self.name}")
                return True
            except Exception as e:
                logger.error(f"Failed to load model for plugin {self.name}: {e}")
                return False

    async def unload_model(self) -> bool:
        """
        Unload the model from memory.

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
                await loop.run_in_executor(self._executor, lambda: asyncio.run(instance.unload()))
                logger.info(f"Successfully unloaded model for plugin: {self.name}")
                return True
            except Exception as e:
                logger.error(f"Failed to unload model for plugin {self.name}: {e}")
                return False

    def get_model_category(self) -> ModelCategory:
        """
        Get the model category for resource management.

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

    def get_info(self) -> Dict[str, Any]:
        """
        Get comprehensive information about this plugin.

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
            "model_category": ModelCategory.HEAVY.value
        }

    def reset(self) -> None:
        """
        Reset the plugin state, forcing re-initialization.

        This is useful when configuration has changed or when testing.
        """
        self._instance = None
        self._available = None

    def cleanup(self) -> None:
        """
        Clean up resources used by this plugin.

        Notes:
            - Should be called when the plugin is no longer needed
            - Shuts down the thread pool executor
        """
        if hasattr(self, '_executor'):
            self._executor.shutdown(wait=True)


class CaptionerManager:
    """
    Manager for all caption generator plugins.

    This class provides a centralized way to manage all caption generators,
    including discovery, loading, and lifecycle management.
    """

    def __init__(self):
        self._plugins: Dict[str, CaptionerPlugin] = {}
        self._loaded_models: Set[str] = set()
        self._loading_locks: Dict[str, asyncio.Lock] = {}

    def discover_plugins(self) -> Dict[str, CaptionerPlugin]:
        """
        Discover all available captioner plugins.

        Returns:
            Dict[str, CaptionerPlugin]: Dictionary of plugin name to plugin instance

        Notes:
            - Searches the plugins directory for plugin packages
            - Each plugin must have an __init__.py with a register_plugin function
            - Handles errors gracefully to prevent plugin issues from breaking the app
        """
        plugins = {}
        plugin_dir = Path(__file__).parent / "plugins"

        if not plugin_dir.exists() or not plugin_dir.is_dir():
            logger.warning(f"Plugin directory not found: {plugin_dir}")
            return plugins

        # Scan for plugin directories
        for plugin_path in plugin_dir.glob("*/"):
            if not plugin_path.is_dir() or plugin_path.name.startswith("_"):
                continue

            # Check for __init__.py
            init_path = plugin_path / "__init__.py"
            if not init_path.exists():
                logger.debug(f"Skipping {plugin_path.name}: no __init__.py found")
                continue

            try:
                # Import the plugin module
                module_path = f"app.caption_generation.plugins.{plugin_path.name}"
                module = importlib.import_module(module_path)

                # Check for register_plugin function
                if not hasattr(module, "register_plugin"):
                    logger.warning(
                        f"Plugin {plugin_path.name} missing register_plugin function"
                    )
                    continue

                # Get plugin info
                register_func = getattr(module, "register_plugin")
                plugin_info = register_func()

                # Validate plugin info
                if not isinstance(plugin_info, dict):
                    logger.warning(
                        f"Plugin {plugin_path.name} returned invalid registration info"
                    )
                    continue

                if "name" not in plugin_info or "module_path" not in plugin_info:
                    logger.warning(
                        f"Plugin {plugin_path.name} missing required registration fields"
                    )
                    continue

                # Create plugin instance
                name = plugin_info["name"]
                module_path = plugin_info["module_path"]
                default_config = plugin_info.get("default_config", {})

                plugins[name] = CaptionerPlugin(name, module_path, default_config)
                logger.info(f"Registered captioner plugin: {name}")

            except Exception as e:
                logger.warning(
                    f"Error loading plugin from {plugin_path}: {e}", exc_info=True
                )
                continue

        self._plugins = plugins
        return plugins

    def get_available_captioners(self) -> Dict[str, Dict[str, Any]]:
        """
        Get information about all available captioners.

        Returns:
            Dict[str, Dict[str, Any]]: Dictionary of captioner info
        """
        return {name: plugin.get_info() for name, plugin in self._plugins.items()}

    def get_captioner(self, name: str) -> Optional[CaptionGenerator]:
        """
        Get a specific captioner instance.

        Args:
            name: Name of the captioner to get

        Returns:
            Optional[CaptionGenerator]: The captioner instance, or None if not found
        """
        plugin = self._plugins.get(name)
        if plugin:
            return plugin.get_instance()
        return None

    def is_captioner_available(self, name: str) -> bool:
        """
        Check if a captioner is available.

        Args:
            name: Name of the captioner to check

        Returns:
            bool: True if the captioner is available, False otherwise
        """
        plugin = self._plugins.get(name)
        return plugin.is_available() if plugin else False

    async def load_captioner(self, name: str) -> bool:
        """
        Load a specific captioner model.

        Args:
            name: Name of the captioner to load

        Returns:
            bool: True if loading was successful, False otherwise
        """
        plugin = self._plugins.get(name)
        if not plugin:
            return False

        success = await plugin.load_model()
        if success:
            self._loaded_models.add(name)
        return success

    async def unload_captioner(self, name: str) -> bool:
        """
        Unload a specific captioner model.

        Args:
            name: Name of the captioner to unload

        Returns:
            bool: True if unloading was successful, False otherwise
        """
        plugin = self._plugins.get(name)
        if not plugin:
            return True

        success = await plugin.unload_model()
        if success:
            self._loaded_models.discard(name)
        return success

    def get_loaded_models(self) -> Set[str]:
        """
        Get the set of currently loaded model names.

        Returns:
            Set[str]: Set of loaded model names
        """
        return self._loaded_models.copy()

    async def cleanup(self) -> None:
        """
        Clean up all plugins and resources.

        Notes:
            - Should be called when the manager is no longer needed
            - Unloads all models and cleans up plugin resources
        """
        # Unload all models
        for name in list(self._loaded_models):
            await self.unload_captioner(name)

        # Clean up all plugins
        for plugin in self._plugins.values():
            plugin.cleanup()

        self._plugins.clear()
        self._loaded_models.clear()


# Global manager instance
_captioner_manager: Optional[CaptionerManager] = None


def get_captioner_manager() -> CaptionerManager:
    """
    Get the global captioner manager instance.

    Returns:
        CaptionerManager: The global manager instance

    Notes:
        - Creates the manager on first call
        - Discovers plugins automatically
    """
    global _captioner_manager
    if _captioner_manager is None:
        _captioner_manager = CaptionerManager()
        _captioner_manager.discover_plugins()
    return _captioner_manager


def discover_plugins() -> Dict[str, CaptionerPlugin]:
    """
    Discover all available captioner plugins.

    Returns:
        Dict[str, CaptionerPlugin]: Dictionary of plugin name to plugin instance
    """
    manager = get_captioner_manager()
    return manager._plugins
