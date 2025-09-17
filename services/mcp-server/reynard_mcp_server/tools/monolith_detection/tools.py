#!/usr/bin/env python3
"""
Monolith Detection Tools
========================

🦦 Quality specialist otter approach: We've organized the monolith detection
tools into a clean, modular structure that's as smooth as an otter's fur!

Refactored monolith detection tools following modular architecture principles.
Uses service-oriented design with clear separation of concerns.
"""

from typing import Any

from services.file_analysis_service import FileAnalysisService
from services.file_discovery_service import FileDiscoveryService
from services.metrics_aggregation_service import MetricsAggregationService
from services.monolith_analysis_service import MonolithAnalysisService


class MonolithDetectionTools:
    """Refactored monolith detection tools with modular architecture."""

    def __init__(self) -> None:
        """Initialize monolith detection tools with service dependencies."""
        self.file_analysis = FileAnalysisService()
        self.file_discovery = FileDiscoveryService()
        self.metrics_aggregation = MetricsAggregationService()
        self.monolith_analysis = MonolithAnalysisService()

        self.tools = self._get_tool_definitions()

    def _get_tool_definitions(self) -> list[dict[str, Any]]:
        """Get list of available monolith detection tools."""
        return [
            {
                "name": "detect_monoliths",
                "description": "Detect large monolithic files based on precise code modularity rules",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "max_lines": {
                            "type": "integer",
                            "description": "Maximum lines of code threshold (default: 140)",
                            "default": 140,
                        },
                        "exclude_comments": {
                            "type": "boolean",
                            "description": "Exclude comments and docstrings from line count",
                            "default": True,
                        },
                        "file_types": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "File extensions to analyze (default: ['.py', '.ts', '.tsx', '.js', '.jsx'])",
                            "default": [".py", ".ts", ".tsx", ".js", ".jsx"],
                        },
                        "directories": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Directories to scan (default: ['../../'] for entire project)",
                            "default": ["../../"],
                        },
                        "top_n": {
                            "type": "integer",
                            "description": "Number of largest files to return (default: 20)",
                            "default": 20,
                        },
                        "include_metrics": {
                            "type": "boolean",
                            "description": "Include detailed code metrics (complexity, functions, classes)",
                            "default": True,
                        },
                    },
                },
            },
            {
                "name": "analyze_file_complexity",
                "description": "Analyze complexity metrics for a specific file",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "file_path": {
                            "type": "string",
                            "description": "Path to the file to analyze",
                        },
                        "include_ast_analysis": {
                            "type": "boolean",
                            "description": "Include detailed AST analysis",
                            "default": True,
                        },
                    },
                    "required": ["file_path"],
                },
            },
            {
                "name": "get_code_metrics_summary",
                "description": "Get summary of code metrics across the codebase",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "directories": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Directories to analyze",
                            "default": ["packages/", "examples/", "backend/"],
                        },
                        "file_types": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "File extensions to include",
                            "default": [".py", ".ts", ".tsx", ".js", ".jsx"],
                        },
                    },
                },
            },
        ]

    def get_tools(self) -> list[dict[str, Any]]:
        """Get list of available monolith detection tools."""
        return self.tools

    def call_tool(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """
        Call a monolith detection tool.

        Args:
            name: Tool name
            arguments: Tool arguments

        Returns:
            Tool result
        """
        if name == "detect_monoliths":
            return self._detect_monoliths(arguments)
        if name == "analyze_file_complexity":
            return self._analyze_file_complexity(arguments)
        if name == "get_code_metrics_summary":
            return self._get_code_metrics_summary(arguments)
        raise ValueError(f"Unknown tool: {name}")

    def _detect_monoliths(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Detect large monolithic files."""
        max_lines = arguments.get("max_lines", 140)
        exclude_comments = arguments.get("exclude_comments", True)
        file_types = arguments.get("file_types", [".py", ".ts", ".tsx", ".js", ".jsx"])
        directories = arguments.get("directories", ["../../"])
        top_n = arguments.get("top_n", 20)
        include_metrics = arguments.get("include_metrics", True)

        try:
            # Discover files to analyze
            files_to_analyze = self.file_discovery.discover_files(
                directories, file_types
            )

            # Analyze each file
            file_metrics = []
            for file_path in files_to_analyze:
                try:
                    metrics = self.monolith_analysis.analyze_file_metrics(
                        file_path, exclude_comments, include_metrics
                    )
                    if metrics["lines_of_code"] > 0:
                        file_metrics.append(metrics)
                except Exception:
                    # Skip files that can't be analyzed
                    continue

            # Sort by lines of code and get top N
            top_files = self.metrics_aggregation.sort_by_size(file_metrics, top_n)

            # Filter by threshold
            monoliths = self.metrics_aggregation.filter_monoliths(
                file_metrics, max_lines
            )

            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"🦊 Monolith Detection Results:\n\n"
                        f"📊 Analyzed {len(file_metrics)} files\n"
                        f"🎯 Found {len(monoliths)} files exceeding {max_lines} lines\n"
                        f"📈 Top {top_n} largest files:\n\n"
                        + self.metrics_aggregation.format_file_metrics(
                            top_files, include_metrics
                        )
                        + (
                            f"\n🚨 Monoliths (> {max_lines} lines):\n"
                            + self.metrics_aggregation.format_file_metrics(
                                monoliths, include_metrics
                            )
                            if monoliths
                            else ""
                        ),
                    }
                ]
            }

        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error detecting monoliths: {e!s}",
                    }
                ]
            }

    def _analyze_file_complexity(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Analyze complexity metrics for a specific file."""
        file_path = arguments["file_path"]
        include_ast_analysis = arguments.get("include_ast_analysis", True)

        try:
            import os

            if not os.path.exists(file_path):
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"❌ File not found: {file_path}",
                        }
                    ]
                }

            metrics = self.monolith_analysis.analyze_file_metrics(file_path, True, True)

            result_text = f"🦊 File Analysis: {file_path}\n\n"
            result_text += f"📏 Lines of Code: {metrics['lines_of_code']}\n"
            result_text += f"📝 Total Lines: {metrics['total_lines']}\n"
            result_text += f"💬 Comments/Docstrings: {metrics['total_lines'] - metrics['lines_of_code']}\n"

            if include_ast_analysis and metrics.get("ast_metrics"):
                ast_metrics = metrics["ast_metrics"]
                result_text += "\n🏗️ AST Analysis:\n"
                result_text += f"  • Functions: {ast_metrics.get('functions', 0)}\n"
                result_text += f"  • Classes: {ast_metrics.get('classes', 0)}\n"
                result_text += f"  • Imports: {ast_metrics.get('imports', 0)}\n"
                result_text += (
                    f"  • Complexity Score: {ast_metrics.get('complexity', 0)}\n"
                )

            return {
                "content": [
                    {
                        "type": "text",
                        "text": result_text,
                    }
                ]
            }

        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error analyzing file: {e!s}",
                    }
                ]
            }

    def _get_code_metrics_summary(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get summary of code metrics across the codebase."""
        directories = arguments.get("directories", ["../../"])
        file_types = arguments.get("file_types", [".py", ".ts", ".tsx", ".js", ".jsx"])

        try:
            # Get all files
            all_files = self.file_discovery.discover_files(directories, file_types)

            # Analyze all files
            metrics_data = self.metrics_aggregation.analyze_all_files(
                all_files, self.monolith_analysis
            )

            result_text = self.metrics_aggregation.format_metrics_summary(metrics_data)

            return {
                "content": [
                    {
                        "type": "text",
                        "text": result_text,
                    }
                ]
            }

        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Error generating summary: {e!s}",
                    }
                ]
            }
