#!/usr/bin/env python3
"""
Metrics Aggregation Service
============================

Service for aggregating and analyzing code metrics across multiple files.
Provides summary statistics and language breakdowns.

🦦 Otter approach: We gather metrics with the same thoroughness an otter
collects river stones - every statistic tells a story!
"""

from pathlib import Path
from typing import Any, Dict, List


class MetricsAggregationService:
    """Service for aggregating code metrics across files."""

    def __init__(self) -> None:
        """Initialize the metrics aggregation service."""

    def analyze_all_files(
        self, all_files: list[str], analysis_service: Any
    ) -> dict[str, Any]:
        """Analyze all files and return aggregated metrics data."""
        total_files = len(all_files)
        total_lines = 0
        total_loc = 0
        language_stats = {}
        large_files = 0

        for file_path in all_files:
            try:
                metrics = analysis_service.analyze_file_metrics(file_path, True, False)
                total_lines += metrics["total_lines"]
                total_loc += metrics["lines_of_code"]

                if metrics["lines_of_code"] > 140:
                    large_files += 1

                # Language stats
                ext = Path(file_path).suffix
                if ext not in language_stats:
                    language_stats[ext] = {"files": 0, "lines": 0, "loc": 0}
                language_stats[ext]["files"] += 1
                language_stats[ext]["lines"] += metrics["total_lines"]
                language_stats[ext]["loc"] += metrics["lines_of_code"]

            except Exception:
                continue

        return {
            "total_files": total_files,
            "total_lines": total_lines,
            "total_loc": total_loc,
            "large_files": large_files,
            "language_stats": language_stats,
        }

    def format_metrics_summary(self, metrics_data: dict[str, Any]) -> str:
        """Format the metrics summary into a readable string."""
        result_text = "🦊 Codebase Metrics Summary\n\n"
        result_text += "📊 Overall Statistics:\n"
        result_text += f"  • Total Files: {metrics_data['total_files']}\n"
        result_text += f"  • Total Lines: {metrics_data['total_lines']:,}\n"
        result_text += f"  • Lines of Code: {metrics_data['total_loc']:,}\n"

        if metrics_data["total_lines"] > 0:
            comment_ratio = (
                (metrics_data["total_lines"] - metrics_data["total_loc"])
                / metrics_data["total_lines"]
                * 100
            )
            result_text += f"  • Comment Ratio: {comment_ratio:.1f}%\n"

        result_text += f"  • Large Files (>140 LOC): {metrics_data['large_files']}\n\n"

        result_text += "🗣️ By Language:\n"
        for ext, stats in sorted(metrics_data["language_stats"].items()):
            result_text += f"  • {ext}: {stats['files']} files, {stats['loc']:,} LOC\n"

        return result_text

    def format_file_metrics(
        self, files: list[dict[str, Any]], include_metrics: bool
    ) -> str:
        """Format file metrics for display."""
        if not files:
            return "No files found."

        result = ""
        for i, file_metrics in enumerate(files, 1):
            result += f"{i:2d}. {file_metrics['file_path']}\n"
            result += f"    📏 {file_metrics['lines_of_code']} LOC"
            if include_metrics and file_metrics.get("ast_metrics"):
                ast_metrics = file_metrics["ast_metrics"]
                result += f" | 🏗️ {ast_metrics.get('functions', 0)}F/{ast_metrics.get('classes', 0)}C"
                result += f" | ⚡ {ast_metrics.get('complexity', 0)} complexity"
            result += "\n"

        return result

    def filter_monoliths(
        self, file_metrics: list[dict[str, Any]], max_lines: int
    ) -> list[dict[str, Any]]:
        """Filter files that exceed the monolith threshold."""
        return [f for f in file_metrics if f["lines_of_code"] > max_lines]

    def sort_by_size(
        self, file_metrics: list[dict[str, Any]], top_n: int
    ) -> list[dict[str, Any]]:
        """Sort files by lines of code and return top N."""
        file_metrics.sort(key=lambda x: x["lines_of_code"], reverse=True)
        return file_metrics[:top_n]
