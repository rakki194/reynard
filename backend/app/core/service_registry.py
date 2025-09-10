"""
Service Registry for Reynard Backend.

Centralized service management with lifecycle control and health monitoring.
"""

import asyncio
import logging
from typing import Dict, Any, Optional, List, Callable, Awaitable
from dataclasses import dataclass, field
from enum import Enum
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)


class ServiceStatus(Enum):
    """Service status enumeration."""
    UNINITIALIZED = "uninitialized"
    INITIALIZING = "initializing"
    RUNNING = "running"
    STOPPING = "stopping"
    STOPPED = "stopped"
    ERROR = "error"


@dataclass
class ServiceInfo:
    """Service information container."""
    name: str
    status: ServiceStatus = ServiceStatus.UNINITIALIZED
    config: Dict[str, Any] = field(default_factory=dict)
    instance: Optional[Any] = None
    startup_func: Optional[Callable[[Dict[str, Any]], Awaitable[bool]]] = None
    shutdown_func: Optional[Callable[[], Awaitable[None]]] = None
    health_check_func: Optional[Callable[[], Awaitable[bool]]] = None
    error: Optional[Exception] = None
    startup_time: Optional[float] = None
    last_health_check: Optional[float] = None


class ServiceRegistry:
    """Centralized service registry with lifecycle management."""
    
    def __init__(self):
        self._services: Dict[str, ServiceInfo] = {}
        self._startup_order: List[str] = []
        self._shutdown_order: List[str] = []
        self._initialized = False
    
    def register_service(
        self,
        name: str,
        config: Dict[str, Any],
        startup_func: Optional[Callable[[Dict[str, Any]], Awaitable[bool]]] = None,
        shutdown_func: Optional[Callable[[], Awaitable[None]]] = None,
        health_check_func: Optional[Callable[[], Awaitable[bool]]] = None,
        startup_priority: int = 0
    ) -> None:
        """Register a service with the registry."""
        if name in self._services:
            logger.warning(f"Service '{name}' already registered, updating configuration")
        
        self._services[name] = ServiceInfo(
            name=name,
            config=config,
            startup_func=startup_func,
            shutdown_func=shutdown_func,
            health_check_func=health_check_func
        )
        
        # Insert into startup order based on priority
        insert_index = 0
        for i, existing_name in enumerate(self._startup_order):
            if existing_name in self._services:
                existing_priority = self._services[existing_name].config.get("startup_priority", 0)
                if startup_priority > existing_priority:
                    insert_index = i
                    break
                insert_index = i + 1
        
        if name not in self._startup_order:
            self._startup_order.insert(insert_index, name)
        
        # Shutdown order is reverse of startup order
        self._shutdown_order = list(reversed(self._startup_order))
        
        logger.info(f"Registered service '{name}' with priority {startup_priority}")
    
    async def initialize_all(self, timeout: float = 30.0) -> bool:
        """Initialize all registered services in parallel."""
        if self._initialized:
            logger.warning("Services already initialized")
            return True
        
        logger.info("Starting service initialization...")
        start_time = asyncio.get_event_loop().time()
        
        # Group services by priority for parallel initialization
        priority_groups: Dict[int, List[str]] = {}
        for name in self._startup_order:
            if name in self._services:
                priority = self._services[name].config.get("startup_priority", 0)
                if priority not in priority_groups:
                    priority_groups[priority] = []
                priority_groups[priority].append(name)
        
        try:
            # Initialize services by priority groups
            for priority in sorted(priority_groups.keys(), reverse=True):
                group_services = priority_groups[priority]
                logger.info(f"Initializing services with priority {priority}: {group_services}")
                
                # Initialize services in this group in parallel
                tasks = []
                for name in group_services:
                    service_info = self._services[name]
                    if service_info.startup_func:
                        service_info.status = ServiceStatus.INITIALIZING
                        task = self._initialize_service(name)
                        tasks.append(task)
                
                if tasks:
                    await asyncio.wait_for(
                        asyncio.gather(*tasks, return_exceptions=True),
                        timeout=timeout
                    )
            
            self._initialized = True
            total_time = asyncio.get_event_loop().time() - start_time
            logger.info(f"All services initialized successfully in {total_time:.2f}s")
            return True
            
        except asyncio.TimeoutError:
            logger.error(f"Service initialization timeout after {timeout}s")
            return False
        except Exception as e:
            logger.error(f"Service initialization failed: {e}")
            return False
    
    async def shutdown_all(self, timeout: float = 10.0) -> bool:
        """Shutdown all services gracefully."""
        if not self._initialized:
            logger.info("No services to shutdown")
            return True
        
        logger.info("Starting service shutdown...")
        start_time = asyncio.get_event_loop().time()
        
        try:
            # Shutdown services in reverse order
            tasks = []
            for name in self._shutdown_order:
                if name in self._services:
                    service_info = self._services[name]
                    if service_info.shutdown_func and service_info.status == ServiceStatus.RUNNING:
                        service_info.status = ServiceStatus.STOPPING
                        task = self._shutdown_service(name)
                        tasks.append(task)
            
            if tasks:
                await asyncio.wait_for(
                    asyncio.gather(*tasks, return_exceptions=True),
                    timeout=timeout
                )
            
            self._initialized = False
            total_time = asyncio.get_event_loop().time() - start_time
            logger.info(f"All services shutdown successfully in {total_time:.2f}s")
            return True
            
        except asyncio.TimeoutError:
            logger.error(f"Service shutdown timeout after {timeout}s")
            return False
        except Exception as e:
            logger.error(f"Service shutdown failed: {e}")
            return False
    
    async def _initialize_service(self, name: str) -> bool:
        """Initialize a single service."""
        service_info = self._services[name]
        
        try:
            logger.info(f"Initializing service '{name}'...")
            start_time = asyncio.get_event_loop().time()
            
            if service_info.startup_func:
                success = await service_info.startup_func(service_info.config)
                if success:
                    service_info.status = ServiceStatus.RUNNING
                    service_info.startup_time = asyncio.get_event_loop().time() - start_time
                    logger.info(f"Service '{name}' initialized successfully in {service_info.startup_time:.2f}s")
                    return True
                else:
                    service_info.status = ServiceStatus.ERROR
                    service_info.error = Exception(f"Service '{name}' startup function returned False")
                    logger.error(f"Service '{name}' initialization failed")
                    return False
            else:
                service_info.status = ServiceStatus.RUNNING
                logger.info(f"Service '{name}' marked as running (no startup function)")
                return True
                
        except Exception as e:
            service_info.status = ServiceStatus.ERROR
            service_info.error = e
            logger.error(f"Service '{name}' initialization failed: {e}")
            return False
    
    async def _shutdown_service(self, name: str) -> bool:
        """Shutdown a single service."""
        service_info = self._services[name]
        
        try:
            logger.info(f"Shutting down service '{name}'...")
            
            if service_info.shutdown_func:
                await service_info.shutdown_func()
            
            service_info.status = ServiceStatus.STOPPED
            logger.info(f"Service '{name}' shutdown successfully")
            return True
            
        except Exception as e:
            service_info.status = ServiceStatus.ERROR
            service_info.error = e
            logger.error(f"Service '{name}' shutdown failed: {e}")
            return False
    
    async def health_check_all(self) -> Dict[str, bool]:
        """Perform health checks on all services."""
        results = {}
        
        for name, service_info in self._services.items():
            if service_info.health_check_func and service_info.status == ServiceStatus.RUNNING:
                try:
                    is_healthy = await service_info.health_check_func()
                    results[name] = is_healthy
                    service_info.last_health_check = asyncio.get_event_loop().time()
                except Exception as e:
                    logger.error(f"Health check failed for service '{name}': {e}")
                    results[name] = False
            else:
                results[name] = service_info.status == ServiceStatus.RUNNING
        
        return results
    
    def get_service_status(self, name: str) -> Optional[ServiceStatus]:
        """Get the status of a specific service."""
        if name in self._services:
            return self._services[name].status
        return None
    
    def get_all_status(self) -> Dict[str, ServiceStatus]:
        """Get the status of all services."""
        return {name: info.status for name, info in self._services.items()}
    
    def get_service_info(self, name: str) -> Optional[ServiceInfo]:
        """Get detailed information about a service."""
        return self._services.get(name)
    
    def is_healthy(self) -> bool:
        """Check if all critical services are healthy."""
        for name, service_info in self._services.items():
            if service_info.status not in [ServiceStatus.RUNNING, ServiceStatus.UNINITIALIZED]:
                return False
        return True


# Global service registry instance
_service_registry: Optional[ServiceRegistry] = None


def get_service_registry() -> ServiceRegistry:
    """Get the global service registry instance."""
    global _service_registry
    if _service_registry is None:
        _service_registry = ServiceRegistry()
    return _service_registry


@asynccontextmanager
async def service_lifespan():
    """Context manager for service lifecycle management."""
    registry = get_service_registry()
    
    try:
        # Initialize all services
        success = await registry.initialize_all()
        if not success:
            raise RuntimeError("Service initialization failed")
        
        yield registry
        
    finally:
        # Shutdown all services
        await registry.shutdown_all()
