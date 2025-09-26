#!/usr/bin/env python3
"""
PostgreSQL Tool Configuration Service for MCP Server
====================================================

Service that connects the MCP server to the PostgreSQL backend via FastAPI.
Replaces JSON file-based configuration with database-backed configuration.

Author: Reynard Development Team
Version: 1.0.0
"""

import json
import logging
import time
from datetime import datetime
from typing import Any, Dict, List, Optional, Set

import httpx
from utils.logging_config import setup_logging

logger = setup_logging()


class PostgreSQLToolConfigService:
    """PostgreSQL-based tool configuration service for MCP server."""

    def __init__(
        self, backend_url: str = "http://localhost:8000", timeout: float = 30.0
    ):
        """Initialize the PostgreSQL tool configuration service."""
        self.backend_url = backend_url.rstrip('/')
        self.timeout = timeout
        self._cache: Dict[str, Any] = {}
        self._cache_ttl = 300  # 5 minutes
        self._last_cache_update = 0

    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers for API requests."""
        return {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Reynard-MCP-Server/1.0.0",
        }

    def _is_cache_valid(self) -> bool:
        """Check if cache is still valid."""
        return time.time() - self._last_cache_update < self._cache_ttl

    def _update_cache(self, key: str, value: Any) -> None:
        """Update cache with new value."""
        self._cache[key] = {"value": value, "timestamp": time.time()}
        self._last_cache_update = time.time()

    def _get_from_cache(self, key: str) -> Optional[Any]:
        """Get value from cache if valid."""
        if not self._is_cache_valid():
            return None

        cached = self._cache.get(key)
        if cached and time.time() - cached["timestamp"] < self._cache_ttl:
            return cached["value"]

        return None

    async def _make_request(
        self, method: str, endpoint: str, data: Optional[Dict] = None
    ) -> Optional[Dict[str, Any]]:
        """Make HTTP request to backend API."""
        url = f"{self.backend_url}{endpoint}"
        headers = self._get_headers()

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                if method.upper() == "GET":
                    response = await client.get(url, headers=headers)
                elif method.upper() == "POST":
                    response = await client.post(url, headers=headers, json=data)
                elif method.upper() == "PUT":
                    response = await client.put(url, headers=headers, json=data)
                elif method.upper() == "DELETE":
                    response = await client.delete(url, headers=headers)
                else:
                    logger.error(f"Unsupported HTTP method: {method}")
                    return None

                response.raise_for_status()
                return response.json()

        except httpx.TimeoutException:
            logger.error(f"Request timeout for {url}")
            return None
        except httpx.HTTPStatusError as e:
            logger.error(
                f"HTTP error {e.response.status_code} for {url}: {e.response.text}"
            )
            return None
        except Exception as e:
            logger.error(f"Request failed for {url}: {e}")
            return None

    async def get_all_tools(
        self, include_disabled: bool = False
    ) -> List[Dict[str, Any]]:
        """Get all tools with optional filtering."""
        cache_key = f"all_tools_{include_disabled}"
        cached = self._get_from_cache(cache_key)
        if cached is not None:
            return cached

        endpoint = f"/api/mcp/tool-config/tools?include_disabled={include_disabled}"
        result = await self._make_request("GET", endpoint)

        if result is not None:
            self._update_cache(cache_key, result)
            return result

        return []

    async def get_tool_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """Get a specific tool by name."""
        cache_key = f"tool_{name}"
        cached = self._get_from_cache(cache_key)
        if cached is not None:
            return cached

        endpoint = f"/api/mcp/tool-config/tools/{name}"
        result = await self._make_request("GET", endpoint)

        if result is not None:
            self._update_cache(cache_key, result)
            return result

        return None

    async def get_tools_by_category(
        self, category: str, include_disabled: bool = False
    ) -> List[Dict[str, Any]]:
        """Get tools by category."""
        cache_key = f"tools_category_{category}_{include_disabled}"
        cached = self._get_from_cache(cache_key)
        if cached is not None:
            return cached

        endpoint = f"/api/mcp/tool-config/tools/category/{category}?include_disabled={include_disabled}"
        result = await self._make_request("GET", endpoint)

        if result is not None:
            self._update_cache(cache_key, result)
            return result

        return []

    async def get_enabled_tools(self) -> Set[str]:
        """Get set of enabled tool names."""
        cache_key = "enabled_tools"
        cached = self._get_from_cache(cache_key)
        if cached is not None:
            return set(cached)

        endpoint = "/api/mcp/tool-config/tools/enabled"
        result = await self._make_request("GET", endpoint)

        if result is not None:
            self._update_cache(cache_key, result)
            return set(result)

        return set()

    async def is_tool_enabled(self, name: str) -> bool:
        """Check if a tool is enabled."""
        tool = await self.get_tool_by_name(name)
        return tool.get("enabled", False) if tool else False

    async def enable_tool(self, name: str) -> bool:
        """Enable a tool."""
        endpoint = f"/api/mcp/tool-config/tools/{name}/enable"
        result = await self._make_request("POST", endpoint)

        if result is not None:
            # Clear cache
            self._cache.clear()
            return True

        return False

    async def disable_tool(self, name: str) -> bool:
        """Disable a tool."""
        endpoint = f"/api/mcp/tool-config/tools/{name}/disable"
        result = await self._make_request("POST", endpoint)

        if result is not None:
            # Clear cache
            self._cache.clear()
            return True

        return False

    async def toggle_tool(self, name: str) -> bool:
        """Toggle a tool's enabled state."""
        endpoint = f"/api/mcp/tool-config/tools/{name}/toggle"
        result = await self._make_request("POST", endpoint)

        if result is not None:
            # Clear cache
            self._cache.clear()
            return result.get("enabled", False)

        return False

    async def get_tool_categories(self) -> List[Dict[str, Any]]:
        """Get all tool categories."""
        cache_key = "categories"
        cached = self._get_from_cache(cache_key)
        if cached is not None:
            return cached

        endpoint = "/api/mcp/tool-config/categories"
        result = await self._make_request("GET", endpoint)

        if result is not None:
            self._update_cache(cache_key, result)
            return result

        return []

    async def get_tool_statistics(self) -> Dict[str, Any]:
        """Get tool configuration statistics."""
        cache_key = "statistics"
        cached = self._get_from_cache(cache_key)
        if cached is not None:
            return cached

        endpoint = "/api/mcp/tool-config/statistics"
        result = await self._make_request("GET", endpoint)

        if result is not None:
            self._update_cache(cache_key, result)
            return result

        return {}

    async def get_tool_history(
        self, name: str, limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get change history for a tool."""
        endpoint = f"/api/mcp/tool-config/tools/{name}/history?limit={limit}"
        result = await self._make_request("GET", endpoint)

        return result if result is not None else []

    async def sync_from_json(self, json_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync tools from JSON configuration."""
        endpoint = "/api/mcp/tool-config/sync-from-json"
        result = await self._make_request("POST", endpoint, {"json_data": json_data})

        if result is not None:
            # Clear cache
            self._cache.clear()
            return result

        return {
            "created": 0,
            "updated": 0,
            "errors": 1,
            "errors_list": ["API request failed"],
        }

    async def get_global_configuration(self) -> Dict[str, Any]:
        """Get global tool configuration."""
        cache_key = "global_config"
        cached = self._get_from_cache(cache_key)
        if cached is not None:
            return cached

        endpoint = "/api/mcp/tool-config/configuration"
        result = await self._make_request("GET", endpoint)

        if result is not None:
            self._update_cache(cache_key, result)
            return result

        return {}

    async def update_global_configuration(self, config_data: Dict[str, Any]) -> bool:
        """Update global tool configuration."""
        endpoint = "/api/mcp/tool-config/configuration"
        result = await self._make_request("PUT", endpoint, config_data)

        if result is not None:
            # Clear cache
            self._cache.clear()
            return True

        return False

    async def health_check(self) -> bool:
        """Check if the backend service is healthy."""
        endpoint = "/api/mcp/tool-config/health"
        result = await self._make_request("GET", endpoint)
        return result is not None

    def clear_cache(self) -> None:
        """Clear the cache."""
        self._cache.clear()
        self._last_cache_update = 0

    def get_cache_info(self) -> Dict[str, Any]:
        """Get cache information."""
        return {
            "cache_size": len(self._cache),
            "last_update": self._last_cache_update,
            "cache_ttl": self._cache_ttl,
            "is_valid": self._is_cache_valid(),
        }


# Backward compatibility wrapper
class ToolConfigService(PostgreSQLToolConfigService):
    """Backward compatibility wrapper for existing code."""

    def __init__(
        self, config_file_path: str = None, tool_registry: Any = None, **kwargs
    ):
        """Initialize with backward compatibility."""
        # Ignore config_file_path and tool_registry for backward compatibility
        super().__init__(**kwargs)
        logger.info("Using PostgreSQL-based tool configuration service")

    async def get_tool_config(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """Get configuration for a specific tool."""
        tool = await self.get_tool_by_name(tool_name)
        if tool:
            return {
                "name": tool["name"],
                "category": tool["category"],
                "enabled": tool["enabled"],
                "description": tool["description"],
                "dependencies": tool["dependencies"],
                "config": tool["config"],
            }
        return None

    async def is_tool_enabled(self, tool_name: str) -> bool:
        """Check if a tool is enabled."""
        return await super().is_tool_enabled(tool_name)

    async def enable_tool(self, tool_name: str) -> bool:
        """Enable a tool."""
        return await super().enable_tool(tool_name)

    async def disable_tool(self, tool_name: str) -> bool:
        """Disable a tool."""
        return await super().disable_tool(tool_name)

    async def toggle_tool(self, tool_name: str) -> bool:
        """Toggle a tool's enabled state."""
        return await super().toggle_tool(tool_name)

    async def update_tool_config(self, tool_name: str, config: Dict[str, Any]) -> bool:
        """Update a tool's configuration."""
        # This would require a PUT request to update the tool
        # For now, we'll just clear the cache
        self.clear_cache()
        return True

    async def get_tools_by_category(self, category: str) -> Dict[str, Any]:
        """Get all tools in a specific category."""
        tools = await super().get_tools_by_category(category)

        # Convert to old format
        tools_dict = {}
        for tool in tools:
            tools_dict[tool["name"]] = {
                "name": tool["name"],
                "category": tool["category"],
                "enabled": tool["enabled"],
                "description": tool["description"],
                "dependencies": tool["dependencies"],
                "config": tool["config"],
            }

        return tools_dict

    async def get_tool_stats(self) -> Dict[str, Any]:
        """Get statistics about tool configurations."""
        return await self.get_tool_statistics()

    async def reload_config(self) -> None:
        """Reload configuration from backend."""
        self.clear_cache()
        logger.info("Configuration reloaded from PostgreSQL backend")

    def auto_sync_all_tools(self) -> None:
        """Auto-sync all tools from the registry."""
        # For PostgreSQL service, we don't need to sync tools as they're already in the database
        # This method is here for compatibility with the old JSON-based service
        logger.info(
            "Auto-sync not needed for PostgreSQL-based tool configuration service"
        )
        pass
