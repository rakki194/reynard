"""
ECS World Service for FastAPI Backend

Provides singleton ECS world service integration with the Reynard backend.
"""

import logging
from typing import Dict, Any, List
from pathlib import Path

from fastapi import FastAPI
from reynard_ecs_world import AgentWorld, get_world_instance, set_world_instance

logger = logging.getLogger(__name__)


class ECSWorldService:
    """
    ECS World service for FastAPI backend integration.
    
    Provides singleton access to the ECS world and manages its lifecycle
    within the FastAPI application.
    """

    def __init__(self, data_dir: Path | None = None):
        """
        Initialize the ECS world service.
        
        Args:
            data_dir: Directory for persistent data storage
        """
        self.data_dir = data_dir or Path(__file__).parent.parent.parent / "data"
        self.data_dir.mkdir(exist_ok=True)
        self._world: AgentWorld | None = None

    async def startup(self) -> None:
        """Initialize the ECS world on application startup."""
        try:
            logger.info("🌍 Initializing ECS World Service")
            
            # Create the world instance
            self._world = AgentWorld(data_dir=self.data_dir)
            
            # Set as singleton
            set_world_instance(self._world)
            
            # Start the world simulation
            await self._world.start_global_breeding()
            
            logger.info("✅ ECS World Service initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize ECS World Service: {e}")
            raise

    async def shutdown(self) -> None:
        """Cleanup the ECS world on application shutdown."""
        try:
            if self._world:
                logger.info("🌍 Shutting down ECS World Service")
                await self._world.stop_global_breeding()
                self._world = None
                logger.info("✅ ECS World Service shutdown complete")
        except Exception as e:
            logger.error(f"❌ Error during ECS World Service shutdown: {e}")

    def get_world(self) -> AgentWorld:
        """
        Get the ECS world instance.
        
        Returns:
            The AgentWorld instance
            
        Raises:
            RuntimeError: If the world is not initialized
        """
        if self._world is None:
            raise RuntimeError("ECS World Service not initialized")
        return self._world

    def get_world_status(self) -> Dict[str, Any]:
        """
        Get the current world status.
        
        Returns:
            Dictionary containing world status information
        """
        if self._world is None:
            return {
                "status": "not_initialized",
                "entity_count": 0,
                "system_count": 0,
                "agent_count": 0,
                "mature_agents": 0,
            }
        
        return {
            "status": "active",
            "entity_count": self._world.get_entity_count(),
            "system_count": self._world.get_system_count(),
            "agent_count": len(self._world.get_agent_entities()),
            "mature_agents": len(self._world.get_mature_agents()),
        }


# Global service instance
_ecs_service: ECSWorldService | None = None


def get_ecs_service() -> ECSWorldService:
    """
    Get the singleton ECS world service.
    
    Returns:
        The ECSWorldService instance
    """
    global _ecs_service
    if _ecs_service is None:
        _ecs_service = ECSWorldService()
    return _ecs_service


def get_ecs_world() -> AgentWorld:
    """
    Get the ECS world instance from the service.
    
    Returns:
        The AgentWorld instance
    """
    return get_ecs_service().get_world()


def register_ecs_service(app: FastAPI) -> None:
    """
    Register the ECS world service with the FastAPI application.
    
    Note: This function is deprecated in favor of lifespan manager integration.
    The ECS service should be registered through the service registry in lifespan_manager.py.
    
    Args:
        app: The FastAPI application instance
    """
    # This function is kept for backward compatibility but does nothing
    # The ECS service is now managed through the lifespan manager
    pass
