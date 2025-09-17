#!/usr/bin/env python3
"""
File Discovery Service
======================

Service for discovering and filtering files for analysis.
Handles directory traversal, file type filtering, and exclusion patterns.

🦊 Strategic fox approach: We navigate the file system with the cunning
of a fox stalking prey - finding exactly what we need while avoiding traps!
"""

import fnmatch
import os


class FileDiscoveryService:
    """Service for discovering and filtering files for analysis."""

    def __init__(self) -> None:
        """Initialize the file discovery service."""
        self.skip_dirs = self._get_skip_directories()
        self.skip_files = self._get_skip_files()

    def discover_files(
        self, directories: list[str], file_types: list[str]
    ) -> list[str]:
        """Discover all files from directories matching file types."""
        all_files = []
        for directory in directories:
            if os.path.exists(directory):
                all_files.extend(self._get_files_recursive(directory, file_types))
        return all_files

    def _get_files_recursive(self, directory: str, file_types: list[str]) -> list[str]:
        """Get all files recursively matching the given extensions."""
        files: list[str] = []

        # Resolve relative paths from current working directory
        directory = self._resolve_directory_path(directory)

        if not os.path.exists(directory):
            return files

        for root, dirs, filenames in os.walk(directory):
            # Skip directories based on patterns
            dirs[:] = [d for d in dirs if not self._should_skip_directory(d)]

            for filename in filenames:
                if any(filename.endswith(ext) for ext in file_types):
                    file_path = os.path.join(root, filename)
                    # Skip generated files and patterns
                    if not self._should_skip_file(file_path):
                        files.append(file_path)
        return files

    def _resolve_directory_path(self, directory: str) -> str:
        """Resolve directory path with fallback strategies."""
        if os.path.isabs(directory) or os.path.exists(directory):
            return directory

        # Try different path resolution strategies
        possible_paths = [
            directory,  # As-is
            os.path.join("../../", directory),  # From scripts/mcp
            os.path.join("../", directory),  # From scripts/
        ]

        for path in possible_paths:
            if os.path.exists(path):
                return path

        return directory

    def _should_skip_directory(self, dirname: str) -> bool:
        """Check if directory should be skipped."""
        # Direct match
        if dirname in self.skip_dirs:
            return True

        # Pattern matching for wildcards
        for pattern in self.skip_dirs:
            if "*" in pattern:
                if fnmatch.fnmatch(dirname, pattern):
                    return True

        return False

    def _should_skip_file(self, file_path: str) -> bool:
        """Check if file should be skipped."""
        filename = os.path.basename(file_path)

        # Direct match
        if filename in self.skip_files:
            return True

        # Pattern matching for wildcards
        for pattern in self.skip_files:
            if "*" in pattern:
                if fnmatch.fnmatch(filename, pattern):
                    return True

        # Check if it's a generated file
        if self._is_generated_file(file_path):
            return True

        return False

    def _is_generated_file(self, file_path: str) -> bool:
        """Check if file is likely generated."""
        generated_patterns = [
            "dist/",
            "build/",
            "generated/",
            ".d.ts",
            "index.d.ts",
            "types.d.ts",
            "api.ts",
        ]

        file_path_lower = file_path.lower()
        return any(pattern in file_path_lower for pattern in generated_patterns)

    def _get_skip_directories(self) -> set[str]:
        """Get set of directories to skip during file discovery."""
        return {
            # Git and version control
            ".git",
            ".svn",
            ".hg",
            # Dependencies
            "node_modules",
            "bower_components",
            # Python
            "__pycache__",
            ".venv",
            "venv",
            ".pytest_cache",
            ".mypy_cache",
            ".ruff_cache",
            "*.egg-info",
            # Build outputs
            "dist",
            "build",
            "lib",
            "out",
            ".next",
            ".nuxt",
            ".storybook-out",
            # Coverage and testing
            "coverage",
            "htmlcov",
            ".vitest-reports",
            "playwright-report",
            "e2e-results",
            "penetration-results",
            # Cache and temporary
            ".cache",
            ".parcel-cache",
            ".rpt2_cache",
            ".rts2_cache_cjs",
            ".rts2_cache_es",
            ".rts2_cache_umd",
            "tmp",
            "temp",
            # IDE and OS
            ".idea",
            ".vscode",
            ".DS_Store",
            # Logs and runtime
            "logs",
            "pids",
            # Third party and generated
            "third_party",
            "generated",
            "unsloth_compiled_cache",
            # Specific to this project
            "*-report",
            "*-results",
            "*.backup",
            "*.bak",
        }

    def _get_skip_files(self) -> set[str]:
        """Get set of files to skip during file discovery."""
        return {
            # Build artifacts
            "*.tsbuildinfo",
            "*.d.ts",
            "*.d.ts.map",
            "vite-env.d.ts",
            # Logs and reports
            "*.log",
            "*.pid",
            "*.seed",
            "*.pid.lock",
            "coverage.xml",
            "*.lcov",
            "*.tgz",
            ".yarn-integrity",
            # Environment and config
            ".env*",
            "*.backup",
            "*.bak",
            # Project specific
            "agent-names.json",
            ".agent-name",
            ".jwt_secret",
            "coverage.json",
            "i18n-report.md",
            "i18n-results.json",
            "*-report.md",
            "*-report.json",
        }
