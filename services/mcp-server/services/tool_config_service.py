#!/usr/bin/env python3
"""
Enhanced Tool Configuration Service
===================================

Enhanced service that bridges the new tool registry with existing configuration
services, providing seamless auto-sync capabilities.

Follows the 140-line axiom and modular architecture principles.
"""

import json
import logging
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

# Import moved to avoid circular dependency

logger = logging.getLogger(__name__)


class ToolConfigService:
    """Enhanced service for managing tool configurations with auto-sync capabilities."""

    def __init__(self, config_file_path: str = "tool_config.json", tool_registry=None):
        """Initialize the enhanced tool configuration service."""
        logger.debug("🕐 Starting ToolConfigService.__init__")
        start_time = time.time()
        
        self.config_file_path = Path(config_file_path)
        self.config_data: Dict[str, Any] = {}
        self.tool_registry = tool_registry
        
        logger.debug("🕐 Loading config in ToolConfigService...")
        config_start = time.time()
        self._load_config()
        config_elapsed = time.time() - config_start
        logger.debug(f"✅ Config loaded in ToolConfigService in {config_elapsed:.3f}s")
        
        total_elapsed = time.time() - start_time
        logger.debug(f"✅ ToolConfigService.__init__ completed in {total_elapsed:.3f}s")

    def _load_config(self) -> None:
        """Load tool configuration from file."""
        try:
            if self.config_file_path.exists():
                with open(self.config_file_path, encoding="utf-8") as f:
                    self.config_data = json.load(f)
                logger.info(f"Loaded tool configuration from {self.config_file_path}")
            else:
                # Create default configuration
                self._create_default_config()
                self._save_config()
                logger.info(f"Created default tool configuration at {self.config_file_path}")
        except Exception as e:
            logger.error(f"Failed to load tool configuration: {e}")
            self._create_default_config()

    def _create_default_config(self) -> None:
        """Create default tool configuration."""
        self.config_data = {
            "version": "1.0.0",
            "last_updated": datetime.now().isoformat(),
            "tools": {}
        }

    def _save_config(self) -> None:
        """Save tool configuration to file."""
        try:
            self.config_data["last_updated"] = datetime.now().isoformat()
            with open(self.config_file_path, "w", encoding="utf-8") as f:
                json.dump(self.config_data, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved tool configuration to {self.config_file_path}")
        except Exception as e:
            logger.error(f"Failed to save tool configuration: {e}")
            raise

    def sync_tool_with_services(self, tool_metadata):
        """Sync a single tool with all configuration services."""
        # Sync with ToolConfigService
        self._sync_with_config_service(tool_metadata)

        # Update configuration file
        self._update_configuration_file()

    def _sync_with_config_service(self, tool_metadata):
        """Sync tool with ToolConfigService."""
        tool_config = {
            "name": tool_metadata.name,
            "category": tool_metadata.category,
            "enabled": tool_metadata.enabled,
            "description": tool_metadata.description,
            "dependencies": tool_metadata.dependencies,
            "config": tool_metadata.config,
        }

        # Update or create tool config
        self.update_tool_config(tool_metadata.name, tool_config)

    def _update_configuration_file(self):
        """Update the configuration file with current state."""
        self._save_config()

    def auto_sync_all_tools(self):
        """Auto-sync all tools from the registry."""
        if self.tool_registry:
            for tool_metadata in self.tool_registry.list_all_tools().values():
                self.sync_tool_with_services(tool_metadata)

    def get_all_tools(self) -> Dict[str, Any]:
        """Get all tool configurations."""
        return self.config_data.get("tools", {})

    def get_tool_config(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """Get configuration for a specific tool."""
        return self.config_data.get("tools", {}).get(tool_name)

    def is_tool_enabled(self, tool_name: str) -> bool:
        """Check if a tool is enabled."""
        tool_config = self.get_tool_config(tool_name)
        return tool_config.get("enabled", False) if tool_config else False

    def enable_tool(self, tool_name: str) -> bool:
        """Enable a tool."""
        if tool_name not in self.config_data.get("tools", {}):
            return False

        self.config_data["tools"][tool_name]["enabled"] = True
        self._save_config()
        logger.info(f"Enabled tool: {tool_name}")
        return True

    def disable_tool(self, tool_name: str) -> bool:
        """Disable a tool."""
        if tool_name not in self.config_data.get("tools", {}):
            return False

        self.config_data["tools"][tool_name]["enabled"] = False
        self._save_config()
        logger.info(f"Disabled tool: {tool_name}")
        return True

    def toggle_tool(self, tool_name: str) -> bool:
        """Toggle a tool's enabled state."""
        if tool_name not in self.config_data.get("tools", {}):
            return False

        current_state = self.config_data["tools"][tool_name]["enabled"]
        self.config_data["tools"][tool_name]["enabled"] = not current_state
        self._save_config()
        logger.info(f"Toggled tool {tool_name} to {'enabled' if not current_state else 'disabled'}")
        return True

    def update_tool_config(self, tool_name: str, config: Dict[str, Any]) -> bool:
        """Update a tool's configuration."""
        if "tools" not in self.config_data:
            self.config_data["tools"] = {}

        # Create or update tool config
        self.config_data["tools"][tool_name] = config
        self._save_config()
        logger.info(f"Updated configuration for tool: {tool_name}")
        return True

    def get_tools_by_category(self, category: str) -> Dict[str, Any]:
        """Get all tools in a specific category."""
        tools = self.config_data.get("tools", {})
        return {
            name: config
            for name, config in tools.items()
            if config.get("category") == category
        }

    def get_tool_stats(self) -> Dict[str, Any]:
        """Get statistics about tool configurations."""
        tools = self.config_data.get("tools", {})
        total_tools = len(tools)
        enabled_tools = sum(1 for tool in tools.values() if tool.get("enabled", False))
        disabled_tools = total_tools - enabled_tools

        # Count by category
        categories = {}
        for tool in tools.values():
            category = tool.get("category", "unknown")
            categories[category] = categories.get(category, 0) + 1

        return {
            "total_tools": total_tools,
            "enabled_tools": enabled_tools,
            "disabled_tools": disabled_tools,
            "categories": categories,
            "last_updated": self.config_data.get("last_updated"),
        }

    def reload_config(self) -> None:
        """Reload configuration from file."""
        self._load_config()
        logger.info("Reloaded tool configuration from file")
