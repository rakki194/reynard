"""Status Monitor for Lazy Loading

This module handles status monitoring and performance metrics
for the lazy loading system.
"""

import logging
from datetime import datetime
from typing import Any

from app.lazy_loading import get_all_exports, get_lazy_export

logger = logging.getLogger("uvicorn")


class StatusMonitor:
    """Monitors lazy loading system status and performance."""

    def get_system_status(self) -> dict[str, Any]:
        """Get the current status of the lazy loading system."""
        try:
            # Get all ML packages
            ml_packages = get_all_exports()

            # Count loaded packages
            loaded_packages = []
            total_load_time = 0.0
            total_loads = 0
            total_errors = 0

            for name, lazy_export in ml_packages.items():
                if lazy_export._module is not None:
                    loaded_packages.append(name)

                metadata = lazy_export.get_metadata()
                if metadata.load_time:
                    total_load_time += metadata.load_time
                    total_loads += 1
                total_errors += metadata.error_count

            # Calculate performance metrics
            average_load_time = (
                total_load_time / total_loads if total_loads > 0 else 0.0
            )
            error_rate = total_errors / max(total_loads, 1)

            return {
                "system_status": "active",
                "timestamp": datetime.now().isoformat(),
                "loaded_packages": loaded_packages,
                "total_packages": len(ml_packages),
                "memory_usage": {
                    "total": 0,  # Would need system memory monitoring
                    "used": 0,
                    "available": 0,
                },
                "performance": {
                    "average_load_time": average_load_time,
                    "total_loads": total_loads,
                    "error_rate": error_rate,
                },
            }

        except Exception as e:
            logger.error(f"Failed to get lazy loading status: {e}")
            raise

    def get_package_info(self, package_name: str) -> dict[str, Any] | None:
        """Get detailed information about a specific package."""
        try:
            lazy_export = get_lazy_export(package_name)

            if not lazy_export:
                return None

            metadata = lazy_export.get_metadata()

            return {
                "name": package_name,
                "is_loaded": lazy_export._module is not None,
                "load_time": metadata.load_time,
                "memory_usage": metadata.memory_usage,
                "access_count": metadata.access_count,
                "last_access": metadata.last_access,
                "error_count": metadata.error_count,
                "dependencies": metadata.dependencies,
            }

        except Exception as e:
            logger.error(f"Failed to get package info for {package_name}: {e}")
            raise

    def get_all_packages_info(self) -> list[dict[str, Any]]:
        """Get information about all registered packages."""
        try:
            ml_packages = get_all_exports()
            packages_info = []

            for name, lazy_export in ml_packages.items():
                metadata = lazy_export.get_metadata()

                packages_info.append(
                    {
                        "name": name,
                        "is_loaded": lazy_export._module is not None,
                        "load_time": metadata.load_time,
                        "memory_usage": metadata.memory_usage,
                        "access_count": metadata.access_count,
                        "last_access": metadata.last_access,
                        "error_count": metadata.error_count,
                        "dependencies": metadata.dependencies,
                    },
                )

            return packages_info

        except Exception as e:
            logger.error(f"Failed to get all packages info: {e}")
            raise
