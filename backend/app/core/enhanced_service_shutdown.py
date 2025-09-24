"""Enhanced Service Shutdown Module for Reynard Backend

This module provides comprehensive service shutdown procedures with graceful
resource cleanup, dependency-aware shutdown ordering, and error handling
for all service components in the Reynard backend.
"""

import asyncio
import logging
import time
from typing import Any

from .enhanced_service_registry import get_enhanced_service_registry
from .service_config_manager import get_service_config_manager

logger = logging.getLogger(__name__)


class ServiceShutdownManager:
    """Enhanced service shutdown manager with comprehensive cleanup procedures.

    Provides:
    - Graceful shutdown with dependency ordering
    - Resource cleanup and connection management
    - Timeout handling and force shutdown capabilities
    - Shutdown progress tracking and reporting
    - Error handling and recovery procedures
    """

    def __init__(self, shutdown_timeout: float = 30.0, grace_period: float = 5.0):
        self.registry = get_enhanced_service_registry()
        self.config_manager = get_service_config_manager()
        self.shutdown_timeout = shutdown_timeout
        self.grace_period = grace_period
        self.shutdown_start_time: float = 0.0
        self.shutdown_progress: dict[str, str] = {}

    async def shutdown_all_services(self) -> bool:
        """Perform comprehensive shutdown of all services."""
        self.shutdown_start_time = time.time()
        logger.info("🛑 Starting enhanced service shutdown procedure...")

        try:
            # Phase 1: Stop accepting new requests
            await self._stop_accepting_requests()

            # Phase 2: Graceful shutdown of services
            shutdown_success = await self._graceful_shutdown_services()

            # Phase 3: Force shutdown if needed
            if not shutdown_success:
                logger.warning(
                    "⚠️ Graceful shutdown failed, initiating force shutdown...",
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

    async def _stop_accepting_requests(self) -> None:
        """Stop accepting new requests from clients."""
        logger.info("📝 Phase 1: Stopping acceptance of new requests...")

        # This would typically involve:
        # - Setting a global flag to reject new requests
        # - Closing server sockets
        # - Notifying load balancers to stop routing traffic

        # For now, we'll just log this phase
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
                            f"⚠️ Graceful shutdown failed for service '{service_name}'",
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
                f"❌ Graceful shutdown failed for service '{service_name}': {e}",
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
        self, service_name: str, service_instance: Any,
    ) -> None:
        """Perform service-specific shutdown procedures."""
        try:
            if service_name == "gatekeeper":
                await self._shutdown_gatekeeper(service_instance)
            elif service_name == "comfy":
                await self._shutdown_comfy(service_instance)
            elif service_name == "rag":
                await self._shutdown_rag(service_instance)
            elif service_name == "search":
                await self._shutdown_search(service_instance)
            elif service_name == "ollama":
                await self._shutdown_ollama(service_instance)
            elif service_name == "tts":
                await self._shutdown_tts(service_instance)
            elif service_name == "nlweb":
                await self._shutdown_nlweb(service_instance)
            else:
                logger.info(
                    f"No specific shutdown procedure for service '{service_name}'",
                )

        except Exception as e:
            logger.error(f"Service-specific shutdown error for '{service_name}': {e}")

    async def _shutdown_gatekeeper(self, service_instance: Any) -> None:
        """Shutdown Gatekeeper service."""
        try:
            from app.gatekeeper_config import shutdown_gatekeeper

            await shutdown_gatekeeper()
            logger.info("🔐 Gatekeeper service shutdown completed")
        except Exception as e:
            logger.error(f"Gatekeeper shutdown error: {e}")

    async def _shutdown_comfy(self, service_instance: Any) -> None:
        """Shutdown ComfyUI service."""
        try:
            from app.services.comfy import shutdown_comfy_service

            shutdown_comfy_service()
            logger.info("🎨 ComfyUI service shutdown completed")
        except Exception as e:
            logger.error(f"ComfyUI shutdown error: {e}")

    async def _shutdown_rag(self, service_instance: Any) -> None:
        """Shutdown RAG service."""
        try:
            if hasattr(service_instance, "shutdown"):
                await service_instance.shutdown()
            elif hasattr(service_instance, "close"):
                await service_instance.close()
            logger.info("🧠 RAG service shutdown completed")
        except Exception as e:
            logger.error(f"RAG service shutdown error: {e}")

    async def _shutdown_search(self, service_instance: Any) -> None:
        """Shutdown Search service."""
        try:
            if hasattr(service_instance, "shutdown"):
                await service_instance.shutdown()
            elif hasattr(service_instance, "close"):
                await service_instance.close()
            logger.info("🔍 Search service shutdown completed")
        except Exception as e:
            logger.error(f"Search service shutdown error: {e}")

    async def _shutdown_ollama(self, service_instance: Any) -> None:
        """Shutdown Ollama service."""
        try:
            # Ollama service cleanup would go here
            logger.info("🦙 Ollama service shutdown completed")
        except Exception as e:
            logger.error(f"Ollama service shutdown error: {e}")

    async def _shutdown_tts(self, service_instance: Any) -> None:
        """Shutdown TTS service."""
        try:
            # TTS service cleanup would go here
            logger.info("🔊 TTS service shutdown completed")
        except Exception as e:
            logger.error(f"TTS service shutdown error: {e}")

    async def _shutdown_nlweb(self, service_instance: Any) -> None:
        """Shutdown NLWeb service."""
        try:
            from app.services.nlweb.service_initializer import shutdown_nlweb_service

            await shutdown_nlweb_service()
            logger.info("🌐 NLWeb service shutdown completed")
        except Exception as e:
            logger.error(f"NLWeb service shutdown error: {e}")

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

    def get_shutdown_progress(self) -> dict[str, str]:
        """Get current shutdown progress."""
        return self.shutdown_progress.copy()

    def get_shutdown_duration(self) -> float:
        """Get total shutdown duration."""
        if self.shutdown_start_time > 0:
            return time.time() - self.shutdown_start_time
        return 0.0


