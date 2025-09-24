"""Global manager instance for Reynard caption generators.

This module provides a singleton pattern for the captioner manager,
ensuring a single instance is used throughout the application.
"""

from .plugin import CaptionerPlugin
from .plugin_manager import CaptionerManager

# Global manager instance
_captioner_manager: CaptionerManager | None = None


def get_captioner_manager() -> CaptionerManager:
    """Get the global captioner manager instance.

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


def discover_plugins() -> dict[str, CaptionerPlugin]:
    """Discover all available captioner plugins.

    Returns:
        dict[str, CaptionerPlugin]: Dictionary of plugin name to plugin instance

    """
    manager = get_captioner_manager()
    return manager._plugins


def reset_global_manager() -> None:
    """Reset the global manager instance.

    This is useful for testing or when you need to reinitialize
    the plugin system.
    """
    global _captioner_manager
    if _captioner_manager is not None:
        _captioner_manager.cleanup()
        _captioner_manager = None


def is_manager_initialized() -> bool:
    """Check if the global manager is initialized.

    Returns:
        bool: True if initialized, False otherwise

    """
    return _captioner_manager is not None
