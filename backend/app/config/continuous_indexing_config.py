"""Continuous Indexing Configuration

Configuration management for the continuous indexing system.
"""

import os
from pathlib import Path
from typing import Any


class ContinuousIndexingConfig:
    """Configuration for continuous indexing system."""

    def __init__(self):
        # Core settings
        self.enabled = self._get_bool_env("RAG_CONTINUOUS_INDEXING_ENABLED", True)
        self.watch_root = self._get_env(
            "RAG_CONTINUOUS_INDEXING_WATCH_ROOT", "/home/kade/runeset/reynard",
        )
        self.auto_start = self._get_bool_env("RAG_CONTINUOUS_INDEXING_AUTO_START", True)

        # Performance settings
        self.debounce_seconds = self._get_float_env(
            "RAG_CONTINUOUS_INDEXING_DEBOUNCE_SECONDS", 2.0,
        )
        self.batch_size = self._get_int_env("RAG_CONTINUOUS_INDEXING_BATCH_SIZE", 25)
        self.max_queue_size = self._get_int_env(
            "RAG_CONTINUOUS_INDEXING_MAX_QUEUE_SIZE", 1000,
        )
        self.stats_interval_minutes = self._get_int_env(
            "RAG_CONTINUOUS_INDEXING_STATS_INTERVAL_MINUTES", 5,
        )

        # File filtering
        self.include_patterns = self._get_list_env(
            "RAG_CONTINUOUS_INDEXING_INCLUDE_PATTERNS",
            [
                "*.py",
                "*.ts",
                "*.tsx",
                "*.js",
                "*.jsx",
                "*.vue",
                "*.svelte",
                "*.md",
                "*.txt",
                "*.json",
                "*.yaml",
                "*.yml",
                "*.toml",
                "*.css",
                "*.scss",
                "*.sass",
                "*.less",
                "*.html",
                "*.xml",
            ],
        )

        self.exclude_dirs = self._get_set_env(
            "RAG_CONTINUOUS_INDEXING_EXCLUDE_DIRS",
            {
                "node_modules",
                "__pycache__",
                ".git",
                ".vscode",
                ".idea",
                "dist",
                "build",
                "target",
                "coverage",
                ".nyc_output",
                "venv",
                "env",
                ".env",
                "logs",
                "tmp",
                "temp",
                ".pytest_cache",
                ".mypy_cache",
                ".tox",
                "htmlcov",
                "reynard_backend.egg-info",
                "alembic/versions",
                ".cursor",
                "third_party",
            },
        )

        self.exclude_files = self._get_set_env(
            "RAG_CONTINUOUS_INDEXING_EXCLUDE_FILES",
            {
                "*.pyc",
                "*.pyo",
                "*.pyd",
                "*.so",
                "*.dll",
                "*.exe",
                "*.log",
                "*.tmp",
                "*.temp",
                "*.cache",
                "*.lock",
                "package-lock.json",
                "yarn.lock",
                "pnpm-lock.yaml",
                "*.min.js",
                "*.min.css",
                "*.bundle.js",
                "*.tsbuildinfo",
            },
        )

        # File size limits
        self.max_file_size_mb = self._get_int_env(
            "RAG_CONTINUOUS_INDEXING_MAX_FILE_SIZE_MB", 2,
        )
        self.max_file_size_bytes = self.max_file_size_mb * 1024 * 1024

    def _get_env(self, key: str, default: str) -> str:
        """Get environment variable with default."""
        return os.getenv(key, default)

    def _get_bool_env(self, key: str, default: bool) -> bool:
        """Get boolean environment variable."""
        value = os.getenv(key, str(default)).lower()
        return value in ("true", "1", "yes", "on")

    def _get_int_env(self, key: str, default: int) -> int:
        """Get integer environment variable."""
        try:
            return int(os.getenv(key, str(default)))
        except ValueError:
            return default

    def _get_float_env(self, key: str, default: float) -> float:
        """Get float environment variable."""
        try:
            return float(os.getenv(key, str(default)))
        except ValueError:
            return default

    def _get_list_env(self, key: str, default: list[str]) -> list[str]:
        """Get list environment variable (comma-separated)."""
        value = os.getenv(key)
        if value:
            return [item.strip() for item in value.split(",") if item.strip()]
        return default

    def _get_set_env(self, key: str, default: set[str]) -> set[str]:
        """Get set environment variable (comma-separated)."""
        value = os.getenv(key)
        if value:
            return {item.strip() for item in value.split(",") if item.strip()}
        return default

    def should_watch_file(self, file_path: Path) -> bool:
        """Check if a file should be watched for changes."""
        # Check if any parent directory should be excluded
        for part in file_path.parts:
            if part in self.exclude_dirs:
                return False

        # Check file patterns
        for pattern in self.exclude_files:
            if file_path.match(pattern):
                return False

        # Check include patterns
        for pattern in self.include_patterns:
            if file_path.match(pattern):
                return True

        return False

    def should_include_file(self, file_path: Path) -> bool:
        """Check if a file should be included in indexing."""
        if not self.should_watch_file(file_path):
            return False

        # Check if file exists
        if not file_path.exists():
            return False

        # Check file size
        try:
            if file_path.stat().st_size > self.max_file_size_bytes:
                return False
        except OSError:
            return False

        return True

    def get_watch_root_path(self) -> Path:
        """Get the watch root as a Path object."""
        return Path(self.watch_root)

    def to_dict(self) -> dict[str, Any]:
        """Convert configuration to dictionary."""
        return {
            "enabled": self.enabled,
            "watch_root": self.watch_root,
            "auto_start": self.auto_start,
            "debounce_seconds": self.debounce_seconds,
            "batch_size": self.batch_size,
            "max_queue_size": self.max_queue_size,
            "stats_interval_minutes": self.stats_interval_minutes,
            "include_patterns": list(self.include_patterns),
            "exclude_dirs": list(self.exclude_dirs),
            "exclude_files": list(self.exclude_files),
            "max_file_size_mb": self.max_file_size_mb,
        }

    def validate(self) -> list[str]:
        """Validate configuration and return any errors."""
        errors = []

        # Check watch root exists
        watch_path = self.get_watch_root_path()
        if not watch_path.exists():
            errors.append(f"Watch root does not exist: {watch_path}")
        elif not watch_path.is_dir():
            errors.append(f"Watch root is not a directory: {watch_path}")

        # Check batch size
        if self.batch_size <= 0:
            errors.append("Batch size must be positive")

        # Check debounce time
        if self.debounce_seconds < 0:
            errors.append("Debounce seconds must be non-negative")

        # Check max queue size
        if self.max_queue_size <= 0:
            errors.append("Max queue size must be positive")

        # Check stats interval
        if self.stats_interval_minutes <= 0:
            errors.append("Stats interval must be positive")

        return errors


# Global configuration instance
continuous_indexing_config = ContinuousIndexingConfig()
