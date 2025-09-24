"""Plugin loading system for Reynard caption generators.

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

This module now serves as a facade that imports from the modular components:
- plugin.py: CaptionerPlugin class
- plugin_manager.py: CaptionerManager class
- plugin_discovery.py: Plugin discovery utilities
- global_manager.py: Global manager singleton
"""

from .global_manager import (
    discover_plugins,
    get_captioner_manager,
    is_manager_initialized,
    reset_global_manager,
)

# Import all the modular components
from .plugin import CaptionerPlugin
from .plugin_manager import CaptionerManager

# Re-export the main classes and functions for backward compatibility
__all__ = [
    "CaptionerManager",
    "CaptionerPlugin",
    "discover_plugins",
    "get_captioner_manager",
    "is_manager_initialized",
    "reset_global_manager",
]
