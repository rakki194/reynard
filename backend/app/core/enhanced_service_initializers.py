"""Enhanced Service Initializers for Reynard Backend

This module provides enhanced service initialization functions that integrate
with the new service registry system, providing comprehensive lifecycle
management, dependency tracking, and configuration management.
"""

import logging
import time
from typing import Any

from .enhanced_service_registry import (
    ServiceDependency,
    ServiceDependencyType,
    get_enhanced_service_registry,
)
from .service_config_manager import get_service_config_manager

logger = logging.getLogger(__name__)


class ServiceInitializer:
    """Base class for service initializers with enhanced capabilities.

    Provides common functionality for service initialization including:
    - Configuration loading and validation
    - Dependency checking
    - Health monitoring setup
    - Error handling and recovery
    - Metrics collection
    """

    def __init__(self, service_name: str):
        self.service_name = service_name
        self.registry = get_enhanced_service_registry()
        self.config_manager = get_service_config_manager()
        self.config: dict[str, Any] = {}
        self.dependencies: list[ServiceDependency] = []
        self.startup_time: float = 0.0

    async def initialize(self, service_config: dict[str, Any]) -> bool:
        """Initialize the service with enhanced capabilities."""
        try:
            self.startup_time = time.time()
            logger.info(f"🚀 Initializing service '{self.service_name}'...")

            # Load and validate configuration
            self.config = await self._load_configuration(service_config)

            # Check dependencies
            if not await self._check_dependencies():
                logger.error(
                    f"❌ Dependencies not met for service '{self.service_name}'",
                )
                return False

            # Perform service-specific initialization
            success = await self._initialize_service()

            if success:
                # Register health check
                await self._register_health_check()

                # Update metrics
                self._update_startup_metrics()

                startup_duration = time.time() - self.startup_time
                logger.info(
                    f"✅ Service '{self.service_name}' initialized successfully in {startup_duration:.2f}s",
                )
            else:
                logger.error(f"❌ Service '{self.service_name}' initialization failed")

            return success

        except Exception as e:
            logger.error(f"❌ Service '{self.service_name}' initialization error: {e}")
            return False

    async def _load_configuration(
        self, service_config: dict[str, Any],
    ) -> dict[str, Any]:
        """Load and validate service configuration."""
        # Load from config manager
        config = self.config_manager.get_service_config(self.service_name)

        # Merge with provided config
        config.update(service_config)

        # Validate configuration
        validated_config = self.config_manager._validate_configuration(
            self.service_name, config,
        )

        logger.debug(
            f"Loaded configuration for service '{self.service_name}': {len(validated_config)} parameters",
        )
        return validated_config

    async def _check_dependencies(self) -> bool:
        """Check if all service dependencies are met."""
        for dependency in self.dependencies:
            if not await self._is_dependency_available(dependency):
                if dependency.dependency_type == ServiceDependencyType.REQUIRED:
                    logger.error(
                        f"Required dependency '{dependency.name}' not available for service '{self.service_name}'",
                    )
                    return False
                if dependency.dependency_type == ServiceDependencyType.OPTIONAL:
                    logger.warning(
                        f"Optional dependency '{dependency.name}' not available for service '{self.service_name}'",
                    )
                else:  # SOFT dependency
                    logger.info(
                        f"Soft dependency '{dependency.name}' not available for service '{self.service_name}', will retry",
                    )

        return True

    async def _is_dependency_available(self, dependency: ServiceDependency) -> bool:
        """Check if a specific dependency is available."""
        # Check if dependency service is registered and running
        service_info = self.registry.get_service_info(dependency.name)
        if not service_info or service_info.status.value != "running":
            return False

        # Check health if required
        if dependency.health_check_required:
            health_info = self.registry.get_service_health(dependency.name)
            if not health_info or health_info.status.value != "healthy":
                return False

        return True

    async def _initialize_service(self) -> bool:
        """Perform service-specific initialization. Override in subclasses."""
        return True

    async def _register_health_check(self) -> None:
        """Register health check function with the registry."""
        # Override in subclasses to provide health check implementation

    def _update_startup_metrics(self) -> None:
        """Update startup metrics for the service."""
        metrics = self.registry.get_service_metrics(self.service_name)
        if metrics:
            metrics.startup_time = time.time() - self.startup_time

    async def shutdown(self) -> None:
        """Shutdown the service gracefully."""
        try:
            logger.info(f"🛑 Shutting down service '{self.service_name}'...")
            shutdown_start = time.time()

            # Perform service-specific shutdown
            await self._shutdown_service()

            # Update metrics
            metrics = self.registry.get_service_metrics(self.service_name)
            if metrics:
                metrics.shutdown_time = time.time() - shutdown_start

            logger.info(f"✅ Service '{self.service_name}' shutdown completed")

        except Exception as e:
            logger.error(f"❌ Service '{self.service_name}' shutdown error: {e}")

    async def _shutdown_service(self) -> None:
        """Perform service-specific shutdown. Override in subclasses."""

    async def health_check(self) -> bool:
        """Perform health check for the service. Override in subclasses."""
        return True


