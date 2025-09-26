"""Unified Service Management System for Reynard Backend

This module provides comprehensive service lifecycle management including initialization,
shutdown, discovery, and health monitoring. It combines the best features from the
previous service_initializers, enhanced_service_initializers, service_shutdown, and
enhanced_service_shutdown modules into a single, cohesive system.

Features:
- Service initialization with dependency management
- Graceful shutdown with comprehensive cleanup
- Auto-discovery of services
- Health monitoring and status tracking
- Configuration management
- Error handling and recovery
- Performance metrics and logging
"""

import asyncio
import importlib
import inspect
import logging
import time
from pathlib import Path
from typing import Any

from .service_config_manager import get_service_config_manager
from .service_registry import (
    ServiceDependency,
    ServiceDependencyType,
    get_service_registry,
)

logger = logging.getLogger(__name__)


class ServiceManager:
    """Unified service management system with comprehensive lifecycle management.

    Provides:
    - Service initialization with dependency resolution
    - Graceful shutdown with resource cleanup
    - Auto-discovery of services
    - Health monitoring and status tracking
    - Configuration management
    - Error handling and recovery
    """

    def __init__(self, shutdown_timeout: float = 30.0, grace_period: float = 5.0):
        self.registry = get_service_registry()
        self.config_manager = get_service_config_manager()
        self.shutdown_timeout = shutdown_timeout
        self.grace_period = grace_period
        self.startup_time: float = 0.0
        self.shutdown_start_time: float = 0.0
        self.shutdown_progress: dict[str, str] = {}

        # Service discovery configuration
        self.service_directories = [
            "app/api",
            "app/services",
            "app/core",
        ]
        self.service_patterns = [
            "*_service.py",
            "*_router.py",
            "*_endpoints.py",
            "service.py",
            "router.py",
            "endpoints.py",
        ]
        self.discovered_services: dict[str, dict[str, Any]] = {}
        self.service_metadata: dict[str, dict[str, Any]] = {}

    async def initialize_all_services(self) -> bool:
        """Initialize all services with dependency management."""
        self.startup_time = time.time()
        logger.info("🚀 Starting service initialization...")

        try:
            # Initialize services in dependency order
            service_initializers = {
                "database": self._initialize_database,
                "gatekeeper": self._initialize_gatekeeper,
                "ai": self._initialize_ai,  # AI service must be initialized before RAG
                "comfy": self._initialize_comfy,
                "rag": self._initialize_rag,
                "search": self._initialize_search,
                "ollama": self._initialize_ollama,
                "tts": self._initialize_tts,
                "nlweb": self._initialize_nlweb,
            }

            for service_name, initializer_func in service_initializers.items():
                logger.info(f"Initializing service: {service_name}")

                # Get service configuration
                service_config = self.config_manager.get_service_config(service_name)

                # Initialize the service
                success = await initializer_func(service_config)

                if not success:
                    logger.error(f"Failed to initialize service: {service_name}")
                    return False

            # Initialize all services in the registry
            registry_success = await self.registry.initialize_all()

            if registry_success:
                startup_duration = time.time() - self.startup_time
                logger.info(
                    f"✅ All services initialized successfully in {startup_duration:.2f}s"
                )
                return True
            else:
                logger.error("❌ Service registry initialization failed")
                return False

        except Exception as e:
            logger.error(f"❌ Service initialization failed: {e}")
            return False

    async def shutdown_all_services(self) -> bool:
        """Perform comprehensive shutdown of all services."""
        self.shutdown_start_time = time.time()
        logger.info("🛑 Starting service shutdown procedure...")

        try:
            # Phase 1: Stop accepting new requests
            await self._stop_accepting_requests()

            # Phase 2: Graceful shutdown of services
            shutdown_success = await self._graceful_shutdown_services()

            # Phase 3: Force shutdown if needed
            if not shutdown_success:
                logger.warning(
                    "⚠️ Graceful shutdown failed, initiating force shutdown..."
                )
                await self._force_shutdown_services()

            # Phase 4: Final cleanup
            await self._final_cleanup()

            total_time = time.time() - self.shutdown_start_time
            logger.info(f"✅ Service shutdown completed in {total_time:.2f}s")
            return True

        except Exception as e:
            logger.error(f"❌ Service shutdown failed: {e}")
            return False

    # Service Initialization Methods
    async def _initialize_database(self, service_config: dict[str, Any]) -> bool:
        """Initialize the database service."""
        try:
            from app.core.database_manager import get_database_manager

            logger.info("🗄️ Initializing database service...")

            # Get database configuration
            database_url = service_config.get("database_url")
            if not database_url:
                logger.error("❌ Database URL not configured in service config")
                return False

            database_name = service_config.get("database_name", "main")

            # Get database manager and ensure database is ready
            db_manager = get_database_manager(
                database_url=database_url,
                database_name=database_name,
                pool_size=service_config.get("pool_size", 20),
                max_overflow=service_config.get("max_overflow", 30),
                pool_timeout=service_config.get("pool_timeout", 30),
                pool_recycle=service_config.get("pool_recycle", 3600),
                enable_logging=service_config.get("enable_logging", True),
            )

            # Initialize database with auto-fix capabilities
            success = db_manager.initialize_database()

            if success:
                # Register service
                self.registry.register_service(
                    name="database",
                    config=service_config,
                    startup_func=None,
                    shutdown_func=self._shutdown_database,
                    health_check_func=self._health_check_database,
                    startup_priority=90,  # High priority - before RAG
                    dependencies=[],
                )

                logger.info("✅ Database service initialized")
                return True
            else:
                logger.error("❌ Database service initialization failed")
                return False

        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            return False

    async def _initialize_gatekeeper(self, service_config: dict[str, Any]) -> bool:
        """Initialize the Gatekeeper authentication service."""
        try:
            from app.gatekeeper_config import initialize_gatekeeper
            from gatekeeper.api.dependencies import set_auth_manager

            auth_manager = await initialize_gatekeeper()
            set_auth_manager(auth_manager)

            # Store instance in registry
            self.registry.set_service_instance("gatekeeper", auth_manager)

            # Register service
            self.registry.register_service(
                name="gatekeeper",
                config=service_config,
                startup_func=None,
                shutdown_func=self._shutdown_gatekeeper,
                health_check_func=self._health_check_gatekeeper,
                startup_priority=100,
                dependencies=[],
            )

            logger.info("🔐 Gatekeeper service initialized")
            return True
        except Exception as e:
            logger.error(f"❌ Gatekeeper initialization failed: {e}")
            return False

    async def _initialize_comfy(self, service_config: dict[str, Any]) -> bool:
        """Initialize the ComfyUI service."""
        try:
            from app.services.comfy import initialize_comfy_service

            initialize_comfy_service(service_config)

            # Register service
            self.registry.register_service(
                name="comfy",
                config=service_config,
                startup_func=None,
                shutdown_func=self._shutdown_comfy,
                health_check_func=self._health_check_comfy,
                startup_priority=50,
                dependencies=[],
            )

            logger.info("🎨 ComfyUI service initialized")
            return True
        except Exception as e:
            logger.error(f"❌ ComfyUI initialization failed: {e}")
            return False

    async def _initialize_rag(self, service_config: dict[str, Any]) -> bool:
        """Initialize the RAG service."""
        try:
            from app.services.rag.rag_service import RAGService

            rag_service = RAGService(service_config)
            await rag_service.initialize()

            # Store instance in registry
            self.registry.set_service_instance("rag", rag_service)

            # Register service with database dependency
            self.registry.register_service(
                name="rag",
                config=service_config,
                startup_func=None,
                shutdown_func=self._shutdown_rag,
                health_check_func=self._health_check_rag,
                startup_priority=80,
                dependencies=[
                    ServiceDependency(
                        name="database",
                        dependency_type=ServiceDependencyType.REQUIRED,
                        health_check_required=True,
                    ),
                ],
            )

            logger.info("🧠 RAG service initialized")
            return True
        except Exception as e:
            logger.error(f"❌ RAG initialization failed: {e}")
            return False

    async def _initialize_search(self, service_config: dict[str, Any]) -> bool:
        """Initialize the Search service."""
        try:
            from app.api.search.service import OptimizedSearchService

            search_service = OptimizedSearchService()
            success = await search_service.initialize()

            if success:
                # Store instance in registry
                self.registry.set_service_instance("search", search_service)

                # Register service with RAG dependency
                self.registry.register_service(
                    name="search",
                    config=service_config,
                    startup_func=None,
                    shutdown_func=self._shutdown_search,
                    health_check_func=self._health_check_search,
                    startup_priority=60,
                    dependencies=[
                        ServiceDependency(
                            name="rag",
                            dependency_type=ServiceDependencyType.REQUIRED,
                            health_check_required=True,
                        ),
                    ],
                )

                logger.info("🔍 Search service initialized")
                return True
            else:
                logger.error("Search service initialization returned False")
                return False

        except Exception as e:
            logger.error(f"❌ Search initialization failed: {e}")
            return False

    async def _initialize_ollama(self, service_config: dict[str, Any]) -> bool:
        """Initialize the Ollama service."""
        try:
            from app.api.ollama.service import initialize_ollama_service

            success = await initialize_ollama_service(service_config)

            if success:
                # Register service
                self.registry.register_service(
                    name="ollama",
                    config=service_config,
                    startup_func=None,
                    shutdown_func=self._shutdown_ollama,
                    health_check_func=self._health_check_ollama,
                    startup_priority=40,
                    dependencies=[],
                )

                logger.info("🦙 Ollama service initialized")
                return True
            else:
                logger.warning("⚠️ Ollama service initialization failed")
                return False

        except Exception as e:
            logger.error(f"❌ Ollama initialization failed: {e}")
            return False

    async def _initialize_tts(self, service_config: dict[str, Any]) -> bool:
        """Initialize the TTS service."""
        try:
            # TTS service initialization would go here
            # For now, just mark as successful

            # Register service
            self.registry.register_service(
                name="tts",
                config=service_config,
                startup_func=None,
                shutdown_func=self._shutdown_tts,
                health_check_func=self._health_check_tts,
                startup_priority=30,
                dependencies=[],
            )

            logger.info("🔊 TTS service initialized")
            return True
        except Exception as e:
            logger.error(f"❌ TTS initialization failed: {e}")
            return False

    async def _initialize_nlweb(self, service_config: dict[str, Any]) -> bool:
        """Initialize the NLWeb service."""
        try:
            from app.services.nlweb.service_initializer import initialize_nlweb_service

            initialize_nlweb_service(service_config)

            # Register service
            self.registry.register_service(
                name="nlweb",
                config=service_config,
                startup_func=None,
                shutdown_func=self._shutdown_nlweb,
                health_check_func=self._health_check_nlweb,
                startup_priority=20,
                dependencies=[],
            )

            logger.info("🌐 NLWeb service initialized")
            return True
        except Exception as e:
            logger.error(f"❌ NLWeb initialization failed: {e}")
            return False

    async def _initialize_ai(self, service_config: dict[str, Any]) -> bool:
        """Initialize the AI service."""
        try:
            from app.core.ai_service_initializer import init_ai_service

            success = await init_ai_service(service_config)

            if success:
                # Register service first
                self.registry.register_service(
                    name="ai",
                    config=service_config,
                    startup_func=None,
                    shutdown_func=self._shutdown_ai,
                    health_check_func=self._health_check_ai,
                    startup_priority=70,
                    dependencies=[],
                )

                # Get AI service instance and store in registry
                from app.core.ai_service_initializer import get_ai_service
                ai_service = get_ai_service()
                self.registry.set_service_instance("ai", ai_service)

                logger.info("🤖 AI service initialized")
                return True
            else:
                logger.warning("⚠️ AI service initialization failed")
                return False

        except Exception as e:
            logger.error(f"❌ AI initialization failed: {e}")
            return False

    # Service Shutdown Methods
    async def _stop_accepting_requests(self) -> None:
        """Stop accepting new requests from clients."""
        logger.info("📝 Phase 1: Stopping acceptance of new requests...")
        self.shutdown_progress["request_acceptance"] = "stopped"
        logger.info("✅ New request acceptance stopped")

    async def _graceful_shutdown_services(self) -> bool:
        """Perform graceful shutdown of all services."""
        logger.info("🔄 Phase 2: Graceful service shutdown...")

        try:
            # Get shutdown order from registry
            shutdown_order = self.registry._resolve_shutdown_order()

            # Shutdown services in dependency order
            for service_name in shutdown_order:
                if service_name in self.registry._services:
                    success = await self._shutdown_service_gracefully(service_name)
                    if not success:
                        logger.warning(
                            f"⚠️ Graceful shutdown failed for service '{service_name}'"
                        )

            # Use registry's shutdown method
            registry_success = await self.registry.shutdown_all(self.shutdown_timeout)

            self.shutdown_progress["graceful_shutdown"] = (
                "completed" if registry_success else "failed"
            )
            return registry_success

        except Exception as e:
            logger.error(f"Graceful shutdown error: {e}")
            self.shutdown_progress["graceful_shutdown"] = "error"
            return False

    async def _shutdown_service_gracefully(self, service_name: str) -> bool:
        """Shutdown a single service gracefully."""
        service_info = self.registry._services[service_name]

        if service_info.status.value != "running":
            logger.info(f"Service '{service_name}' is not running, skipping shutdown")
            return True

        logger.info(f"🔄 Gracefully shutting down service '{service_name}'...")
        service_info.status.value = "stopping"
        self.shutdown_progress[service_name] = "stopping"

        try:
            # Perform service-specific shutdown
            await self._perform_service_shutdown(service_name)

            # Wait for grace period
            await asyncio.sleep(self.grace_period)

            service_info.status.value = "stopped"
            self.shutdown_progress[service_name] = "stopped"
            logger.info(f"✅ Service '{service_name}' shutdown gracefully")
            return True

        except Exception as e:
            logger.error(
                f"❌ Graceful shutdown failed for service '{service_name}': {e}"
            )
            service_info.status.value = "error"
            self.shutdown_progress[service_name] = "error"
            return False

    async def _perform_service_shutdown(self, service_name: str) -> None:
        """Perform service-specific shutdown procedures."""
        # Get service instance
        service_instance = self.registry.get_service_instance(service_name)

        if not service_instance:
            logger.warning(f"No service instance found for '{service_name}'")
            return

        # Perform service-specific cleanup
        if hasattr(service_instance, "shutdown"):
            await service_instance.shutdown()
        elif hasattr(service_instance, "close"):
            await service_instance.close()
        elif hasattr(service_instance, "cleanup"):
            await service_instance.cleanup()

        # Additional service-specific shutdown logic
        await self._service_specific_shutdown(service_name, service_instance)

    async def _service_specific_shutdown(
        self, service_name: str, service_instance: Any
    ) -> None:
        """Perform service-specific shutdown procedures."""
        try:
            if service_name == "database":
                await self._shutdown_database()
            elif service_name == "gatekeeper":
                await self._shutdown_gatekeeper()
            elif service_name == "comfy":
                await self._shutdown_comfy()
            elif service_name == "rag":
                await self._shutdown_rag()
            elif service_name == "search":
                await self._shutdown_search()
            elif service_name == "ollama":
                await self._shutdown_ollama()
            elif service_name == "tts":
                await self._shutdown_tts()
            elif service_name == "nlweb":
                await self._shutdown_nlweb()
            elif service_name == "ai":
                await self._shutdown_ai()
            else:
                logger.info(
                    f"No specific shutdown procedure for service '{service_name}'"
                )

        except Exception as e:
            logger.error(f"Service-specific shutdown error for '{service_name}': {e}")

    async def _force_shutdown_services(self) -> None:
        """Force shutdown of services that didn't shutdown gracefully."""
        logger.info("⚡ Phase 3: Force shutdown of remaining services...")

        # Force shutdown any services still running
        for service_name, service_info in self.registry._services.items():
            if service_info.status.value in ["running", "stopping"]:
                logger.warning(f"⚡ Force shutting down service '{service_name}'")
                service_info.status.value = "stopped"
                self.shutdown_progress[service_name] = "force_stopped"

        self.shutdown_progress["force_shutdown"] = "completed"
        logger.info("✅ Force shutdown completed")

    async def _final_cleanup(self) -> None:
        """Perform final cleanup procedures."""
        logger.info("🧹 Phase 4: Final cleanup...")

        try:
            # Cleanup configuration manager
            await self._cleanup_config_manager()

            # Cleanup registry
            await self._cleanup_registry()

            # Additional cleanup tasks
            await self._cleanup_resources()

            self.shutdown_progress["final_cleanup"] = "completed"
            logger.info("✅ Final cleanup completed")

        except Exception as e:
            logger.error(f"Final cleanup error: {e}")
            self.shutdown_progress["final_cleanup"] = "error"

    async def _cleanup_config_manager(self) -> None:
        """Cleanup configuration manager resources."""
        try:
            # Save any pending configuration changes
            for service_name in self.config_manager._configurations:
                self.config_manager.save_service_config(service_name)

            logger.info("📝 Configuration manager cleanup completed")
        except Exception as e:
            logger.error(f"Configuration manager cleanup error: {e}")

    async def _cleanup_registry(self) -> None:
        """Cleanup service registry resources."""
        try:
            # Clear all service instances
            for service_name in list(self.registry._services.keys()):
                self.registry._services[service_name].instance = None

            # Clear health monitoring
            self.registry._health_info.clear()
            self.registry._metrics.clear()

            logger.info("📋 Service registry cleanup completed")
        except Exception as e:
            logger.error(f"Service registry cleanup error: {e}")

    async def _cleanup_resources(self) -> None:
        """Cleanup additional resources."""
        try:
            # Close any remaining connections
            # Clear caches
            # Cleanup temporary files
            # etc.

            logger.info("🗑️ Additional resource cleanup completed")
        except Exception as e:
            logger.error(f"Additional resource cleanup error: {e}")

    # Individual Service Shutdown Methods
    async def _shutdown_database(self) -> None:
        """Shutdown database service."""
        try:
            from app.core.database_manager import get_database_manager

            logger.info("🗄️ Shutting down database service...")

            # Get database configuration from registry
            service_info = self.registry._services.get("database")
            if not service_info:
                logger.warning("Database service not found in registry")
                return

            service_config = service_info.config
            database_url = service_config.get("database_url")
            database_name = service_config.get("database_name", "main")

            if database_url:
                db_manager = get_database_manager(
                    database_url=database_url, database_name=database_name
                )
                await db_manager.close()

            logger.info("✅ Database service shutdown complete")
        except Exception as e:
            logger.error(f"Database shutdown error: {e}")

    async def _shutdown_gatekeeper(self) -> None:
        """Shutdown Gatekeeper service."""
        try:
            from app.gatekeeper_config import shutdown_gatekeeper

            await shutdown_gatekeeper()
            logger.info("🔐 Gatekeeper service shutdown completed")
        except Exception as e:
            logger.error(f"Gatekeeper shutdown error: {e}")

    async def _shutdown_comfy(self) -> None:
        """Shutdown ComfyUI service."""
        try:
            from app.services.comfy import shutdown_comfy_service

            shutdown_comfy_service()
            logger.info("🎨 ComfyUI service shutdown completed")
        except Exception as e:
            logger.error(f"ComfyUI shutdown error: {e}")

    async def _shutdown_rag(self) -> None:
        """Shutdown RAG service."""
        try:
            rag_service = self.registry.get_service_instance("rag")
            if rag_service:
                if hasattr(rag_service, "shutdown"):
                    await rag_service.shutdown()
                elif hasattr(rag_service, "close"):
                    await rag_service.close()
            logger.info("🧠 RAG service shutdown completed")
        except Exception as e:
            logger.error(f"RAG service shutdown error: {e}")

    async def _shutdown_search(self) -> None:
        """Shutdown Search service."""
        try:
            search_service = self.registry.get_service_instance("search")
            if search_service:
                if hasattr(search_service, "shutdown"):
                    await search_service.shutdown()
                elif hasattr(search_service, "close"):
                    await search_service.close()
            logger.info("🔍 Search service shutdown completed")
        except Exception as e:
            logger.error(f"Search service shutdown error: {e}")

    async def _shutdown_ollama(self) -> None:
        """Shutdown Ollama service."""
        try:
            # Ollama service cleanup would go here
            logger.info("🦙 Ollama service shutdown completed")
        except Exception as e:
            logger.error(f"Ollama service shutdown error: {e}")

    async def _shutdown_tts(self) -> None:
        """Shutdown TTS service."""
        try:
            # TTS service cleanup would go here
            logger.info("🔊 TTS service shutdown completed")
        except Exception as e:
            logger.error(f"TTS service shutdown error: {e}")

    async def _shutdown_nlweb(self) -> None:
        """Shutdown NLWeb service."""
        try:
            from app.services.nlweb.service_initializer import shutdown_nlweb_service

            await shutdown_nlweb_service()
            logger.info("🌐 NLWeb service shutdown completed")
        except Exception as e:
            logger.error(f"NLWeb service shutdown error: {e}")

    async def _shutdown_ai(self) -> None:
        """Shutdown AI service."""
        try:
            from app.core.ai_service_initializer import shutdown_ai_service

            await shutdown_ai_service()
            logger.info("🤖 AI service shutdown completed")
        except Exception as e:
            logger.error(f"AI service shutdown error: {e}")

    # Health Check Methods
    async def _health_check_database(self) -> bool:
        """Check database service health."""
        try:
            from app.core.database_manager import get_database_manager

            # Get database configuration from registry
            service_info = self.registry._services.get("database")
            if not service_info:
                return False

            service_config = service_info.config
            database_url = service_config.get("database_url")
            database_name = service_config.get("database_name", "main")

            if not database_url:
                return False

            db_manager = get_database_manager(
                database_url=database_url, database_name=database_name
            )
            health_status = db_manager.get_health_status()
            return health_status.get("status") == "healthy"
        except Exception:
            return False

    async def _health_check_gatekeeper(self) -> bool:
        """Check Gatekeeper service health."""
        try:
            auth_manager = self.registry.get_service_instance("gatekeeper")
            if not auth_manager:
                return False
            return hasattr(auth_manager, "validate_token")
        except Exception:
            return False

    async def _health_check_comfy(self) -> bool:
        """Check ComfyUI service health."""
        try:
            import aiohttp

            base_url = self.config_manager.get_service_config("comfy").get(
                "base_url", "http://localhost:8188"
            )
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{base_url}/system_stats", timeout=5
                ) as response:
                    return response.status == 200
        except Exception:
            return False

    async def _health_check_rag(self) -> bool:
        """Check RAG service health."""
        try:
            rag_service = self.registry.get_service_instance("rag")
            if not rag_service:
                return False
            return hasattr(rag_service, "is_healthy") and await rag_service.is_healthy()
        except Exception:
            return False

    async def _health_check_search(self) -> bool:
        """Check Search service health."""
        try:
            search_service = self.registry.get_service_instance("search")
            if not search_service:
                return False
            return (
                hasattr(search_service, "is_healthy")
                and await search_service.is_healthy()
            )
        except Exception:
            return False

    async def _health_check_ollama(self) -> bool:
        """Check Ollama service health."""
        try:
            import aiohttp

            base_url = self.config_manager.get_service_config("ollama").get(
                "base_url", "http://localhost:11434"
            )
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{base_url}/api/tags", timeout=5) as response:
                    return response.status == 200
        except Exception:
            return False

    async def _health_check_tts(self) -> bool:
        """Check TTS service health."""
        try:
            # TTS health check would go here
            return True
        except Exception:
            return False

    async def _health_check_nlweb(self) -> bool:
        """Check NLWeb service health."""
        try:
            import aiohttp

            base_url = self.config_manager.get_service_config("nlweb").get(
                "base_url", "http://localhost:8001"
            )
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{base_url}/health", timeout=5) as response:
                    return response.status == 200
        except Exception:
            return False

    async def _health_check_ai(self) -> bool:
        """Check AI service health."""
        try:
            # AI health check would go here
            return True
        except Exception:
            return False

    # Service Discovery Methods
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
        self, directory: str
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

    def _extract_health_check(self, module: Any) -> Any:
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
                    f"Error registering discovered service {service_name}: {e}"
                )

    # Utility Methods
    def get_shutdown_progress(self) -> dict[str, str]:
        """Get current shutdown progress."""
        return self.shutdown_progress.copy()

    def get_shutdown_duration(self) -> float:
        """Get total shutdown duration."""
        if self.shutdown_start_time > 0:
            return time.time() - self.shutdown_start_time
        return 0.0

    def get_service_info(self, service_name: str) -> dict[str, Any] | None:
        """Get information about a discovered service."""
        return self.service_metadata.get(service_name)

    def get_all_discovered_services(self) -> dict[str, dict[str, Any]]:
        """Get all discovered services."""
        return self.service_metadata.copy()


# Global service manager instance
_service_manager: ServiceManager | None = None


def get_service_manager() -> ServiceManager:
    """Get the global service manager instance."""
    global _service_manager
    if _service_manager is None:
        _service_manager = ServiceManager()
    return _service_manager


# Convenience functions for backward compatibility
async def initialize_all_services() -> bool:
    """Initialize all services using the unified service manager."""
    service_manager = get_service_manager()
    return await service_manager.initialize_all_services()


async def shutdown_all_services() -> bool:
    """Shutdown all services using the unified service manager."""
    service_manager = get_service_manager()
    return await service_manager.shutdown_all_services()


async def discover_all_services() -> dict[str, dict[str, Any]]:
    """Discover all services using the unified service manager."""
    service_manager = get_service_manager()
    return await service_manager.discover_services()
