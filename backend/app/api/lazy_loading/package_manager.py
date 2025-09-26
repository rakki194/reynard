"""Package Manager for Lazy Loading

This module handles the core package management operations
including creation, loading, and unloading of lazy exports.
"""

import logging
import time
from typing import Any

from app.lazy_loading import (
    ExportValidationLevel,
    create_lazy_export,
    get_lazy_export,
)

logger = logging.getLogger("uvicorn")


class PackageManager:
    """Manages lazy loading package operations."""

    def create_lazy_export(
        self,
        package_name: str,
        validation_level: str,
    ) -> dict[str, Any]:
        """Create a new lazy export for a package."""
        try:
            # Convert validation level string to enum
            validation_level_enum = ExportValidationLevel(validation_level)

            # Create the lazy export
            lazy_export = create_lazy_export(
                package_name,
                validation_level=validation_level_enum,
            )

            # Get metadata
            metadata = lazy_export.get_metadata()

            return {
                "package_name": package_name,
                "is_loaded": lazy_export._module is not None,
                "metadata": {
                    "export_type": metadata.export_type.value,
                    "validation_level": metadata.validation_level.value,
                    "load_time": metadata.load_time,
                    "access_count": metadata.access_count,
                    "last_access": metadata.last_access,
                    "memory_usage": metadata.memory_usage,
                    "error_count": metadata.error_count,
                    "last_error": metadata.last_error,
                    "dependencies": metadata.dependencies,
                    "type_hints": metadata.type_hints,
                },
            }
        except Exception as e:
            logger.error(f"Failed to create lazy export for {package_name}: {e}")
            raise

    def get_lazy_export(self, package_name: str) -> dict[str, Any] | None:
        """Get an existing lazy export."""
        try:
            lazy_export = get_lazy_export(package_name)

            if not lazy_export:
                return None

            # Get metadata
            metadata = lazy_export.get_metadata()

            return {
                "package_name": package_name,
                "is_loaded": lazy_export._module is not None,
                "metadata": {
                    "export_type": metadata.export_type.value,
                    "validation_level": metadata.validation_level.value,
                    "load_time": metadata.load_time,
                    "access_count": metadata.access_count,
                    "last_access": metadata.last_access,
                    "memory_usage": metadata.memory_usage,
                    "error_count": metadata.error_count,
                    "last_error": metadata.last_error,
                    "dependencies": metadata.dependencies,
                    "type_hints": metadata.type_hints,
                },
            }
        except Exception as e:
            logger.error(f"Failed to get lazy export for {package_name}: {e}")
            raise

    def load_package(self, package_name: str) -> dict[str, Any]:
        """Load a package using its lazy export."""
        try:
            lazy_export = get_lazy_export(package_name)

            if not lazy_export:
                return {
                    "success": False,
                    "package_name": package_name,
                    "error": f"Lazy export for package '{package_name}' not found",
                }

            # Load the module
            start_time = time.time()

            try:
                module = lazy_export._load_module()
                load_time = time.time() - start_time

                return {
                    "success": True,
                    "package_name": package_name,
                    "load_time": load_time,
                }

            except Exception as load_error:
                return {
                    "success": False,
                    "package_name": package_name,
                    "error": str(load_error),
                }

        except Exception as e:
            logger.error(f"Failed to load package {package_name}: {e}")
            raise

    def unload_package(self, package_name: str) -> dict[str, Any]:
        """Unload a package by forcing cleanup of its lazy export."""
        try:
            lazy_export = get_lazy_export(package_name)

            if not lazy_export:
                return {
                    "success": False,
                    "error": f"Lazy export for package '{package_name}' not found",
                }

            # Force cleanup
            lazy_export.force_cleanup()

            return {
                "success": True,
                "message": f"Package '{package_name}' unloaded successfully",
            }

        except Exception as e:
            logger.error(f"Failed to unload package {package_name}: {e}")
            raise
