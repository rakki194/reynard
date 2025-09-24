"""Base Service Interface: Core service lifecycle and health monitoring.

This module defines the fundamental interface that all RAG services must implement,
providing consistent lifecycle management, health monitoring, and configuration handling.

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional

logger = logging.getLogger("uvicorn")


class ServiceStatus(Enum):
    """Service status enumeration."""
    
    UNINITIALIZED = "uninitialized"
    INITIALIZING = "initializing"
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    ERROR = "error"
    SHUTTING_DOWN = "shutting_down"
    SHUTDOWN = "shutdown"


@dataclass
class ServiceHealth:
    """Service health information."""
    
    status: ServiceStatus
    message: str
    last_updated: datetime
    metrics: Dict[str, Any]
    dependencies: Dict[str, ServiceStatus]


class BaseService(ABC):
    """Abstract base class for all RAG services.
    
    This class provides the fundamental interface that all RAG services must implement,
    ensuring consistent lifecycle management, health monitoring, and configuration handling.
    
    Key Features:
    - Standardized initialization and shutdown lifecycle
    - Health monitoring and status reporting
    - Configuration management
    - Dependency tracking
    - Error handling and recovery
    - Metrics collection and reporting
    
    All RAG services should inherit from this class and implement the required methods.
    """
    
    def __init__(self, name: str, config: Optional[Dict[str, Any]] = None):
        """Initialize the base service.
        
        Args:
            name: Service name for identification
            config: Service configuration dictionary
        """
        self.name = name
        self.config = config or {}
        self.status = ServiceStatus.UNINITIALIZED
        self.health = ServiceHealth(
            status=ServiceStatus.UNINITIALIZED,
            message="Service not initialized",
            last_updated=datetime.now(),
            metrics={},
            dependencies={}
        )
        self.dependencies: Dict[str, BaseService] = {}
        self.logger = logging.getLogger(f"rag.{name}")
        
    @abstractmethod
    async def initialize(self) -> bool:
        """Initialize the service.
        
        This method should:
        - Validate configuration
        - Initialize internal components
        - Establish connections to external services
        - Set up monitoring and metrics
        - Update service status
        
        Returns:
            bool: True if initialization successful, False otherwise
        """
        pass
    
    @abstractmethod
    async def shutdown(self) -> None:
        """Shutdown the service gracefully.
        
        This method should:
        - Stop all background tasks
        - Close connections to external services
        - Clean up resources
        - Update service status
        """
        pass
    
    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check and return current status.
        
        Returns:
            Dict[str, Any]: Current health status and metrics
        """
        pass
    
    @abstractmethod
    async def get_stats(self) -> Dict[str, Any]:
        """Get service statistics.
        
        Returns:
            Dict[str, Any]: Service statistics and metrics
        """
        pass
    
    def add_dependency(self, name: str, service: 'BaseService') -> None:
        """Add a service dependency.
        
        Args:
            name: Dependency name
            service: Service instance
        """
        self.dependencies[name] = service
        self.logger.info(f"Added dependency: {name}")
    
    def remove_dependency(self, name: str) -> None:
        """Remove a service dependency.
        
        Args:
            name: Dependency name
        """
        if name in self.dependencies:
            del self.dependencies[name]
            self.logger.info(f"Removed dependency: {name}")
    
    def get_dependency_status(self) -> Dict[str, ServiceStatus]:
        """Get status of all dependencies.
        
        Returns:
            Dict[str, ServiceStatus]: Dependency status mapping
        """
        return {
            name: service.status 
            for name, service in self.dependencies.items()
        }
    
    def update_status(self, status: ServiceStatus, message: str = "") -> None:
        """Update service status.
        
        Args:
            status: New service status
            message: Status message
        """
        self.status = status
        self.health.status = status
        self.health.message = message
        self.health.last_updated = datetime.now()
        self.health.dependencies = self.get_dependency_status()
        
        self.logger.info(f"Status updated: {status.value} - {message}")
    
    async def get_metrics(self) -> Dict[str, Any]:
        """Get service metrics.
        
        Returns:
            Dict[str, Any]: Service metrics
        """
        return {
            "name": self.name,
            "status": self.status.value,
            "health": {
                "status": self.health.status.value,
                "message": self.health.message,
                "last_updated": self.health.last_updated.isoformat(),
                "dependencies": {k: v.value for k, v in self.health.dependencies.items()}
            },
            "dependencies": list(self.dependencies.keys()),
            "config_keys": list(self.config.keys()) if self.config else []
        }
    
    def is_healthy(self) -> bool:
        """Check if service is healthy.
        
        Returns:
            bool: True if service is healthy
        """
        return self.status == ServiceStatus.HEALTHY
    
    def is_initialized(self) -> bool:
        """Check if service is initialized.
        
        Returns:
            bool: True if service is initialized
        """
        return self.status not in [ServiceStatus.UNINITIALIZED, ServiceStatus.SHUTDOWN]
    
    async def restart(self) -> bool:
        """Restart the service.
        
        Returns:
            bool: True if restart successful
        """
        try:
            self.logger.info("Restarting service...")
            await self.shutdown()
            return await self.initialize()
        except Exception as e:
            self.logger.error(f"Failed to restart service: {e}")
            return False
    
    def __repr__(self) -> str:
        """String representation of the service."""
        return f"{self.__class__.__name__}(name='{self.name}', status={self.status.value})"
