"""
Plugin discovery system for Reynard caption generators.

This module provides utilities for discovering and registering caption generator
plugins from the plugins directory. It implements a plugin registry pattern that
allows the Reynard application to discover available captioners at runtime.
"""

import importlib
import logging
from pathlib import Path
from typing import Any, Dict

from .plugin import CaptionerPlugin

logger = logging.getLogger("uvicorn")


def discover_plugins() -> Dict[str, CaptionerPlugin]:
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
            plugin = _load_plugin_from_path(plugin_path)
            if plugin:
                plugins[plugin.name] = plugin
                logger.info(f"Registered captioner plugin: {plugin.name}")

        except Exception as e:
            logger.warning(
                f"Error loading plugin from {plugin_path}: {e}", exc_info=True
            )
            continue

    return plugins


def _load_plugin_from_path(plugin_path: Path) -> CaptionerPlugin:
    """
    Load a single plugin from a directory path.

    Args:
        plugin_path: Path to the plugin directory

    Returns:
        CaptionerPlugin: The loaded plugin instance, or None if failed

    Raises:
        Exception: If plugin loading fails
    """
    # Import the plugin module
    module_path = f"app.caption_generation.plugins.{plugin_path.name}"
    module = importlib.import_module(module_path)

    # Check for register_plugin function
    if not hasattr(module, "register_plugin"):
        logger.warning(
            f"Plugin {plugin_path.name} missing register_plugin function"
        )
        return None

    # Get plugin info
    register_func = getattr(module, "register_plugin")
    plugin_info = register_func()

    # Validate plugin info
    if not isinstance(plugin_info, dict):
        logger.warning(
            f"Plugin {plugin_path.name} returned invalid registration info"
        )
        return None

    if "name" not in plugin_info or "module_path" not in plugin_info:
        logger.warning(
            f"Plugin {plugin_path.name} missing required registration fields"
        )
        return None

    # Create plugin instance
    name = plugin_info["name"]
    module_path = plugin_info["module_path"]
    default_config = plugin_info.get("default_config", {})

    return CaptionerPlugin(name, module_path, default_config)


def validate_plugin_info(plugin_info: Dict[str, Any], plugin_name: str) -> bool:
    """
    Validate plugin registration information.

    Args:
        plugin_info: Plugin registration information
        plugin_name: Name of the plugin for error reporting

    Returns:
        bool: True if valid, False otherwise
    """
    if not isinstance(plugin_info, dict):
        logger.warning(f"Plugin {plugin_name} returned invalid registration info")
        return False

    required_fields = ["name", "module_path"]
    for field in required_fields:
        if field not in plugin_info:
            logger.warning(
                f"Plugin {plugin_name} missing required field: {field}"
            )
            return False

    return True


def get_plugin_directory() -> Path:
    """
    Get the plugins directory path.

    Returns:
        Path: Path to the plugins directory
    """
    return Path(__file__).parent / "plugins"


def is_valid_plugin_directory(plugin_path: Path) -> bool:
    """
    Check if a directory is a valid plugin directory.

    Args:
        plugin_path: Path to check

    Returns:
        bool: True if valid plugin directory, False otherwise
    """
    if not plugin_path.is_dir():
        return False

    if plugin_path.name.startswith("_"):
        return False

    init_path = plugin_path / "__init__.py"
    return init_path.exists()
