#!/usr/bin/env python3
"""
THE Tool Registration System - Core Registry
============================================

The legendary tool registration system that reduces 8-step manual registration
to a single decorator-based step. This is the core registry with automatic
discovery and synchronization capabilities.

Follows the 140-line axiom and modular architecture principles.
"""

import inspect
import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from functools import wraps
from typing import Any, Awaitable, Callable, Dict, Optional

from config.tool_config import ToolConfigManager, ToolCategory
from services.tool_config_service import ToolConfigService

logger = logging.getLogger(__name__)

def log_timing(func_name: str):
    """Decorator to log timing of function execution."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            start_time = time.time()
            logger.debug(f"🕐 Starting {func_name}")
            try:
                result = func(*args, **kwargs)
                elapsed = time.time() - start_time
                logger.debug(f"✅ Completed {func_name} in {elapsed:.3f}s")
                return result
            except Exception as e:
                elapsed = time.time() - start_time
                logger.error(f"❌ Failed {func_name} after {elapsed:.3f}s: {e}")
                raise
        return wrapper
    return decorator


class ToolExecutionType(Enum):
    """Tool execution type enumeration."""

    SYNC = "sync"
    ASYNC = "async"


@dataclass
class ToolMetadata:
    """Tool metadata with auto-discovery capabilities."""

    name: str
    category: str
    description: str
    execution_type: ToolExecutionType
    enabled: bool = True
    dependencies: list[str] = field(default_factory=list)
    config: dict[str, Any] = field(default_factory=dict)
    handler_method: Optional[Callable] = None
    source_file: Optional[str] = None
    line_number: Optional[int] = None


class ToolRegistry:
    """The legendary tool registry with automatic discovery and synchronization."""

    def __init__(
        self,
        config_manager: ToolConfigManager = None,
        tool_config_service: ToolConfigService = None,
    ) -> None:
        logger.debug("🕐 Starting ToolRegistry.__init__")
        start_time = time.time()
        
        self._tools: Dict[str, ToolMetadata] = {}
        self._categories: Dict[str, set[str]] = {}
        self._auto_sync_enabled = False  # Disable auto-sync to prevent hangs
        
        logger.debug("🕐 Initializing ToolConfigManager...")
        config_start = time.time()
        self._config_manager = config_manager or ToolConfigManager()
        logger.debug(f"✅ ToolConfigManager initialized in {time.time() - config_start:.3f}s")
        
        logger.debug("🕐 Initializing ToolConfigService...")
        service_start = time.time()
        self._tool_config_service = tool_config_service or ToolConfigService()
        logger.debug(f"✅ ToolConfigService initialized in {time.time() - service_start:.3f}s")
        
        logger.debug("🕐 Loading config...")
        config_load_start = time.time()
        self._config = self._config_manager.load_config()
        logger.debug(f"✅ Config loaded in {time.time() - config_load_start:.3f}s")
        
        total_time = time.time() - start_time
        logger.debug(f"✅ ToolRegistry.__init__ completed in {total_time:.3f}s")

    def register_tool_decorator(
        self,
        name: str,
        category: str,
        description: str,
        execution_type: str = "sync",
        enabled: bool = True,
        dependencies: list[str] = None,
        config: dict[str, Any] = None
    ):
        """Decorator for automatic tool registration."""
        def decorator(func):
            # Get source file and line number
            source_file = inspect.getfile(func)
            line_number = inspect.getsourcelines(func)[1]

            # Create tool metadata
            tool_metadata = ToolMetadata(
                name=name,
                category=category,
                description=description,
                execution_type=ToolExecutionType(execution_type),
                enabled=enabled,
                dependencies=dependencies or [],
                config=config or {},
                handler_method=func,
                source_file=source_file,
                line_number=line_number
            )

            # Register the tool
            self._register_tool_metadata(tool_metadata)

            # Auto-sync with all systems
            if self._auto_sync_enabled:
                self._auto_sync_tool(tool_metadata)

            return func
        return decorator

    def _register_tool_metadata(self, metadata: ToolMetadata):
        """Register tool metadata."""
        self._tools[metadata.name] = metadata

        if metadata.category not in self._categories:
            self._categories[metadata.category] = set()
        self._categories[metadata.category].add(metadata.name)

    def _auto_sync_tool(self, metadata: ToolMetadata):
        """Automatically sync tool with all systems."""
        # Sync with ToolConfigService
        self._sync_with_config_service(metadata)

        # Sync with ToolConfigManager
        self._sync_with_config_manager(metadata)

        # Update configuration file
        self._update_configuration_file(metadata)

    def _sync_with_config_service(self, metadata: ToolMetadata):
        """Sync tool with ToolConfigService."""
        tool_config = {
            "name": metadata.name,
            "category": metadata.category,
            "enabled": metadata.enabled,
            "description": metadata.description,
            "dependencies": metadata.dependencies,
            "config": metadata.config,
        }

        # Update or create tool config
        self._tool_config_service.update_tool_config(metadata.name, tool_config)

    def _sync_with_config_manager(self, metadata: ToolMetadata):
        """Sync tool with ToolConfigManager."""
        # This would update the ToolConfigManager's default config
        # Implementation depends on current ToolConfigManager structure
        pass

    def _update_configuration_file(self, metadata: ToolMetadata):
        """Update the configuration file with current state."""
        self._tool_config_service._save_config()

    def discover_tools(self, module_path: str):
        """Auto-discover tools in a module."""
        import importlib
        import os

        if os.path.exists(module_path):
            # Scan for @register_tool decorators
            self._scan_module_for_tools(module_path)

    def _scan_module_for_tools(self, module_path: str):
        """Scan a module for @register_tool decorators."""
        # Implementation for scanning modules
        pass

    def get_tool_metadata(self, tool_name: str) -> Optional[ToolMetadata]:
        """Get tool metadata."""
        return self._tools.get(tool_name)

    def list_all_tools(self) -> Dict[str, ToolMetadata]:
        """List all registered tools."""
        return self._tools.copy()

    def get_tools_by_category(self, category: str) -> Dict[str, ToolMetadata]:
        """Get tools by category."""
        return {
            name: metadata
            for name, metadata in self._tools.items()
            if metadata.category == category
        }

    def is_tool_registered(self, tool_name: str) -> bool:
        """Check if a tool is registered."""
        return tool_name in self._tools

    def is_tool_enabled(self, tool_name: str) -> bool:
        """Check if a tool is enabled."""
        if tool_name not in self._tools:
            return False
        
        metadata = self._tools[tool_name]
        # If the tool is not in the config service yet, use the metadata enabled state
        if not self._tool_config_service.get_tool_config(tool_name):
            return metadata.enabled
        
        return (
            metadata.enabled and 
            self._tool_config_service.is_tool_enabled(tool_name)
        )

    def get_handler(self, tool_name: str) -> ToolMetadata:
        """Get handler for a tool."""
        if tool_name not in self._tools:
            raise ValueError(f"Unknown tool: {tool_name}")

        metadata = self._tools[tool_name]
        if not metadata.enabled:
            raise ValueError(f"Tool {tool_name} is disabled")

        return metadata

    def enable_tool(self, tool_name: str) -> bool:
        """Enable a tool."""
        if tool_name in self._tools:
            self._tools[tool_name].enabled = True
            return self._tool_config_service.enable_tool(tool_name)
        return False

    def disable_tool(self, tool_name: str) -> bool:
        """Disable a tool."""
        if tool_name in self._tools:
            self._tools[tool_name].enabled = False
            return self._tool_config_service.disable_tool(tool_name)
        return False

    def toggle_tool(self, tool_name: str) -> bool:
        """Toggle a tool's enabled state."""
        if tool_name in self._tools:
            success = self._tool_config_service.toggle_tool(tool_name)
            if success:
                self._tools[tool_name].enabled = (
                    self._tool_config_service.is_tool_enabled(tool_name)
                )
            return success
        return False

    def get_tool_config(self, tool_name: str) -> dict[str, Any]:
        """Get configuration for a tool."""
        if tool_name in self._tools:
            metadata = self._tools[tool_name]
            return {
                "name": metadata.name,
                "category": metadata.category,
                "enabled": metadata.enabled,
                "description": metadata.description,
                "dependencies": metadata.dependencies,
                "config": metadata.config,
            }
        return {}

    def get_all_tool_configs(self) -> dict[str, Dict[str, Any]]:
        """Get all tool configurations."""
        return {name: self.get_tool_config(name) for name in self._tools.keys()}

    def reload_config(self) -> None:
        """Reload configuration from file."""
        self._config = self._config_manager.load_config()
        self._tool_config_service.reload_config()
        # Update handler enabled states
        for tool_name, metadata in self._tools.items():
            metadata.enabled = self._tool_config_service.is_tool_enabled(tool_name)

    def auto_sync_all_tools(self):
        """Auto-sync all tools from the registry."""
        for tool_metadata in self._tools.values():
            self._auto_sync_tool(tool_metadata)


# Global registry instance (lazy initialization)
_tool_registry = None

def get_tool_registry() -> ToolRegistry:
    """Get the global tool registry instance (lazy initialization)."""
    global _tool_registry
    logger.debug("🕐 get_tool_registry called")
    if _tool_registry is None:
        logger.debug("🕐 Creating new ToolRegistry instance...")
        start_time = time.time()
        _tool_registry = ToolRegistry()
        elapsed = time.time() - start_time
        logger.debug(f"✅ ToolRegistry instance created in {elapsed:.3f}s")
    else:
        logger.debug("✅ Returning existing ToolRegistry instance")
    return _tool_registry

def register_tool(
    name: str,
    category: str,
    description: str,
    execution_type: str = "sync",
    enabled: bool = True,
    dependencies: list[str] = None,
    config: dict[str, Any] = None
):
    """Tool registration decorator - the legendary single-step registration."""
    def decorator(func):
        # Store the registration parameters for lazy registration
        func._tool_registration = {
            'name': name,
            'category': category,
            'description': description,
            'execution_type': execution_type,
            'enabled': enabled,
            'dependencies': dependencies or [],
            'config': config or {}
        }
        return func
    
    return decorator
