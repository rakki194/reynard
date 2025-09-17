"""
NLWeb Router for Reynard Backend

Intelligent tool suggestion and routing system that analyzes natural language queries
and suggests appropriate tools with parameters.
"""

import json
import logging
import re
import time
from collections import OrderedDict
from typing import Any

from .models import (
    NLWebContext,
    NLWebPerformanceStats,
    NLWebSuggestion,
    NLWebSuggestionRequest,
    NLWebSuggestionResponse,
    NLWebTool,
    NLWebToolParameter,
)
from .nlweb_tool_registry import NLWebToolRegistry

logger = logging.getLogger(__name__)


class NLWebRouter:
    """Intelligent router for NLWeb tool suggestions."""

    def __init__(self, tool_registry: NLWebToolRegistry):
        self.tool_registry = tool_registry
        self.cache: OrderedDict[str, tuple[NLWebSuggestionResponse, float]] = (
            OrderedDict()
        )
        self.cache_max_size = 1000
        self.cache_ttl = 10.0  # seconds

        # Performance tracking
        self.performance_stats = NLWebPerformanceStats()
        self.latency_samples: OrderedDict[str, list[float]] = OrderedDict()
        self.max_latency_samples = 100

        # Query patterns for better matching
        self.query_patterns = {
            "git": [
                r"\b(git|version control|repository|commit|branch|status|diff|log)\b",
                r"\b(check|show|list|display).*(git|repo|repository)\b",
            ],
            "file": [
                r"\b(file|files|directory|folder|path|list|show|display|read|open)\b",
                r"\b(what|which|where).*(file|files)\b",
            ],
            "caption": [
                r"\b(caption|describe|describe|generate|create).*(image|picture|photo)\b",
                r"\b(image|picture|photo).*(caption|description|describe)\b",
            ],
            "search": [
                r"\b(search|find|look|query|lookup)\b",
                r"\b(what|where|how|when|why)\b",
            ],
        }

        # Tool priority weights
        self.priority_weights = {
            "git": 1.2,
            "file": 1.1,
            "caption": 1.0,
            "search": 0.9,
            "default": 1.0,
        }

    async def suggest_tools(
        self, request: NLWebSuggestionRequest
    ) -> NLWebSuggestionResponse:
        """Suggest tools based on natural language query."""
        start_time = time.time()

        try:
            # Check cache first
            cache_key = self._generate_cache_key(request)
            if cache_key in self.cache:
                cached_response, timestamp = self.cache[cache_key]
                if time.time() - timestamp < self.cache_ttl:
                    self.performance_stats.cache_hits += 1
                    cached_response.cache_hit = True
                    return cached_response
                # Remove expired cache entry
                del self.cache[cache_key]

            self.performance_stats.cache_misses += 1

            # Get candidate tools
            candidate_tools = self._get_candidate_tools(request)

            # Score and rank tools
            scored_tools = await self._score_tools(request, candidate_tools)

            # Filter by minimum score
            filtered_tools = [
                (tool, score)
                for tool, score in scored_tools
                if score >= (request.min_score or 0.0)
            ]

            # Sort by score (descending) and take top suggestions
            filtered_tools.sort(key=lambda x: x[1], reverse=True)
            top_tools = filtered_tools[: request.max_suggestions or 5]

            # Create suggestions
            suggestions = []
            for tool, score in top_tools:
                suggestion = NLWebSuggestion(
                    tool=tool,
                    score=score,
                    parameters=self._extract_parameters(request, tool),
                    reasoning=self._generate_reasoning(request, tool, score),
                    parameter_hints=self._generate_parameter_hints(request, tool),
                )
                suggestions.append(suggestion)

            # Create response
            processing_time = (time.time() - start_time) * 1000
            response = NLWebSuggestionResponse(
                suggestions=suggestions,
                query=request.query,
                processing_time_ms=processing_time,
                cache_hit=False,
                total_tools_considered=len(candidate_tools),
            )

            # Cache the response
            self._cache_response(cache_key, response)

            # Update performance stats
            self._update_performance_stats(processing_time)

            return response

        except Exception as e:
            logger.error(f"Error in tool suggestion: {e}")
            # Return empty response on error
            return NLWebSuggestionResponse(
                suggestions=[],
                query=request.query,
                processing_time_ms=(time.time() - start_time) * 1000,
                cache_hit=False,
                total_tools_considered=0,
            )

    def _get_candidate_tools(self, request: NLWebSuggestionRequest) -> list[NLWebTool]:
        """Get candidate tools based on query and context."""
        # Start with all enabled tools
        candidates = self.tool_registry.get_enabled_tools()

        # Filter by context if provided
        if request.context:
            candidates = self._filter_by_context(candidates, request.context)

        # Filter by query patterns
        query_lower = request.query.lower()
        pattern_matches = self._match_query_patterns(query_lower)

        if pattern_matches:
            # Boost tools that match patterns
            scored_candidates = []
            for tool in candidates:
                score = 0
                for pattern_type in pattern_matches:
                    if pattern_type in tool.category.lower() or any(
                        pattern_type in tag.lower() for tag in tool.tags
                    ):
                        score += 1
                scored_candidates.append((tool, score))

            # Sort by pattern match score and take top candidates
            scored_candidates.sort(key=lambda x: x[1], reverse=True)
            candidates = [
                tool
                for tool, score in scored_candidates
                if score > 0 or len(candidates) < 10
            ]

        return candidates

    def _filter_by_context(
        self, tools: list[NLWebTool], context: NLWebContext
    ) -> list[NLWebTool]:
        """Filter tools based on context."""
        filtered = []

        for tool in tools:
            # Check if tool is relevant to current context
            if self._is_tool_relevant_to_context(tool, context):
                filtered.append(tool)

        return filtered

    def _is_tool_relevant_to_context(
        self, tool: NLWebTool, context: NLWebContext
    ) -> bool:
        """Check if a tool is relevant to the given context."""
        # Git-related tools for git repositories
        if context.git_status and context.git_status.get("isRepository", False):
            if "git" in tool.category.lower() or "git" in tool.tags:
                return True

        # File-related tools for file operations
        if context.selected_items or context.current_path:
            if "file" in tool.category.lower() or "file" in tool.tags:
                return True

        # Default: include all tools
        return True

    def _match_query_patterns(self, query: str) -> list[str]:
        """Match query against known patterns."""
        matches = []

        for pattern_type, patterns in self.query_patterns.items():
            for pattern in patterns:
                if re.search(pattern, query, re.IGNORECASE):
                    matches.append(pattern_type)
                    break

        return matches

    async def _score_tools(
        self, request: NLWebSuggestionRequest, tools: list[NLWebTool]
    ) -> list[tuple[NLWebTool, float]]:
        """Score tools based on query relevance."""
        scored_tools = []
        query_lower = request.query.lower()

        for tool in tools:
            score = 0.0

            # Base score from tool priority
            score += tool.priority * 0.1

            # Name matching (highest weight)
            if query_lower in tool.name.lower():
                score += 50.0

            # Description matching
            if query_lower in tool.description.lower():
                score += 30.0

            # Example matching
            for example in tool.examples:
                if query_lower in example.lower():
                    score += 20.0

            # Tag matching
            for tag in tool.tags:
                if query_lower in tag.lower():
                    score += 10.0

            # Category matching
            if query_lower in tool.category.lower():
                score += 15.0

            # Pattern-based scoring
            pattern_matches = self._match_query_patterns(query_lower)
            for pattern_type in pattern_matches:
                if pattern_type in tool.category.lower() or any(
                    pattern_type in tag.lower() for tag in tool.tags
                ):
                    weight = self.priority_weights.get(
                        pattern_type, self.priority_weights["default"]
                    )
                    score += 25.0 * weight

            # Context-based scoring
            if request.context:
                score += self._score_by_context(tool, request.context)

            # Normalize score to 0-100 range
            score = min(100.0, max(0.0, score))

            scored_tools.append((tool, score))

        return scored_tools

    def _score_by_context(self, tool: NLWebTool, context: NLWebContext) -> float:
        """Score tool based on context relevance."""
        score = 0.0

        # Git context scoring
        if context.git_status and context.git_status.get("isRepository", False):
            if "git" in tool.category.lower() or "git" in tool.tags:
                score += 15.0

        # File context scoring
        if context.selected_items:
            if "file" in tool.category.lower() or "file" in tool.tags:
                score += 10.0

        # Path context scoring
        if context.current_path:
            if "file" in tool.category.lower() or "directory" in tool.category.lower():
                score += 5.0

        return score

    def _extract_parameters(
        self, request: NLWebSuggestionRequest, tool: NLWebTool
    ) -> dict[str, Any]:
        """Extract parameters from query for the tool."""
        parameters = {}
        query_lower = request.query.lower()

        # Simple parameter extraction based on common patterns
        for param in tool.parameters:
            if param.name.lower() in query_lower:
                # Try to extract value from query
                value = self._extract_parameter_value(query_lower, param)
                if value is not None:
                    parameters[param.name] = value
                elif param.default is not None:
                    parameters[param.name] = param.default

        return parameters

    def _extract_parameter_value(
        self, query: str, param: NLWebToolParameter
    ) -> Any | None:
        """Extract parameter value from query."""
        param_name = param.name.lower()

        # Look for patterns like "param_name: value" or "param_name=value"
        patterns = [
            rf"{param_name}[:=]\s*([^\s]+)",
            rf"{param_name}\s+([^\s]+)",
        ]

        for pattern in patterns:
            match = re.search(pattern, query)
            if match:
                value = match.group(1)
                return self._convert_parameter_value(value, param.type)

        return None

    def _convert_parameter_value(self, value: str, param_type: str) -> Any:
        """Convert string value to appropriate type."""
        try:
            if param_type == "number":
                return float(value) if "." in value else int(value)
            if param_type == "boolean":
                return value.lower() in ["true", "yes", "1", "on"]
            if param_type == "array":
                return value.split(",")
            if param_type == "object":
                return json.loads(value)
            # string
            return value
        except (ValueError, json.JSONDecodeError):
            return value

    def _generate_reasoning(
        self, request: NLWebSuggestionRequest, tool: NLWebTool, score: float
    ) -> str:
        """Generate reasoning for tool suggestion."""
        reasons = []

        query_lower = request.query.lower()

        if query_lower in tool.name.lower():
            reasons.append(f"Tool name '{tool.name}' matches query")

        if query_lower in tool.description.lower():
            reasons.append("Tool description matches query")

        if any(query_lower in example.lower() for example in tool.examples):
            reasons.append("Tool examples match query")

        if any(query_lower in tag.lower() for tag in tool.tags):
            matching_tags = [tag for tag in tool.tags if query_lower in tag.lower()]
            reasons.append(f"Tool tags match: {', '.join(matching_tags)}")

        if query_lower in tool.category.lower():
            reasons.append(f"Tool category '{tool.category}' matches query")

        if request.context:
            if request.context.git_status and request.context.git_status.get(
                "isRepository", False
            ):
                if "git" in tool.category.lower() or "git" in tool.tags:
                    reasons.append("Tool is relevant for git repository context")

            if request.context.selected_items:
                if "file" in tool.category.lower() or "file" in tool.tags:
                    reasons.append("Tool is relevant for file operations")

        if not reasons:
            reasons.append(
                f"Tool has high priority ({tool.priority}) and general relevance"
            )

        return "; ".join(reasons)

    def _generate_parameter_hints(
        self, request: NLWebSuggestionRequest, tool: NLWebTool
    ) -> dict[str, Any]:
        """Generate parameter hints for better tool execution."""
        hints = {}

        for param in tool.parameters:
            if param.name not in hints:
                hints[param.name] = {
                    "description": param.description,
                    "required": param.required,
                    "type": param.type,
                    "suggested_value": self._suggest_parameter_value(request, param),
                }

        return hints

    def _suggest_parameter_value(
        self, request: NLWebSuggestionRequest, param: NLWebToolParameter
    ) -> Any | None:
        """Suggest a parameter value based on context."""
        if request.context:
            # Suggest current path for path parameters
            if "path" in param.name.lower() and request.context.current_path:
                return request.context.current_path

            # Suggest selected items for file parameters
            if "file" in param.name.lower() and request.context.selected_items:
                return (
                    request.context.selected_items[0]
                    if request.context.selected_items
                    else None
                )

            # Suggest git branch for branch parameters
            if "branch" in param.name.lower() and request.context.git_status:
                return request.context.git_status.get("branch")

        return param.default

    def _generate_cache_key(self, request: NLWebSuggestionRequest) -> str:
        """Generate cache key for request."""
        key_parts = [request.query]

        if request.context:
            if request.context.current_path:
                key_parts.append(f"path:{request.context.current_path}")
            if request.context.selected_items:
                key_parts.append(f"items:{','.join(request.context.selected_items)}")
            if request.context.git_status and request.context.git_status.get(
                "isRepository"
            ):
                key_parts.append("git:true")

        key_parts.append(f"max:{request.max_suggestions or 5}")
        key_parts.append(f"min:{request.min_score or 0.0}")

        return "|".join(key_parts)

    def _cache_response(self, cache_key: str, response: NLWebSuggestionResponse):
        """Cache the response."""
        # Remove oldest entries if cache is full
        while len(self.cache) >= self.cache_max_size:
            self.cache.popitem(last=False)

        self.cache[cache_key] = (response, time.time())

    def _update_performance_stats(self, processing_time_ms: float):
        """Update performance statistics."""
        self.performance_stats.total_requests += 1
        self.performance_stats.successful_requests += 1

        # Update latency samples
        current_time = time.time()
        if current_time not in self.latency_samples:
            self.latency_samples[current_time] = []

        self.latency_samples[current_time].append(processing_time_ms)

        # Keep only recent samples
        cutoff_time = current_time - 300  # 5 minutes
        self.latency_samples = {
            timestamp: samples
            for timestamp, samples in self.latency_samples.items()
            if timestamp > cutoff_time
        }

        # Calculate statistics
        all_latencies = []
        for samples in self.latency_samples.values():
            all_latencies.extend(samples)

        if all_latencies:
            all_latencies.sort()
            self.performance_stats.avg_processing_time_ms = sum(all_latencies) / len(
                all_latencies
            )
            self.performance_stats.p95_processing_time_ms = all_latencies[
                int(len(all_latencies) * 0.95)
            ]
            self.performance_stats.p99_processing_time_ms = all_latencies[
                int(len(all_latencies) * 0.99)
            ]

        # Update cache statistics
        total_cache_requests = (
            self.performance_stats.cache_hits + self.performance_stats.cache_misses
        )
        if total_cache_requests > 0:
            self.performance_stats.cache_hit_rate = (
                self.performance_stats.cache_hits / total_cache_requests
            ) * 100

        self.performance_stats.cache_size = len(self.cache)

    def get_performance_stats(self) -> NLWebPerformanceStats:
        """Get current performance statistics."""
        return self.performance_stats

    def clear_cache(self):
        """Clear the suggestion cache."""
        self.cache.clear()
        logger.info("NLWeb router cache cleared")

    def get_cache_stats(self) -> dict[str, Any]:
        """Get cache statistics."""
        return {
            "cache_size": len(self.cache),
            "cache_max_size": self.cache_max_size,
            "cache_ttl": self.cache_ttl,
            "cache_hit_rate": self.performance_stats.cache_hit_rate,
            "cache_hits": self.performance_stats.cache_hits,
            "cache_misses": self.performance_stats.cache_misses,
        }
