#!/usr/bin/env python3
"""
Monolith Detection Tools
========================

🦦 Quality specialist otter approach: We've organized the monolith detection
tools into a clean, modular structure that's as smooth as an otter's fur!

Now uses the new @register_tool decorator system for automatic registration.
Refactored monolith detection tools following modular architecture principles.
"""

import sys
from pathlib import Path
from typing import Any

# Add MCP directory to path for absolute imports
mcp_dir = Path(__file__).parent.parent.parent
if str(mcp_dir) not in sys.path:
    sys.path.insert(0, str(mcp_dir))

from protocol.tool_registry import register_tool
from services.file_analysis_service import FileAnalysisService
from services.file_discovery_service import FileDiscoveryService
from services.metrics_aggregation_service import MetricsAggregationService
from services.monolith_analysis_service import MonolithAnalysisService

# Initialize services
file_analysis = FileAnalysisService()
file_discovery = FileDiscoveryService()
metrics_aggregation = MetricsAggregationService()
monolith_analysis = MonolithAnalysisService()


@register_tool(
    name="detect_monoliths",
    category="analysis",
    description="🦊 Detect large monolithic files that violate the 140-line axiom. Perfect for finding code that needs refactoring into smaller, more maintainable modules. Use this to identify files that are too complex and should be broken down.",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def detect_monoliths(**kwargs) -> dict[str, Any]:
    """Detect large monolithic files based on precise code modularity rules."""
    arguments = kwargs.get("arguments", {})
    max_lines = arguments.get("max_lines", 140)
    exclude_comments = arguments.get("exclude_comments", True)
    file_types = arguments.get("file_types", [".py", ".ts", ".tsx", ".js", ".jsx"])
    directories = arguments.get("directories", ["packages/", "examples/", "backend/"])
    top_n = arguments.get("top_n", 20)
    include_metrics = arguments.get("include_metrics", True)

    try:
        result = monolith_analysis.detect_monoliths(
            max_lines=max_lines,
            exclude_comments=exclude_comments,
            file_types=file_types,
            directories=directories,
            top_n=top_n,
            include_metrics=include_metrics,
        )

        return {
            "content": [
                {"type": "text", "text": f"🦊 Monolith Detection Results:\n\n{result}"}
            ]
        }
    except Exception as e:
        return {
            "content": [
                {"type": "text", "text": f"❌ Error detecting monoliths: {e!s}"}
            ]
        }


@register_tool(
    name="analyze_file_complexity",
    category="analysis",
    description="🔍 Deep-dive analysis of a specific file's complexity metrics. Perfect for understanding why a file is considered a monolith and what specific refactoring opportunities exist.",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def analyze_file_complexity(**kwargs) -> dict[str, Any]:
    """Deep-dive analysis of a specific file's complexity metrics."""
    arguments = kwargs.get("arguments", {})
    file_path = arguments.get("file_path")
    include_ast_analysis = arguments.get("include_ast_analysis", True)

    if not file_path:
        return {"content": [{"type": "text", "text": "❌ File path is required"}]}

    try:
        result = file_analysis.analyze_file_complexity(
            file_path=file_path, include_ast_analysis=include_ast_analysis
        )

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"🔍 File Complexity Analysis for {file_path}:\n\n{result}",
                }
            ]
        }
    except Exception as e:
        return {
            "content": [
                {"type": "text", "text": f"❌ Error analyzing file complexity: {e!s}"}
            ]
        }
