"""🦊 Simple Intelligent Service Reload System for Reynard Backend

This module provides a simplified version of the intelligent service reload system
that focuses on the core functionality without complex service registry integration.
"""

import logging
import os
from pathlib import Path

from fastapi import FastAPI

logger = logging.getLogger(__name__)


class ServiceReloadManager:
    """Service reload manager that provides intelligent service-specific reloading.

    This version focuses on file change detection and service mapping with
    comprehensive test file exclusions.
    """

    def __init__(self, app: FastAPI):
        """Initialize the service reload manager.

        Args:
            app: The FastAPI application instance

        """
        self.app = app
        self.service_file_mappings = self._build_service_file_mappings()

    def _build_service_file_mappings(self) -> dict[str, list[str]]:
        """Build mappings of file patterns to services.

        Returns:
            Dictionary mapping service names to file patterns they should watch

        """
        return {
            "ecs_world": [
                "app/ecs/**/*.py",
                "app/ecs/**/*.json",
                "app/ecs/**/*.yaml",
                "app/ecs/**/*.yml",
            ],
            "gatekeeper": [
                "gatekeeper/**/*.py",
                "app/auth/**/*.py",
                "app/security/**/*.py",
            ],
            "comfy": [
                "app/api/comfy/**/*.py",
                "app/services/comfy/**/*.py",
            ],
            "nlweb": [
                "app/api/nlweb/**/*.py",
                "app/services/nlweb/**/*.py",
            ],
            "rag": [
                "app/api/rag/**/*.py",
                "app/services/rag/**/*.py",
                "app/services/initial_indexing.py",
                "app/services/continuous_indexing.py",
            ],
            "search": [
                "app/api/search/**/*.py",
                "app/services/search/**/*.py",
            ],
            "ollama": [
                "app/api/ollama/**/*.py",
                "app/services/ollama/**/*.py",
            ],
            "tts": [
                "app/api/tts/**/*.py",
                "app/services/tts/**/*.py",
            ],
            "image_processing": [
                "app/api/image_utils/**/*.py",
                "app/services/image_processing_service.py",
            ],
            "ai_email_response": [
                "app/services/ai_email_response_service.py",
                "app/api/agent_email_routes.py",
            ],
        }

    def should_reload_service(self, file_path: str, service_name: str) -> bool:
        """Check if a file change should trigger a service reload.

        Args:
            file_path: The path of the changed file
            service_name: The name of the service to check

        Returns:
            True if the service should be reloaded

        """
        if service_name not in self.service_file_mappings:
            return False

        patterns = self.service_file_mappings[service_name]
        file_path_obj = Path(file_path)

        for pattern in patterns:
            # Convert glob pattern to path matching
            if pattern.endswith("**/*.py"):
                base_path = pattern.replace("/**/*.py", "")
                if str(file_path_obj).startswith(base_path) and file_path.endswith(
                    ".py",
                ):
                    return True
            elif pattern.endswith("**/*.json"):
                base_path = pattern.replace("/**/*.json", "")
                if str(file_path_obj).startswith(base_path) and file_path.endswith(
                    ".json",
                ):
                    return True
            elif pattern.endswith("**/*.yaml") or pattern.endswith("**/*.yml"):
                base_path = pattern.replace("/**/*.yaml", "").replace("/**/*.yml", "")
                if str(file_path_obj).startswith(base_path) and (
                    file_path.endswith(".yaml") or file_path.endswith(".yml")
                ):
                    return True
            elif file_path == pattern:
                return True

        return False

    def get_affected_services(self, file_path: str) -> list[str]:
        """Get list of services that should be reloaded for a file change.

        Args:
            file_path: The path of the changed file

        Returns:
            List of service names that should be reloaded

        """
        affected_services = []

        for service_name in self.service_file_mappings:
            if self.should_reload_service(file_path, service_name):
                affected_services.append(service_name)

        return affected_services

    def log_reload_attempt(self, service_name: str) -> None:
        """Log a reload attempt for a service.

        Args:
            service_name: The name of the service to reload

        """
        logger.info(f"🔄 Would reload service: {service_name}")