class GatekeeperServiceInitializer(ServiceInitializer):
    """Enhanced initializer for the Gatekeeper authentication service."""

    def __init__(self):
        super().__init__("gatekeeper")
        self.dependencies = []  # Gatekeeper has no dependencies

    async def _initialize_service(self) -> bool:
        """Initialize the Gatekeeper service."""
        try:
            from app.gatekeeper_config import initialize_gatekeeper
            from gatekeeper.api.dependencies import set_auth_manager

            # Initialize gatekeeper
            auth_manager = await initialize_gatekeeper()
            set_auth_manager(auth_manager)

            # Store instance in registry
            self.registry.set_service_instance(self.service_name, auth_manager)

            return True
        except Exception as e:
            logger.error(f"Gatekeeper initialization failed: {e}")
            return False

    async def _register_health_check(self) -> None:
        """Register health check for Gatekeeper."""
        self.registry.register_service(
            name=self.service_name,
            config=self.config,
            startup_func=None,  # Already initialized
            shutdown_func=self.shutdown,
            health_check_func=self.health_check,
            startup_priority=100,  # High priority - other services depend on auth
            dependencies=self.dependencies,
        )

    async def health_check(self) -> bool:
        """Check Gatekeeper service health."""
        try:
            # Check if auth manager is available and functional
            auth_manager = self.registry.get_service_instance(self.service_name)
            if not auth_manager:
                return False

            # Perform a simple health check (e.g., validate JWT secret)
            return hasattr(auth_manager, "validate_token")
        except Exception:
            return False


class ComfyUIServiceInitializer(ServiceInitializer):
    """Enhanced initializer for the ComfyUI service."""

    def __init__(self):
        super().__init__("comfy")
        self.dependencies = []  # ComfyUI is independent

    async def _initialize_service(self) -> bool:
        """Initialize the ComfyUI service."""
        try:
            from app.services.comfy import initialize_comfy_service

            # Initialize ComfyUI service
            initialize_comfy_service(self.config)

            return True
        except Exception as e:
            logger.error(f"ComfyUI initialization failed: {e}")
            return False

    async def _register_health_check(self) -> None:
        """Register health check for ComfyUI."""
        self.registry.register_service(
            name=self.service_name,
            config=self.config,
            startup_func=None,  # Already initialized
            shutdown_func=self.shutdown,
            health_check_func=self.health_check,
            startup_priority=50,
            dependencies=self.dependencies,
        )

    async def health_check(self) -> bool:
        """Check ComfyUI service health."""
        try:
            import aiohttp

            # Check if ComfyUI API is accessible
            base_url = self.config.get("base_url", "http://localhost:8188")
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{base_url}/system_stats", timeout=5,
                ) as response:
                    return response.status == 200
        except Exception:
            return False


