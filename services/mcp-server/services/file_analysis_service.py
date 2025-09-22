#!/usr/bin/env python3
"""
File Analysis Service
=====================

Service for analyzing file metrics and code structure.
Provides reusable functionality for monolith detection and code quality analysis.

🦦 Otter approach: We dive deep into file analysis with the same thoroughness
an otter explores a stream - every metric is a treasure to discover!
"""

import os
from pathlib import Path
from typing import Any


class FileAnalysisService:
    """Service for file analysis operations."""

    def __init__(self) -> None:
        """Initialize the file analysis service."""
        self.supported_extensions = {
            ".py",
            ".ts",
            ".tsx",
            ".js",
            ".jsx",
            ".java",
            ".cpp",
            ".c",
            ".h",
            ".cs",
            ".php",
            ".rb",
            ".go",
            ".rs",
            ".swift",
            ".kt",
            ".scala",
        }

    def is_supported_file(self, file_path: str) -> bool:
        """Check if file type is supported for analysis."""
        ext = Path(file_path).suffix.lower()
        return ext in self.supported_extensions

    def get_file_size(self, file_path: str) -> int:
        """Get file size in bytes."""
        try:
            return os.path.getsize(file_path)
        except OSError:
            return 0

    def get_file_extension(self, file_path: str) -> str:
        """Get file extension."""
        return Path(file_path).suffix.lower()

    def is_likely_config_file(self, file_path: str) -> bool:
        """Check if file is likely a configuration file."""
        config_patterns = [
            "config",
            "conf",
            "settings",
            "setup",
            "package.json",
            "requirements.txt",
            "pyproject.toml",
            "tsconfig.json",
            "webpack.config",
            "vite.config",
            "rollup.config",
        ]

        filename = Path(file_path).name.lower()
        return any(pattern in filename for pattern in config_patterns)

    def is_likely_test_file(self, file_path: str) -> bool:
        """Check if file is likely a test file."""
        test_patterns = [
            "test_",
            "_test",
            ".test.",
            ".spec.",
            "__tests__",
            "tests/",
            "test/",
            "spec/",
        ]

        file_path_lower = file_path.lower()
        return any(pattern in file_path_lower for pattern in test_patterns)

    def should_skip_file(self, file_path: str) -> bool:
        """Determine if file should be skipped in analysis."""
        # Skip config files
        if self.is_likely_config_file(file_path):
            return True

        # Skip very large files (>1MB) as they're likely generated
        if self.get_file_size(file_path) > 1024 * 1024:
            return True

        # Skip binary files
        try:
            with open(file_path, "rb") as f:
                chunk = f.read(1024)
                if b"\x00" in chunk:
                    return True
        except (OSError, UnicodeDecodeError):
            return True

        return False

    def get_directory_stats(self, directory: str) -> dict[str, int]:
        """Get statistics for a directory."""
        stats = {
            "total_files": 0,
            "supported_files": 0,
            "total_size": 0,
            "config_files": 0,
            "test_files": 0,
        }

        try:
            for root, dirs, files in os.walk(directory):
                # Skip common directories
                dirs[:] = [
                    d
                    for d in dirs
                    if d
                    not in {
                        ".git",
                        "node_modules",
                        "__pycache__",
                        ".venv",
                        "venv",
                        "dist",
                        "build",
                        ".next",
                        ".nuxt",
                        "coverage",
                    }
                ]

                for file in files:
                    file_path = os.path.join(root, file)
                    stats["total_files"] += 1
                    stats["total_size"] += self.get_file_size(file_path)

                    if self.is_supported_file(file_path):
                        stats["supported_files"] += 1

                    if self.is_likely_config_file(file_path):
                        stats["config_files"] += 1

                    if self.is_likely_test_file(file_path):
                        stats["test_files"] += 1

        except OSError:
            pass

        return stats

    async def analyze_file_complexity(
        self, file_path: str, include_ast_analysis: bool = True
    ) -> dict[str, Any]:
        """
        Analyze file complexity metrics.

        This method provides backward compatibility for any code that might
        be calling file_analysis.analyze_file_complexity() directly.

        Args:
            file_path: Path to the file to analyze
            include_ast_analysis: Whether to include AST analysis

        Returns:
            Dictionary containing file complexity metrics
        """
        # Import here to avoid circular imports
        from services.monolith_analysis_service import MonolithAnalysisService

        # Create a monolith analysis service instance
        monolith_analysis = MonolithAnalysisService()

        # Delegate to the monolith analysis service for consistency
        return await monolith_analysis.analyze_file_metrics(
            file_path=file_path,
            exclude_comments=True,
            include_ast=include_ast_analysis
        )