# Global reload manager instance
_reload_manager: ServiceReloadManager | None = None


def get_reload_manager(app: FastAPI) -> ServiceReloadManager:
    """Get the global service reload manager instance.

    Args:
        app: The FastAPI application instance

    Returns:
        The ServiceReloadManager instance

    """
    global _reload_manager
    if _reload_manager is None:
        _reload_manager = ServiceReloadManager(app)
    return _reload_manager


def should_use_intelligent_reload() -> bool:
    """Check if intelligent reload should be used.

    Returns:
        True if intelligent reload is enabled

    """
    return os.getenv("INTELLIGENT_RELOAD", "true").lower() == "true"


def get_reload_excludes() -> list[str]:
    """Get the list of file patterns to exclude from reload.

    Returns:
        List of file patterns to exclude

    """
    if should_use_intelligent_reload():
        # With intelligent reload, we don't exclude service files
        # Instead, we handle them intelligently
        return [
            "*.db",
            "*.log",
            "generated/*",
            "__pycache__/**/*",
            "__pycache__/*",
            "**/__pycache__/**/*",
            "**/__pycache__/*",
            ".mypy_cache/**/*",
            ".mypy_cache/*",
            "**/.mypy_cache/**/*",
            "**/.mypy_cache/*",
            "**/.mypy_cache/**/*.json",
            "**/.mypy_cache/**/*.data.json",
            "**/.mypy_cache/**/*.meta.json",
            "*.pyc",
            "*.pyo",
            "*.pyd",
            ".pytest_cache/**/*",
            ".pytest_cache/*",
            "**/.pytest_cache/**/*",
            "**/.pytest_cache/*",
            ".coverage",
            "htmlcov/*",
            ".tox/*",
            "venv/*",
            "env/*",
            ".venv/*",
            "node_modules/*",
            ".git/*",
            "*.tmp",
            "*.temp",
            "*.swp",
            "*.swo",
            "*~",
            ".DS_Store",
            "Thumbs.db",
            "@plugins_snapshot.json",
            # Exclude test files and directories
            "tests/**/*",
            "test/**/*",
            "**/tests/**/*",
            "**/test/**/*",
            "**/__tests__/**/*",
            "**/test_*.py",
            "**/*_test.py",
            "**/conftest.py",
            # Exclude scripts directory
            "scripts/**/*",
        ]
    # Without intelligent reload, exclude all service files
    return [
        "*.db",
        "*.log",
        "generated/*",
        "__pycache__/**/*",
        "__pycache__/*",
        "**/__pycache__/**/*",
        "**/__pycache__/*",
        ".mypy_cache/**/*",
        ".mypy_cache/*",
        "**/.mypy_cache/**/*",
        "**/.mypy_cache/*",
        "**/.mypy_cache/**/*.json",
        "**/.mypy_cache/**/*.data.json",
        "**/.mypy_cache/**/*.meta.json",
        "*.pyc",
        "*.pyo",
        "*.pyd",
        ".pytest_cache/**/*",
        ".pytest_cache/*",
        "**/.pytest_cache/**/*",
        "**/.pytest_cache/*",
        ".coverage",
        "htmlcov/*",
        ".tox/*",
        "venv/*",
        "env/*",
        ".venv/*",
        "node_modules/*",
        ".git/*",
        "*.tmp",
        "*.temp",
        "*.swp",
        "*.swo",
        "*~",
        ".DS_Store",
        "Thumbs.db",
        "@plugins_snapshot.json",
        "app/ecs/**/*.py",  # Exclude ECS changes from main backend reload
        # Exclude test files and directories
        "tests/**/*",
        "test/**/*",
        "**/tests/**/*",
        "**/test/**/*",
        "**/__tests__/**/*",
        "**/test_*.py",
        "**/*_test.py",
        "**/conftest.py",
        # Exclude scripts directory
        "scripts/**/*",
    ]