class RAGServiceInitializer(ServiceInitializer):
    """Enhanced initializer for the RAG service."""

    def __init__(self):
        super().__init__("rag")
        self.dependencies = []  # RAG service is independent

    async def _initialize_service(self) -> bool:
        """Initialize the RAG service."""
        try:
            from app.services.rag.rag_service import RAGService

            # Create and initialize RAG service
            rag_service = RAGService(self.config)
            await rag_service.initialize()

            # Store instance in registry
            self.registry.set_service_instance(self.service_name, rag_service)

            return True
        except Exception as e:
            logger.error(f"RAG service initialization failed: {e}")
            return False

    async def _register_health_check(self) -> None:
        """Register health check for RAG service."""
        self.registry.register_service(
            name=self.service_name,
            config=self.config,
            startup_func=None,  # Already initialized
            shutdown_func=self.shutdown,
            health_check_func=self.health_check,
            startup_priority=80,  # High priority - search depends on it
            dependencies=self.dependencies,
        )

    async def health_check(self) -> bool:
        """Check RAG service health."""
        try:
            rag_service = self.registry.get_service_instance(self.service_name)
            if not rag_service:
                return False

            # Check if RAG service is functional
            return hasattr(rag_service, "is_healthy") and await rag_service.is_healthy()
        except Exception:
            return False


class SearchServiceInitializer(ServiceInitializer):
    """Enhanced initializer for the Search service."""

    def __init__(self):
        super().__init__("search")
        # Search service depends on RAG service
        self.dependencies = [
            ServiceDependency(
                name="rag",
                dependency_type=ServiceDependencyType.REQUIRED,
                health_check_required=True,
            ),
        ]

    async def _initialize_service(self) -> bool:
        """Initialize the Search service."""
        try:
            from app.api.search.service import OptimizedSearchService

            # Create and initialize search service
            search_service = OptimizedSearchService()
            success = await search_service.initialize()

            if success:
                # Store instance in registry
                self.registry.set_service_instance(self.service_name, search_service)
                return True
            logger.error("Search service initialization returned False")
            return False

        except Exception as e:
            logger.error(f"Search service initialization failed: {e}")
            return False

    async def _register_health_check(self) -> None:
        """Register health check for Search service."""
        self.registry.register_service(
            name=self.service_name,
            config=self.config,
            startup_func=None,  # Already initialized
            shutdown_func=self.shutdown,
            health_check_func=self.health_check,
            startup_priority=60,  # Depends on RAG
            dependencies=self.dependencies,
        )

    async def health_check(self) -> bool:
        """Check Search service health."""
        try:
            search_service = self.registry.get_service_instance(self.service_name)
            if not search_service:
                return False

            # Check if search service is functional
            return (
                hasattr(search_service, "is_healthy")
                and await search_service.is_healthy()
            )
        except Exception:
            return False


class OllamaServiceInitializer(ServiceInitializer):
    """Enhanced initializer for the Ollama service."""

    def __init__(self):
        super().__init__("ollama")
        self.dependencies = []  # Ollama is independent

    async def _initialize_service(self) -> bool:
        """Initialize the Ollama service."""
        try:
            from app.api.ollama.service import initialize_ollama_service

            # Initialize Ollama service
            success = await initialize_ollama_service(self.config)

            if success:
                logger.info("Ollama service initialized successfully")
                return True
            logger.warning("Ollama service initialization failed")
            return False

        except Exception as e:
            logger.error(f"Ollama service initialization failed: {e}")
            return False

    async def _register_health_check(self) -> None:
        """Register health check for Ollama service."""
        self.registry.register_service(
            name=self.service_name,
            config=self.config,
            startup_func=None,  # Already initialized
            shutdown_func=self.shutdown,
            health_check_func=self.health_check,
            startup_priority=40,
            dependencies=self.dependencies,
        )

    async def health_check(self) -> bool:
        """Check Ollama service health."""
        try:
            import aiohttp

            # Check if Ollama API is accessible
            base_url = self.config.get("base_url", "http://localhost:11434")
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{base_url}/api/tags", timeout=5) as response:
                    return response.status == 200
        except Exception:
            return False


