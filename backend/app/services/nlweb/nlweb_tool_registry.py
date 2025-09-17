"""
NLWeb Tool Registry for Reynard Backend

Manages registration, discovery, and routing of NLWeb tools.
"""

import logging
import time
from collections import defaultdict

from .models import NLWebTool

logger = logging.getLogger(__name__)


class NLWebToolRegistry:
    """Registry for managing NLWeb tools."""

    def __init__(self):
        self._tools: dict[str, NLWebTool] = {}
        self._tools_by_category: dict[str, list[NLWebTool]] = defaultdict(list)
        self._tools_by_tag: dict[str, list[NLWebTool]] = defaultdict(list)
        self._enabled_tools: set[str] = set()
        self._tool_usage_stats: dict[str, dict[str, any]] = defaultdict(
            lambda: {
                "usage_count": 0,
                "last_used": None,
                "success_count": 0,
                "failure_count": 0,
                "avg_execution_time": 0.0,
            }
        )

    def register_tool(self, tool: NLWebTool) -> bool:
        """Register a new tool in the registry."""
        try:
            # Validate tool
            if not self._validate_tool(tool):
                return False

            # Remove from category/tag mappings if already exists
            if tool.name in self._tools:
                self._unregister_tool_mappings(tool.name)

            # Register the tool
            self._tools[tool.name] = tool
            self._tools_by_category[tool.category].append(tool)

            for tag in tool.tags:
                self._tools_by_tag[tag].append(tool)

            if tool.enabled:
                self._enabled_tools.add(tool.name)

            logger.info(
                f"Registered NLWeb tool: {tool.name} in category {tool.category}"
            )
            return True

        except Exception as e:
            logger.error(f"Failed to register tool {tool.name}: {e}")
            return False

    def unregister_tool(self, tool_name: str) -> bool:
        """Unregister a tool from the registry."""
        try:
            if tool_name not in self._tools:
                logger.warning(f"Tool {tool_name} not found in registry")
                return False

            tool = self._tools[tool_name]
            self._unregister_tool_mappings(tool_name)

            del self._tools[tool_name]
            self._enabled_tools.discard(tool_name)

            logger.info(f"Unregistered NLWeb tool: {tool_name}")
            return True

        except Exception as e:
            logger.error(f"Failed to unregister tool {tool_name}: {e}")
            return False

    def get_tool(self, tool_name: str) -> NLWebTool | None:
        """Get a tool by name."""
        return self._tools.get(tool_name)

    def get_tools_by_category(self, category: str) -> list[NLWebTool]:
        """Get all tools in a category."""
        return self._tools_by_category.get(category, []).copy()

    def get_tools_by_tag(self, tag: str) -> list[NLWebTool]:
        """Get all tools with a specific tag."""
        return self._tools_by_tag.get(tag, []).copy()

    def get_enabled_tools(self) -> list[NLWebTool]:
        """Get all enabled tools."""
        return [tool for tool in self._tools.values() if tool.enabled]

    def get_all_tools(self) -> list[NLWebTool]:
        """Get all registered tools."""
        return list(self._tools.values())

    def search_tools(
        self,
        query: str,
        category: str | None = None,
        tags: list[str] | None = None,
    ) -> list[NLWebTool]:
        """Search for tools based on query, category, and tags."""
        results = []
        query_lower = query.lower()

        # Start with all tools or filter by category
        if category:
            candidates = self.get_tools_by_category(category)
        else:
            candidates = self.get_all_tools()

        # Filter by tags if specified
        if tags:
            candidates = [
                tool for tool in candidates if any(tag in tool.tags for tag in tags)
            ]

        # Search by name, description, and examples
        for tool in candidates:
            score = 0

            # Name match (highest priority)
            if query_lower in tool.name.lower():
                score += 100

            # Description match
            if query_lower in tool.description.lower():
                score += 50

            # Example match
            for example in tool.examples:
                if query_lower in example.lower():
                    score += 25

            # Tag match
            for tag in tool.tags:
                if query_lower in tag.lower():
                    score += 10

            if score > 0:
                results.append((tool, score))

        # Sort by score (descending) and return tools
        results.sort(key=lambda x: x[1], reverse=True)
        return [tool for tool, score in results]

    def enable_tool(self, tool_name: str) -> bool:
        """Enable a tool."""
        if tool_name not in self._tools:
            return False

        self._tools[tool_name].enabled = True
        self._enabled_tools.add(tool_name)
        logger.info(f"Enabled NLWeb tool: {tool_name}")
        return True

    def disable_tool(self, tool_name: str) -> bool:
        """Disable a tool."""
        if tool_name not in self._tools:
            return False

        self._tools[tool_name].enabled = False
        self._enabled_tools.discard(tool_name)
        logger.info(f"Disabled NLWeb tool: {tool_name}")
        return True

    def update_tool_usage(self, tool_name: str, success: bool, execution_time: float):
        """Update tool usage statistics."""
        if tool_name not in self._tool_usage_stats:
            self._tool_usage_stats[tool_name] = {
                "usage_count": 0,
                "last_used": None,
                "success_count": 0,
                "failure_count": 0,
                "avg_execution_time": 0.0,
            }

        stats = self._tool_usage_stats[tool_name]
        stats["usage_count"] += 1
        stats["last_used"] = time.time()

        if success:
            stats["success_count"] += 1
        else:
            stats["failure_count"] += 1

        # Update average execution time
        total_time = (
            stats["avg_execution_time"] * (stats["usage_count"] - 1) + execution_time
        )
        stats["avg_execution_time"] = total_time / stats["usage_count"]

    def get_tool_stats(self, tool_name: str) -> dict[str, any] | None:
        """Get usage statistics for a tool."""
        return self._tool_usage_stats.get(tool_name)

    def get_all_tool_stats(self) -> dict[str, dict[str, any]]:
        """Get usage statistics for all tools."""
        return dict(self._tool_usage_stats)

    def get_categories(self) -> list[str]:
        """Get all tool categories."""
        return list(self._tools_by_category.keys())

    def get_tags(self) -> list[str]:
        """Get all tool tags."""
        return list(self._tools_by_tag.keys())

    def get_registry_stats(self) -> dict[str, any]:
        """Get registry statistics."""
        total_tools = len(self._tools)
        enabled_tools = len(self._enabled_tools)
        categories = len(self._tools_by_category)
        tags = len(self._tools_by_tag)

        return {
            "total_tools": total_tools,
            "enabled_tools": enabled_tools,
            "disabled_tools": total_tools - enabled_tools,
            "categories": categories,
            "tags": tags,
            "most_used_tools": self._get_most_used_tools(5),
        }

    def _validate_tool(self, tool: NLWebTool) -> bool:
        """Validate a tool before registration."""
        if not tool.name or not tool.name.strip():
            logger.error("Tool name cannot be empty")
            return False

        if not tool.description or not tool.description.strip():
            logger.error("Tool description cannot be empty")
            return False

        if not tool.category or not tool.category.strip():
            logger.error("Tool category cannot be empty")
            return False

        if not tool.path or not tool.path.strip():
            logger.error("Tool path cannot be empty")
            return False

        if tool.method not in ["GET", "POST", "PUT", "DELETE"]:
            logger.error(f"Invalid HTTP method: {tool.method}")
            return False

        if tool.priority < 0 or tool.priority > 100:
            logger.error(
                f"Tool priority must be between 0 and 100, got: {tool.priority}"
            )
            return False

        if tool.timeout <= 0:
            logger.error(f"Tool timeout must be positive, got: {tool.timeout}")
            return False

        return True

    def _unregister_tool_mappings(self, tool_name: str):
        """Remove tool from category and tag mappings."""
        if tool_name not in self._tools:
            return

        tool = self._tools[tool_name]

        # Remove from category mapping
        if tool.category in self._tools_by_category:
            self._tools_by_category[tool.category] = [
                t for t in self._tools_by_category[tool.category] if t.name != tool_name
            ]
            if not self._tools_by_category[tool.category]:
                del self._tools_by_category[tool.category]

        # Remove from tag mappings
        for tag in tool.tags:
            if tag in self._tools_by_tag:
                self._tools_by_tag[tag] = [
                    t for t in self._tools_by_tag[tag] if t.name != tool_name
                ]
                if not self._tools_by_tag[tag]:
                    del self._tools_by_tag[tag]

    def _get_most_used_tools(self, limit: int = 5) -> list[dict[str, any]]:
        """Get the most used tools."""
        sorted_tools = sorted(
            self._tool_usage_stats.items(),
            key=lambda x: x[1]["usage_count"],
            reverse=True,
        )

        return [
            {
                "tool_name": tool_name,
                "usage_count": stats["usage_count"],
                "success_rate": stats["success_count"]
                / max(stats["usage_count"], 1)
                * 100,
                "avg_execution_time": stats["avg_execution_time"],
            }
            for tool_name, stats in sorted_tools[:limit]
        ]
