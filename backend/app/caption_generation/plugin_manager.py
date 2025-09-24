"""Plugin manager for Reynard caption generators.

This class provides a centralized way to manage all caption generators,
including discovery, loading, and lifecycle management.
"""

import asyncio
import logging
from typing import Any

from .base import CaptionGenerator
from .plugin import CaptionerPlugin
from .plugin_discovery import discover_plugins

logger = logging.getLogger("uvicorn")


class CaptionerManager:
    """Manager for all caption generator plugins.

    This class provides a centralized way to manage all caption generators,
    including discovery, loading, and lifecycle management.
    """

    def __init__(self):
        self._plugins: dict[str, CaptionerPlugin] = {}
        self._loaded_models: set[str] = set()
        self._loading_locks: dict[str, asyncio.Lock] = {}

    def discover_plugins(self) -> dict[str, CaptionerPlugin]:
        """Discover all available captioner plugins.

        Returns:
            Dict[str, CaptionerPlugin]: Dictionary of plugin name to plugin instance

        Notes:
            - Searches the plugins directory for plugin packages
            - Each plugin must have an __init__.py with a register_plugin function
            - Handles errors gracefully to prevent plugin issues from breaking the app

        """
        plugins = discover_plugins()
        self._plugins = plugins
        return plugins

    def get_available_captioners(self) -> dict[str, dict[str, Any]]:
        """Get information about all available captioners.

        Returns:
            Dict[str, Dict[str, Any]]: Dictionary of captioner info

        """
        return {name: plugin.get_info() for name, plugin in self._plugins.items()}

    def get_captioner(self, name: str) -> CaptionGenerator | None:
        """Get a specific captioner instance.

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
        """Check if a captioner is available.

        Args:
            name: Name of the captioner to check

        Returns:
            bool: True if the captioner is available, False otherwise

        """
        plugin = self._plugins.get(name)
        return plugin.is_available() if plugin else False

    async def load_captioner(self, name: str) -> bool:
        """Load a specific captioner model.

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
        """Unload a specific captioner model.

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

    def get_loaded_models(self) -> set[str]:
        """Get the set of currently loaded model names.

        Returns:
            Set[str]: Set of loaded model names

        """
        return self._loaded_models.copy()

    async def cleanup(self) -> None:
        """Clean up all plugins and resources.

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