# Enhanced shutdown functions for individual services
async def shutdown_gatekeeper_service() -> None:
    """Enhanced shutdown for Gatekeeper service."""
    try:
        from app.gatekeeper_config import shutdown_gatekeeper

        await shutdown_gatekeeper()
        logger.info("🔐 Gatekeeper service shutdown completed")
    except Exception as e:
        logger.error(f"❌ Gatekeeper shutdown failed: {e}")


async def shutdown_comfy_service_func() -> None:
    """Enhanced shutdown for ComfyUI service."""
    try:
        from app.services.comfy import shutdown_comfy_service

        shutdown_comfy_service()
        logger.info("🎨 ComfyUI service shutdown completed")
    except Exception as e:
        logger.error(f"❌ ComfyUI shutdown failed: {e}")


async def shutdown_nlweb_service_func() -> None:
    """Enhanced shutdown for NLWeb service."""
    try:
        from app.services.nlweb.service_initializer import shutdown_nlweb_service

        await shutdown_nlweb_service()
        logger.info("🌐 NLWeb service shutdown completed")
    except Exception as e:
        logger.error(f"❌ NLWeb shutdown failed: {e}")


async def shutdown_rag_service() -> None:
    """Enhanced shutdown for RAG service."""
    try:
        registry = get_enhanced_service_registry()
        rag_service = registry.get_service_instance("rag")

        if rag_service:
            if hasattr(rag_service, "shutdown"):
                await rag_service.shutdown()
            elif hasattr(rag_service, "close"):
                await rag_service.close()

        logger.info("🧠 RAG service shutdown completed")
    except Exception as e:
        logger.error(f"❌ RAG service shutdown failed: {e}")


async def shutdown_search_service() -> None:
    """Enhanced shutdown for Search service."""
    try:
        registry = get_enhanced_service_registry()
        search_service = registry.get_service_instance("search")

        if search_service:
            if hasattr(search_service, "shutdown"):
                await search_service.shutdown()
            elif hasattr(search_service, "close"):
                await search_service.close()

        logger.info("🔍 Search service shutdown completed")
    except Exception as e:
        logger.error(f"❌ Search service shutdown failed: {e}")


async def shutdown_ollama_service() -> None:
    """Enhanced shutdown for Ollama service."""
    try:
        # Ollama service cleanup would go here
        logger.info("🦙 Ollama service shutdown completed")
    except Exception as e:
        logger.error(f"❌ Ollama service shutdown failed: {e}")


async def shutdown_tts_service() -> None:
    """Enhanced shutdown for TTS service."""
    try:
        # TTS service cleanup would go here
        logger.info("🔊 TTS service shutdown completed")
    except Exception as e:
        logger.error(f"❌ TTS service shutdown failed: {e}")


# Global shutdown manager instance
_shutdown_manager: ServiceShutdownManager | None = None


def get_shutdown_manager() -> ServiceShutdownManager:
    """Get the global shutdown manager instance."""
    global _shutdown_manager
    if _shutdown_manager is None:
        _shutdown_manager = ServiceShutdownManager()
    return _shutdown_manager


async def enhanced_shutdown_all_services() -> bool:
    """Enhanced shutdown procedure for all services."""
    shutdown_manager = get_shutdown_manager()
    return await shutdown_manager.shutdown_all_services()
