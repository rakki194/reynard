"""Cleanup Manager for Lazy Loading

This module handles cleanup operations for the lazy loading system.
"""

import logging
from typing import Any

from app.lazy_loading import clear_export_registry, get_all_exports, get_lazy_export

logger = logging.getLogger("uvicorn")


class CleanupManager:
    """Manages cleanup operations for lazy loading."""

    def clear_registry(self) -> dict[str, Any]:
        """Clear the export registry."""
        try:
            clear_export_registry()
            return {"success": True, "message": "Export registry cleared successfully"}
        except Exception as e:
            logger.error(f"Failed to clear registry: {e}")
            raise

    def force_cleanup(self, package_name: str | None = None) -> dict[str, Any]:
        """Force cleanup of packages or all packages."""
        try:
            if package_name:
                lazy_export = get_lazy_export(package_name)
                if lazy_export:
                    lazy_export.force_cleanup()
                    return {
                        "success": True,
                        "message": f"Package '{package_name}' cleaned up successfully",
                    }
                return {
                    "success": False,
                    "error": f"Package '{package_name}' not found",
                }
            # Cleanup all packages
            ml_packages = get_all_exports()
            for lazy_export in ml_packages.values():
                lazy_export.force_cleanup()
            return {
                "success": True,
                "message": "All packages cleaned up successfully",
            }

        except Exception as e:
            logger.error(f"Failed to cleanup packages: {e}")
            raise
