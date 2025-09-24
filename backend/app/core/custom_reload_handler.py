"""🦊 Custom Reload Handler for Intelligent Service Reloading

This module provides a custom reload handler that intercepts file changes
and intelligently reloads only the affected services instead of restarting
the entire application.
"""

import asyncio
import logging
from pathlib import Path

try:
    from uvicorn.reload import StatReload
except ImportError:
    # Fallback for different uvicorn versions
    from uvicorn.supervisors import StatReload

logger = logging.getLogger(__name__)


class IntelligentReloadHandler(StatReload):
    """Custom reload handler that provides intelligent service-specific reloading.

    This handler intercepts file changes and determines which services should
    be reloaded, then reloads only those services instead of restarting the
    entire application.
    """

    def __init__(self, *args, **kwargs):
        """Initialize the intelligent reload handler."""
        super().__init__(*args, **kwargs)
        self.reload_manager = None
        self.app = None

    def set_app(self, app):
        """Set the FastAPI application instance."""
        self.app = app

    def set_reload_manager(self, reload_manager):
        """Set the service reload manager."""
        self.reload_manager = reload_manager

    def should_reload(self, files: list[Path]) -> bool:
        """Determine if the application should reload based on changed files.

        Args:
            files: List of changed file paths

        Returns:
            True if the application should reload

        """
        if not self.reload_manager or not self.app:
            # Fall back to standard reload behavior
            return super().should_reload(files)

        # Check if any changed files require service-specific reloading
        services_to_reload = set()

        for file_path in files:
            file_str = str(file_path)
            affected_services = self.reload_manager.get_affected_services(file_str)
            services_to_reload.update(affected_services)

        if services_to_reload:
            logger.info(
                f"🔄 Detected changes affecting services: {', '.join(services_to_reload)}",
            )

            # Reload the affected services
            asyncio.create_task(self._reload_services(list(services_to_reload)))

            # Don't reload the entire application
            return False
        # No service-specific changes, use standard reload
        return super().should_reload(files)

    async def _reload_services(self, service_names: list[str]):
        """Reload the specified services.

        Args:
            service_names: List of service names to reload

        """
        try:
            logger.info(f"🔄 Reloading services: {', '.join(service_names)}")

            results = await self.reload_manager.reload_services(service_names)

            # Log results
            for service_name, success in results.items():
                if success:
                    logger.info(f"✅ Service {service_name} reloaded successfully")
                else:
                    logger.error(f"❌ Failed to reload service: {service_name}")

        except Exception as e:
            logger.error(f"❌ Error during service reload: {e}")


def create_intelligent_reload_handler(app, reload_manager):
    """Create an intelligent reload handler for the given app and reload manager.

    Args:
        app: The FastAPI application instance
        reload_manager: The service reload manager

    Returns:
        The intelligent reload handler

    """
    handler = IntelligentReloadHandler()
    handler.set_app(app)
    handler.set_reload_manager(reload_manager)
    return handler