class TTSServiceInitializer(ServiceInitializer):
    """Enhanced initializer for the TTS service."""

    def __init__(self):
        super().__init__("tts")
        self.dependencies = []  # TTS is independent

    async def _initialize_service(self) -> bool:
        """Initialize the TTS service."""
        try:
            # TTS service initialization would go here
            # For now, just mark as successful
            logger.info("TTS service initialized (placeholder)")
            return True
        except Exception as e:
            logger.error(f"TTS service initialization failed: {e}")
            return False

    async def _register_health_check(self) -> None:
        """Register health check for TTS service."""
        self.registry.register_service(
            name=self.service_name,
            config=self.config,
            startup_func=None,  # Already initialized
            shutdown_func=self.shutdown,
            health_check_func=self.health_check,
            startup_priority=30,
            dependencies=self.dependencies,
        )

    async def health_check(self) -> bool:
        """Check TTS service health."""
        try:
            # TTS health check would go here
            return True
        except Exception:
            return False


class NLWebServiceInitializer(ServiceInitializer):
    """Enhanced initializer for the NLWeb service."""

    def __init__(self):
        super().__init__("nlweb")
        self.dependencies = []  # NLWeb is independent

    async def _initialize_service(self) -> bool:
        """Initialize the NLWeb service."""
        try:
            from app.services.nlweb.service_initializer import initialize_nlweb_service

            # Initialize NLWeb service
            initialize_nlweb_service(self.config)

            return True
        except Exception as e:
            logger.error(f"NLWeb service initialization failed: {e}")
            return False

    async def _register_health_check(self) -> None:
        """Register health check for NLWeb service."""
        self.registry.register_service(
            name=self.service_name,
            config=self.config,
            startup_func=None,  # Already initialized
            shutdown_func=self.shutdown,
            health_check_func=self.health_check,
            startup_priority=20,
            dependencies=self.dependencies,
        )

    async def health_check(self) -> bool:
        """Check NLWeb service health."""
        try:
            import aiohttp

            # Check if NLWeb API is accessible
            base_url = self.config.get("base_url", "http://localhost:8001")
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{base_url}/health", timeout=5) as response:
                    return response.status == 200
        except Exception:
            return False


# Service initializer registry
SERVICE_INITIALIZERS = {
    "gatekeeper": GatekeeperServiceInitializer,
    "comfy": ComfyUIServiceInitializer,
    "rag": RAGServiceInitializer,
    "search": SearchServiceInitializer,
    "ollama": OllamaServiceInitializer,
    "tts": TTSServiceInitializer,
    "nlweb": NLWebServiceInitializer,
}


async def initialize_all_services() -> bool:
    """Initialize all services using the enhanced initializers."""
    registry = get_enhanced_service_registry()
    config_manager = get_service_config_manager()

    logger.info("🚀 Starting enhanced service initialization...")

    try:
        # Initialize each service
        for service_name, initializer_class in SERVICE_INITIALIZERS.items():
            logger.info(f"Initializing service: {service_name}")

            # Create initializer instance
            initializer = initializer_class()

            # Get service configuration
            service_config = config_manager.get_service_config(service_name)

            # Initialize the service
            success = await initializer.initialize(service_config)

            if not success:
                logger.error(f"Failed to initialize service: {service_name}")
                return False

        # Initialize all services in the registry
        registry_success = await registry.initialize_all()

        if registry_success:
            logger.info("✅ All services initialized successfully")
            return True
        logger.error("❌ Service registry initialization failed")
        return False

    except Exception as e:
        logger.error(f"❌ Enhanced service initialization failed: {e}")
        return False


async def shutdown_all_services() -> bool:
    """Shutdown all services gracefully."""
    registry = get_enhanced_service_registry()

    logger.info("🛑 Starting enhanced service shutdown...")

    try:
        success = await registry.shutdown_all()

        if success:
            logger.info("✅ All services shutdown successfully")
        else:
            logger.error("❌ Service shutdown failed")

        return success

    except Exception as e:
        logger.error(f"❌ Enhanced service shutdown failed: {e}")
        return False
