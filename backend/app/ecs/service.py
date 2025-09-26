"""ECS World Service for FastAPI Backend

Provides singleton ECS world service integration with the Reynard backend.
"""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI

from .world import AgentWorld

# Import will be done dynamically to avoid circular imports

logger = logging.getLogger(__name__)


class ECSWorldService:
    """ECS World service for FastAPI backend integration.

    Provides singleton access to the ECS world and manages its lifecycle
    within the FastAPI application.
    """

    def __init__(self, data_dir: Path | None = None):
        """Initialize the ECS world service.

        Args:
            data_dir: Directory for persistent data storage

        """
        self.data_dir = data_dir or Path(__file__).parent.parent.parent / "data"
        self.data_dir.mkdir(exist_ok=True)
        self._world: AgentWorld | None = None
        self.rbac_service: Optional[RBACWorldService] = None

    async def startup(self) -> None:
        """Initialize the ECS world on application startup."""
        try:
            logger.info("🌍 Initializing ECS World Service")

            # Initialize RBAC service (dynamic import to avoid circular imports)
            from app.services.ecs.world.rbac_world_service import RBACWorldService

            self.rbac_service = RBACWorldService()
            await self.rbac_service.initialize()

            # Create the world instance
            self._world = AgentWorld(data_dir=self.data_dir, world_id="default_world")
            self._world.set_owner("system")  # Set system as default owner

            # Start the world simulation
            # Note: The new AgentWorld doesn't have start_global_breeding method
            # This will be handled by the systems during update cycles

            logger.info("✅ ECS World Service initialized successfully")

        except Exception as e:
            logger.error(f"❌ Failed to initialize ECS World Service: {e}")
            raise

    async def shutdown(self) -> None:
        """Cleanup the ECS world on application shutdown."""
        try:
            if self._world:
                logger.info("🌍 Shutting down ECS World Service")
                # Save agents before shutdown
                self._world.save_agents()
                self._world = None
                logger.info("✅ ECS World Service shutdown complete")
        except Exception as e:
            logger.error(f"❌ Error during ECS World Service shutdown: {e}")

    def get_world(self) -> AgentWorld:
        """Get the ECS world instance.

        Returns:
            The AgentWorld instance

        Raises:
            RuntimeError: If the world is not initialized

        """
        if self._world is None:
            raise RuntimeError("ECS World Service not initialized")
        return self._world

    async def get_world_with_rbac(
        self, user_id: str, world_id: str = "default_world"
    ) -> Optional[AgentWorld]:
        """Get the ECS world instance with RBAC permission checks.

        Args:
            user_id: ID of the user requesting access
            world_id: ID of the world to access

        Returns:
            The AgentWorld instance if user has permission, None otherwise

        """
        if not self.rbac_service:
            logger.warning(
                "RBAC service not initialized, falling back to direct access"
            )
            return self.get_world()

        return await self.rbac_service.get_world(user_id, world_id)

    async def create_agent_with_rbac(
        self,
        user_id: str,
        world_id: str,
        agent_id: str,
        spirit: str = "fox",
        style: str = "foundation",
        name: Optional[str] = None,
    ) -> Optional[Any]:
        """Create a new agent with RBAC permission checks.

        Args:
            user_id: ID of the user creating the agent
            world_id: ID of the world to create the agent in
            agent_id: ID for the new agent
            spirit: Animal spirit for the agent
            style: Naming style for the agent
            name: Optional custom name for the agent

        Returns:
            The created agent entity if successful, None otherwise

        """
        if not self.rbac_service:
            logger.warning(
                "RBAC service not initialized, falling back to direct creation"
            )
            return self._world.create_agent(agent_id, spirit, style, name, user_id)

        return await self.rbac_service.create_agent(
            user_id=user_id,
            world_id=world_id,
            agent_id=agent_id,
            spirit=spirit,
            style=style,
            name=name,
        )

    async def control_simulation_with_rbac(
        self, user_id: str, world_id: str, operation: str, **kwargs
    ) -> bool:
        """Control simulation with RBAC permission checks.

        Args:
            user_id: ID of the user controlling the simulation
            world_id: ID of the world to control
            operation: Simulation operation to perform
            **kwargs: Additional operation parameters

        Returns:
            True if operation was successful, False otherwise

        """
        if not self.rbac_service:
            logger.warning("RBAC service not initialized, allowing operation")
            return True

        return await self.rbac_service.control_simulation(
            user_id=user_id, world_id=world_id, operation=operation, **kwargs
        )

    async def share_world_with_rbac(
        self,
        user_id: str,
        world_id: str,
        target_user_id: str,
        permission_level: str = "view",
    ) -> bool:
        """Share a world with another user with RBAC permission checks.

        Args:
            user_id: ID of the user sharing the world
            world_id: ID of the world to share
            target_user_id: ID of the user to share with
            permission_level: Level of permission to grant

        Returns:
            True if sharing was successful, False otherwise

        """
        if not self.rbac_service:
            logger.warning("RBAC service not initialized, allowing sharing")
            return True

        return await self.rbac_service.share_world(
            user_id=user_id,
            world_id=world_id,
            target_user_id=target_user_id,
            permission_level=permission_level,
        )

    async def get_world_list_with_rbac(self, user_id: str) -> List[Dict[str, Any]]:
        """Get list of worlds accessible to user with RBAC permission checks.

        Args:
            user_id: ID of the user requesting the list

        Returns:
            List of worlds accessible to the user

        """
        if not self.rbac_service:
            logger.warning("RBAC service not initialized, returning default world")
            return [
                {
                    "world_id": "default_world",
                    "is_owner": True,
                    "is_collaborator": False,
                }
            ]

        return await self.rbac_service.get_world_list(user_id)

    def get_world_status(self) -> dict[str, Any]:
        """Get the current world status.

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

        world_stats = self._world.get_world_stats()
        return {
            "status": "active",
            "entity_count": world_stats["total_agents"],
            "system_count": world_stats["systems_active"],
            "agent_count": world_stats["total_agents"],
            "mature_agents": world_stats["total_agents"],  # Simplified for now
            "generation_distribution": world_stats["generation_distribution"],
            "spirit_distribution": world_stats["spirit_distribution"],
            "current_time": world_stats["current_time"],
        }


# Global service instance
_ecs_service: ECSWorldService | None = None


def get_ecs_service() -> ECSWorldService:
    """Get the singleton ECS world service.

    Returns:
        The ECSWorldService instance

    """
    global _ecs_service
    if _ecs_service is None:
        _ecs_service = ECSWorldService()
    return _ecs_service


def get_ecs_world() -> AgentWorld:
    """Get the ECS world instance from the service.

    Returns:
        The AgentWorld instance

    """
    return get_ecs_service().get_world()


def register_ecs_service(app: FastAPI) -> None:
    """Register the ECS world service with the FastAPI application.

    Note: This function is deprecated in favor of lifespan manager integration.
    The ECS service should be registered through the service registry in lifespan_manager.py.

    Args:
        app: The FastAPI application instance

    """
    # This function is kept for backward compatibility but does nothing
    # The ECS service is now managed through the lifespan manager
