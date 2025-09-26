"""Base Router Infrastructure for Reynard Backend Services

This module provides a reusable base router class that standardizes
service availability checking, error handling, and common patterns
across all service routers.
"""

import logging
from abc import ABC, abstractmethod
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from .error_handler import service_error_handler
from .exceptions import InternalError, ServiceUnavailableError

logger = logging.getLogger(__name__)


class ServiceStatus(BaseModel):
    """Service status model for health checks."""

    service_name: str
    is_healthy: bool
    status: str
    details: dict[str, Any] | None = None
    timestamp: float


class BaseServiceRouter(ABC):
    """Abstract base class for all service routers.

    Provides standardized patterns for:
    - Service availability checking
    - Error handling
    - Common operation patterns
    - Service dependency injection
    """

    def __init__(self, service_name: str, prefix: str = None, tags: list = None):
        self.service_name = service_name
        self.prefix = prefix or f"/api/{service_name}"
        self.tags = tags or [service_name]
        self.router = APIRouter(prefix=self.prefix, tags=self.tags)

        # Service dependencies
        self._service_dependencies: dict[str, Any] = {}
        self._service_initialized = False

        # Setup common endpoints
        self._setup_common_endpoints()

    @abstractmethod
    def get_service(self) -> Any:
        """Get the service instance for this router.

        Returns:
            The service instance

        """

    @abstractmethod
    def check_service_health(self) -> ServiceStatus:
        """Check the health of the service.

        Returns:
            ServiceStatus: Current service health status

        """

    def add_service_dependency(self, name: str, dependency: Any) -> None:
        """Add a service dependency.

        Args:
            name: Name of the dependency
            dependency: The dependency instance

        """
        self._service_dependencies[name] = dependency
        logger.info(f"Added service dependency '{name}' to {self.service_name}")

    def get_service_dependency(self, name: str) -> Any:
        """Get a service dependency by name.

        Args:
            name: Name of the dependency

        Returns:
            The dependency instance

        Raises:
            KeyError: If dependency not found

        """
        if name not in self._service_dependencies:
            raise KeyError(
                f"Service dependency '{name}' not found for {self.service_name}",
            )
        return self._service_dependencies[name]

    def _setup_common_endpoints(self) -> None:
        """Setup common endpoints for all services."""

        @self.router.get("/health")
        async def health_check():
            """Health check endpoint for the service."""
            try:
                status = self.check_service_health()
                return status.dict()
            except Exception as e:
                logger.error(f"Health check failed for {self.service_name}: {e}")
                return service_error_handler.handle_service_error(
                    operation="health_check",
                    error=e,
                    service_name=self.service_name,
                )

        @self.router.get("/status")
        async def service_status():
            """Get detailed service status."""
            try:
                status = self.check_service_health()

                return {
                    "service": self.service_name,
                    "status": status.dict(),
                    "dependencies": list(self._service_dependencies.keys()),
                    "initialized": self._service_initialized,
                }
            except Exception as e:
                logger.error(f"Status check failed for {self.service_name}: {e}")
                return service_error_handler.handle_service_error(
                    operation="status_check",
                    error=e,
                    service_name=self.service_name,
                )

    def _standard_operation(
        self,
        operation_name: str,
        operation_func,
        *args,
        **kwargs,
    ) -> Any:
        """Execute a standard operation with error handling and logging.

        Args:
            operation_name: Name of the operation for logging
            operation_func: Function to execute
            *args: Arguments to pass to the function
            **kwargs: Keyword arguments to pass to the function

        Returns:
            Result of the operation

        Raises:
            HTTPException: If operation fails

        """
        try:
            logger.info(f"Starting {operation_name} for {self.service_name}")
            result = operation_func(*args, **kwargs)
            logger.info(f"Completed {operation_name} for {self.service_name}")
            return result

        except Exception as e:
            logger.error(
                f"Operation {operation_name} failed for {self.service_name}: {e}",
            )
            raise service_error_handler.handle_service_error(
                operation=operation_name,
                error=e,
                service_name=self.service_name,
            )

    async def _standard_async_operation(
        self,
        operation_name: str,
        operation_func,
        *args,
        **kwargs,
    ) -> Any:
        """Execute a standard async operation with error handling and logging.

        Args:
            operation_name: Name of the operation for logging
            operation_func: Async function to execute
            *args: Arguments to pass to the function
            **kwargs: Keyword arguments to pass to the function

        Returns:
            Result of the operation

        Raises:
            HTTPException: If operation fails

        """
        try:
            logger.info(f"Starting async {operation_name} for {self.service_name}")
            result = await operation_func(*args, **kwargs)
            logger.info(f"Completed async {operation_name} for {self.service_name}")
            return result

        except Exception as e:
            logger.error(
                f"Async operation {operation_name} failed for {self.service_name}: {e}",
            )
            raise service_error_handler.handle_service_error(
                operation=operation_name,
                error=e,
                service_name=self.service_name,
            )

    def ensure_service_available(self) -> None:
        """Ensure the service is available before operations.

        Raises:
            ServiceUnavailableError: If service is not available

        """
        try:
            status = self.check_service_health()
            if not status.is_healthy:
                raise ServiceUnavailableError(
                    service_name=self.service_name,
                    message=f"Service {self.service_name} is not healthy: {status.status}",
                )
        except Exception as e:
            if isinstance(e, ServiceUnavailableError):
                raise
            raise ServiceUnavailableError(
                service_name=self.service_name,
                message=f"Failed to check service health: {e!s}",
            )

    def get_router(self) -> APIRouter:
        """Get the FastAPI router instance.

        Returns:
            APIRouter: The configured router

        """
        return self.router

    def include_router(self, router: APIRouter, prefix: str = None, **kwargs) -> None:
        """Include another router in this router.

        Args:
            router: Router to include
            prefix: Optional prefix for the included router
            **kwargs: Additional arguments for include_router

        """
        self.router.include_router(router, prefix=prefix, **kwargs)

    def add_endpoint(self, method: str, path: str, endpoint_func, **kwargs) -> None:
        """Add an endpoint to the router.

        Args:
            method: HTTP method (get, post, put, delete, etc.)
            path: URL path for the endpoint
            endpoint_func: Function to handle the endpoint
            **kwargs: Additional arguments for the endpoint

        """
        getattr(self.router, method.lower())(path, **kwargs)(endpoint_func)

    def add_middleware(self, middleware_class, **kwargs) -> None:
        """Add middleware to the router.

        Args:
            middleware_class: Middleware class to add
            **kwargs: Arguments for the middleware

        """
        self.router.add_middleware(middleware_class, **kwargs)

    def initialize_service(self) -> None:
        """Initialize the service and its dependencies."""
        try:
            logger.info(f"Initializing service {self.service_name}")

            # Initialize service dependencies
            for name, dependency in self._service_dependencies.items():
                if hasattr(dependency, "initialize"):
                    dependency.initialize()
                logger.info(f"Initialized dependency '{name}' for {self.service_name}")

            # Mark service as initialized
            self._service_initialized = True
            logger.info(f"Service {self.service_name} initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize service {self.service_name}: {e}")
            raise InternalError(
                message=f"Failed to initialize service {self.service_name}",
                service_name=self.service_name,
            )

    def shutdown_service(self) -> None:
        """Shutdown the service and its dependencies."""
        try:
            logger.info(f"Shutting down service {self.service_name}")

            # Shutdown service dependencies
            for name, dependency in self._service_dependencies.items():
                if hasattr(dependency, "shutdown"):
                    dependency.shutdown()
                logger.info(f"Shutdown dependency '{name}' for {self.service_name}")

            # Mark service as not initialized
            self._service_initialized = False
            logger.info(f"Service {self.service_name} shutdown successfully")

        except Exception as e:
            logger.error(f"Failed to shutdown service {self.service_name}: {e}")

    def get_service_info(self) -> dict[str, Any]:
        """Get information about the service.

        Returns:
            Dict containing service information

        """
        return {
            "service_name": self.service_name,
            "prefix": self.prefix,
            "tags": self.tags,
            "dependencies": list(self._service_dependencies.keys()),
            "initialized": self._service_initialized,
            "endpoints": len(self.router.routes),
        }
