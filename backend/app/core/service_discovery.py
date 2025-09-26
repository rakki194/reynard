"""Service Discovery and Auto-Discovery System

This module provides service discovery capabilities for the Reynard backend,
including auto-discovery of services, service registration, and service
lookup functionality.
"""

import asyncio
import importlib
import inspect
import logging
from pathlib import Path
from typing import Any

from .service_registry import (
    ServiceDependency,
    ServiceDependencyType,
    get_service_registry,
)
from .service_config_manager import get_service_config_manager

logger = logging.getLogger(__name__)


class ServiceDiscovery:
    """Service discovery system with auto-discovery capabilities.

    Provides:
    - Automatic service discovery from filesystem
    - Service registration and metadata management
    - Service lookup and resolution
    - Service health monitoring and status tracking
    - Service endpoint discovery and management
    """

    def __init__(self, service_directories: list[str] | None = None):
        self.registry = get_service_registry()
        self.config_manager = get_service_config_manager()

        # Service discovery configuration
        self.service_directories = service_directories or [
            "app/api",
            "app/services",
            "app/core",
        ]

        # Discovery state
        self.discovered_services: dict[str, dict[str, Any]] = {}
        self.service_metadata: dict[str, dict[str, Any]] = {}
        self.auto_discovery_enabled = True
        self.discovery_interval = 30.0  # seconds
        self.discovery_task: asyncio.Task | None = None

        # Service patterns
        self.service_patterns = [
            "*_service.py",
            "*_router.py",
            "*_endpoints.py",
            "service.py",
            "router.py",
            "endpoints.py",
        ]

        logger.info(
            f"ServiceDiscovery initialized with directories: {self.service_directories}",
        )

    async def start_auto_discovery(self) -> None:
        """Start automatic service discovery."""
        if not self.auto_discovery_enabled:
            logger.info("Auto-discovery is disabled")
            return

        if self.discovery_task and not self.discovery_task.done():
            logger.warning("Auto-discovery is already running")
            return

        logger.info("🔍 Starting automatic service discovery...")
        self.discovery_task = asyncio.create_task(self._auto_discovery_loop())

    async def stop_auto_discovery(self) -> None:
        """Stop automatic service discovery."""
        if self.discovery_task:
            self.discovery_task.cancel()
            try:
                await self.discovery_task
            except asyncio.CancelledError:
                pass
            self.discovery_task = None
            logger.info("🛑 Auto-discovery stopped")

    async def _auto_discovery_loop(self) -> None:
        """Main auto-discovery loop."""
        while True:
            try:
                await self.discover_services()
                await asyncio.sleep(self.discovery_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Auto-discovery error: {e}")
                await asyncio.sleep(self.discovery_interval)

    async def discover_services(self) -> dict[str, dict[str, Any]]:
        """Discover all services in the configured directories."""
        discovered = {}

        for directory in self.service_directories:
            try:
                services = await self._discover_services_in_directory(directory)
                discovered.update(services)
            except Exception as e:
                logger.error(f"Error discovering services in {directory}: {e}")

        # Update discovered services
        self.discovered_services = discovered

        # Register new services
        await self._register_discovered_services()

        logger.info(f"Discovered {len(discovered)} services")
        return discovered

    async def _discover_services_in_directory(
        self, directory: str,
    ) -> dict[str, dict[str, Any]]:
        """Discover services in a specific directory."""
        services = {}
        directory_path = Path(directory)

        if not directory_path.exists():
            logger.warning(f"Directory {directory} does not exist")
            return services

        # Find service files
        for pattern in self.service_patterns:
            for file_path in directory_path.rglob(pattern):
                try:
                    service_info = await self._analyze_service_file(file_path)
                    if service_info:
                        services[service_info["name"]] = service_info
                except Exception as e:
                    logger.error(f"Error analyzing service file {file_path}: {e}")

        return services

    async def _analyze_service_file(self, file_path: Path) -> dict[str, Any] | None:
        """Analyze a service file to extract service information."""
        try:
            # Convert file path to module name
            module_name = self._path_to_module_name(file_path)

            # Import the module
            module = importlib.import_module(module_name)

            # Extract service information
            service_info = {
                "name": self._extract_service_name(file_path, module),
                "module": module_name,
                "file_path": str(file_path),
                "endpoints": self._extract_endpoints(module),
                "dependencies": self._extract_dependencies(module),
                "configuration": self._extract_configuration(module),
                "health_check": self._extract_health_check(module),
                "version": self._extract_version(module),
                "description": self._extract_description(module),
            }

            return service_info

        except Exception as e:
            logger.error(f"Error analyzing service file {file_path}: {e}")
            return None

    def _path_to_module_name(self, file_path: Path) -> str:
        """Convert file path to Python module name."""
        # Remove .py extension
        module_path = file_path.with_suffix("")

        # Convert to module name
        parts = module_path.parts

        # Find the app directory
        try:
            app_index = parts.index("app")
            module_parts = parts[app_index:]
        except ValueError:
            module_parts = parts

        return ".".join(module_parts)

    def _extract_service_name(self, file_path: Path, module: Any) -> str:
        """Extract service name from file path and module."""
        # Try to get service name from module
        if hasattr(module, "SERVICE_NAME"):
            return module.SERVICE_NAME

        # Extract from file name
        file_name = file_path.stem
        if file_name.endswith("_service"):
            return file_name[:-8]  # Remove "_service"
        if file_name.endswith("_router"):
            return file_name[:-7]  # Remove "_router"
        if file_name.endswith("_endpoints"):
            return file_name[:-10]  # Remove "_endpoints"
        return file_name

    def _extract_endpoints(self, module: Any) -> list[dict[str, Any]]:
        """Extract API endpoints from module."""
        endpoints = []

        # Look for FastAPI routers or endpoint functions
        for name, obj in inspect.getmembers(module):
            if inspect.isfunction(obj) and hasattr(obj, "__annotations__"):
                # Check if it's a FastAPI endpoint
                if any(
                    param.annotation.__name__ == "Request"
                    for param in inspect.signature(obj).parameters.values()
                ):
                    endpoint_info = {
                        "name": name,
                        "function": obj,
                        "path": getattr(obj, "__path__", None),
                        "methods": getattr(obj, "__methods__", ["GET"]),
                    }
                    endpoints.append(endpoint_info)

        return endpoints

    def _extract_dependencies(self, module: Any) -> list[ServiceDependency]:
        """Extract service dependencies from module."""
        dependencies = []

        # Look for dependency definitions
        if hasattr(module, "SERVICE_DEPENDENCIES"):
            deps_config = module.SERVICE_DEPENDENCIES
            for dep_name, dep_config in deps_config.items():
                if isinstance(dep_config, dict):
                    dependency = ServiceDependency(
                        name=dep_name,
                        dependency_type=ServiceDependencyType(
                            dep_config.get("type", "required"),
                        ),
                        health_check_required=dep_config.get("health_check", True),
                        retry_attempts=dep_config.get("retry_attempts", 3),
                        retry_delay=dep_config.get("retry_delay", 1.0),
                    )
                else:
                    dependency = ServiceDependency(
                        name=dep_name,
                        dependency_type=ServiceDependencyType.REQUIRED,
                    )
                dependencies.append(dependency)

        return dependencies

    def _extract_configuration(self, module: Any) -> dict[str, Any]:
        """Extract configuration schema from module."""
        config = {}

        # Look for configuration definitions
        if hasattr(module, "SERVICE_CONFIG"):
            config = module.SERVICE_CONFIG
        elif hasattr(module, "DEFAULT_CONFIG"):
            config = module.DEFAULT_CONFIG

        return config

    def _extract_health_check(self, module: Any) -> callable | None:
        """Extract health check function from module."""
        # Look for health check functions
        health_check_names = ["health_check", "check_health", "is_healthy"]

        for name in health_check_names:
            if hasattr(module, name):
                func = getattr(module, name)
                if callable(func):
                    return func

        return None

    def _extract_version(self, module: Any) -> str:
        """Extract version from module."""
        if hasattr(module, "__version__"):
            return module.__version__
        if hasattr(module, "VERSION"):
            return module.VERSION
        return "1.0.0"

    def _extract_description(self, module: Any) -> str:
        """Extract description from module."""
        if hasattr(module, "__doc__") and module.__doc__:
            return module.__doc__.strip().split("\n")[0]
        if hasattr(module, "DESCRIPTION"):
            return module.DESCRIPTION
        return f"Service {self._extract_service_name(Path(), module)}"

    async def _register_discovered_services(self) -> None:
        """Register discovered services with the registry."""
        for service_name, service_info in self.discovered_services.items():
            try:
                # Check if service is already registered
                if service_name in self.registry._services:
                    continue

                # Get configuration
                config = self.config_manager.get_service_config(service_name)
                if service_info.get("configuration"):
                    config.update(service_info["configuration"])

                # Register service
                self.registry.register_service(
                    name=service_name,
                    config=config,
                    startup_func=None,  # Will be set by initializer
                    shutdown_func=None,  # Will be set by initializer
                    health_check_func=service_info.get("health_check"),
                    startup_priority=50,  # Default priority
                    dependencies=service_info.get("dependencies", []),
                    endpoint=f"/api/{service_name}",
                    version=service_info.get("version", "1.0.0"),
                )

                # Store metadata
                self.service_metadata[service_name] = service_info

                logger.info(f"Registered discovered service: {service_name}")

            except Exception as e:
                logger.error(
                    f"Error registering discovered service {service_name}: {e}",
                )

    def get_service_info(self, service_name: str) -> dict[str, Any] | None:
        """Get information about a discovered service."""
        return self.service_metadata.get(service_name)

    def get_all_discovered_services(self) -> dict[str, dict[str, Any]]:
        """Get all discovered services."""
        return self.service_metadata.copy()

    def find_services_by_pattern(self, pattern: str) -> list[str]:
        """Find services matching a pattern."""
        import fnmatch

        matching_services = []
        for service_name in self.service_metadata:
            if fnmatch.fnmatch(service_name, pattern):
                matching_services.append(service_name)

        return matching_services

    def get_services_by_dependency(self, dependency_name: str) -> list[str]:
        """Get services that depend on a specific service."""
        dependent_services = []

        for service_name, service_info in self.service_metadata.items():
            dependencies = service_info.get("dependencies", [])
            for dep in dependencies:
                if dep.name == dependency_name:
                    dependent_services.append(service_name)

        return dependent_services

    def get_service_endpoints(self, service_name: str) -> list[dict[str, Any]]:
        """Get endpoints for a specific service."""
        service_info = self.service_metadata.get(service_name)
        if service_info:
            return service_info.get("endpoints", [])
        return []

    def get_service_dependencies(self, service_name: str) -> list[ServiceDependency]:
        """Get dependencies for a specific service."""
        service_info = self.service_metadata.get(service_name)
        if service_info:
            return service_info.get("dependencies", [])
        return []

    async def refresh_service(self, service_name: str) -> bool:
        """Refresh a specific service by re-discovering it."""
        try:
            # Find the service file
            service_info = self.service_metadata.get(service_name)
            if not service_info:
                logger.error(f"Service {service_name} not found in metadata")
                return False

            file_path = Path(service_info["file_path"])

            # Re-analyze the service file
            new_service_info = await self._analyze_service_file(file_path)
            if not new_service_info:
                logger.error(f"Failed to re-analyze service file for {service_name}")
                return False

            # Update metadata
            self.service_metadata[service_name] = new_service_info

            # Re-register with registry
            await self._register_discovered_services()

            logger.info(f"Refreshed service: {service_name}")
            return True

        except Exception as e:
            logger.error(f"Error refreshing service {service_name}: {e}")
            return False

    def get_discovery_status(self) -> dict[str, Any]:
        """Get discovery system status."""
        return {
            "auto_discovery_enabled": self.auto_discovery_enabled,
            "discovery_interval": self.discovery_interval,
            "discovery_running": self.discovery_task is not None
            and not self.discovery_task.done(),
            "total_discovered_services": len(self.discovered_services),
            "total_registered_services": len(self.registry._services),
            "service_directories": self.service_directories,
            "service_patterns": self.service_patterns,
        }


# Global service discovery instance
_service_discovery: ServiceDiscovery | None = None


def get_service_discovery() -> ServiceDiscovery:
    """Get the global service discovery instance."""
    global _service_discovery
    if _service_discovery is None:
        _service_discovery = ServiceDiscovery()
    return _service_discovery


async def start_service_discovery() -> None:
    """Start the service discovery system."""
    discovery = get_service_discovery()
    await discovery.start_auto_discovery()


async def stop_service_discovery() -> None:
    """Stop the service discovery system."""
    discovery = get_service_discovery()
    await discovery.stop_auto_discovery()


async def discover_all_services() -> dict[str, dict[str, Any]]:
    """Discover all services."""
    discovery = get_service_discovery()
    return await discovery.discover_services()
