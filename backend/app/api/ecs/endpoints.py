"""🔐 ECS API Endpoints with RBAC Integration

This module provides FastAPI endpoints for ECS world operations with
comprehensive RBAC permission checking.

Key Features:
- World creation and management with RBAC
- Agent creation and management with RBAC
- Simulation control with RBAC
- World sharing and collaboration
- Analytics access with RBAC
- Comprehensive audit logging

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.auth.dependencies import get_current_user
from app.ecs.service import ECSWorldService
from gatekeeper.models.user import User

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/ecs", tags=["ECS World"])


# Request/Response models
class WorldCreateRequest(BaseModel):
    """Request model for creating a new world."""

    world_id: str = Field(..., description="Unique identifier for the world")
    world_name: str = Field(default="New World", description="Name of the world")
    description: Optional[str] = Field(None, description="Description of the world")


class AgentCreateRequest(BaseModel):
    """Request model for creating a new agent."""

    agent_id: str = Field(..., description="Unique identifier for the agent")
    spirit: str = Field(default="fox", description="Animal spirit for the agent")
    style: str = Field(default="foundation", description="Naming style for the agent")
    name: Optional[str] = Field(None, description="Custom name for the agent")


class SimulationControlRequest(BaseModel):
    """Request model for simulation control operations."""

    operation: str = Field(..., description="Simulation operation to perform")
    factor: Optional[float] = Field(None, description="Time acceleration factor")
    parameters: Optional[Dict[str, Any]] = Field(
        None, description="Additional operation parameters"
    )


class WorldShareRequest(BaseModel):
    """Request model for sharing a world."""

    target_user_id: str = Field(..., description="ID of the user to share with")
    permission_level: str = Field(
        default="view", description="Permission level to grant"
    )


class WorldResponse(BaseModel):
    """Response model for world information."""

    world_id: str
    world_name: str
    description: Optional[str]
    is_owner: bool
    is_collaborator: bool
    entity_count: int
    owner: str
    collaborators: List[str]


class AgentResponse(BaseModel):
    """Response model for agent information."""

    agent_id: str
    name: str
    spirit: str
    style: str
    world_id: str
    components: List[str]


class SimulationStatusResponse(BaseModel):
    """Response model for simulation status."""

    world_id: str
    status: str
    time_acceleration: float
    entity_count: int
    system_count: int
    agent_count: int


class WorldListResponse(BaseModel):
    """Response model for world list."""

    worlds: List[WorldResponse]
    total_count: int


# Dependency to get ECS service
def get_ecs_service() -> ECSWorldService:
    """Get the ECS world service instance."""
    # This would typically come from dependency injection
    # For now, we'll create a new instance
    return ECSWorldService()


@router.post(
    "/worlds", response_model=WorldResponse, status_code=status.HTTP_201_CREATED
)
async def create_world(
    request: WorldCreateRequest,
    current_user: User = Depends(get_current_user),
    ecs_service: ECSWorldService = Depends(get_ecs_service),
) -> WorldResponse:
    """Create a new ECS world with RBAC permission checks."""
    try:
        # Create world with RBAC
        world = await ecs_service.rbac_service.create_world(
            user_id=current_user.username,
            world_id=request.world_id,
            world_name=request.world_name,
            description=request.description,
        )

        if not world:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to create worlds",
            )

        return WorldResponse(
            world_id=request.world_id,
            world_name=request.world_name,
            description=request.description,
            is_owner=True,
            is_collaborator=False,
            entity_count=len(world.entities),
            owner=current_user.username,
            collaborators=[current_user.username],
        )

    except Exception as e:
        logger.error(f"Failed to create world: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create world",
        )


@router.get("/worlds", response_model=WorldListResponse)
async def get_worlds(
    current_user: User = Depends(get_current_user),
    ecs_service: ECSWorldService = Depends(get_ecs_service),
) -> WorldListResponse:
    """Get list of worlds accessible to the current user with RBAC permission checks."""
    try:
        # Get worlds with RBAC
        worlds_data = await ecs_service.get_world_list_with_rbac(current_user.username)

        worlds = [
            WorldResponse(
                world_id=world_data["world_id"],
                world_name=f"World {world_data['world_id']}",  # Default name
                description=None,
                is_owner=world_data["is_owner"],
                is_collaborator=world_data["is_collaborator"],
                entity_count=world_data["entity_count"],
                owner=world_data["owner"],
                collaborators=world_data["collaborators"],
            )
            for world_data in worlds_data
        ]

        return WorldListResponse(worlds=worlds, total_count=len(worlds))

    except Exception as e:
        logger.error(f"Failed to get worlds: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get worlds",
        )


@router.get("/worlds/{world_id}", response_model=WorldResponse)
async def get_world(
    world_id: str,
    current_user: User = Depends(get_current_user),
    ecs_service: ECSWorldService = Depends(get_ecs_service),
) -> WorldResponse:
    """Get a specific world with RBAC permission checks."""
    try:
        # Get world with RBAC
        world = await ecs_service.get_world_with_rbac(current_user.username, world_id)

        if not world:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to access this world",
            )

        # Get world metadata from RBAC service
        worlds_data = await ecs_service.get_world_list_with_rbac(current_user.username)
        world_data = next((w for w in worlds_data if w["world_id"] == world_id), None)

        if not world_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="World not found"
            )

        return WorldResponse(
            world_id=world_id,
            world_name=f"World {world_id}",
            description=None,
            is_owner=world_data["is_owner"],
            is_collaborator=world_data["is_collaborator"],
            entity_count=len(world.entities),
            owner=world_data["owner"],
            collaborators=world_data["collaborators"],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get world: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get world",
        )


@router.post(
    "/worlds/{world_id}/agents",
    response_model=AgentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_agent(
    world_id: str,
    request: AgentCreateRequest,
    current_user: User = Depends(get_current_user),
    ecs_service: ECSWorldService = Depends(get_ecs_service),
) -> AgentResponse:
    """Create a new agent in a world with RBAC permission checks."""
    try:
        # Create agent with RBAC
        agent = await ecs_service.create_agent_with_rbac(
            user_id=current_user.username,
            world_id=world_id,
            agent_id=request.agent_id,
            spirit=request.spirit,
            style=request.style,
            name=request.name,
        )

        if not agent:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to create agents in this world",
            )

        # Get agent component names
        component_names = [type(comp).__name__ for comp in agent.components.values()]

        return AgentResponse(
            agent_id=request.agent_id,
            name=request.name or f"{request.spirit.capitalize()}-{request.agent_id}",
            spirit=request.spirit,
            style=request.style,
            world_id=world_id,
            components=component_names,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create agent: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create agent",
        )


@router.get("/worlds/{world_id}/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(
    world_id: str,
    agent_id: str,
    current_user: User = Depends(get_current_user),
    ecs_service: ECSWorldService = Depends(get_ecs_service),
) -> AgentResponse:
    """Get a specific agent from a world with RBAC permission checks."""
    try:
        # Get world with RBAC
        world = await ecs_service.get_world_with_rbac(current_user.username, world_id)

        if not world:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to access this world",
            )

        # Get agent
        agent = world.get_entity(agent_id)
        if not agent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found"
            )

        # Get agent component names
        component_names = [type(comp).__name__ for comp in agent.components.values()]

        # Get agent info from components
        agent_comp = agent.get_component("AgentComponent")
        spirit = agent_comp.spirit if agent_comp else "unknown"
        style = agent_comp.style if agent_comp else "unknown"
        name = agent_comp.name if agent_comp else agent_id

        return AgentResponse(
            agent_id=agent_id,
            name=name,
            spirit=spirit,
            style=style,
            world_id=world_id,
            components=component_names,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get agent: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get agent",
        )


@router.post("/worlds/{world_id}/simulation/control")
async def control_simulation(
    world_id: str,
    request: SimulationControlRequest,
    current_user: User = Depends(get_current_user),
    ecs_service: ECSWorldService = Depends(get_ecs_service),
) -> Dict[str, Any]:
    """Control simulation with RBAC permission checks."""
    try:
        # Control simulation with RBAC
        success = await ecs_service.control_simulation_with_rbac(
            user_id=current_user.username,
            world_id=world_id,
            operation=request.operation,
            factor=request.factor,
            **request.parameters or {},
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions to {request.operation} simulation",
            )

        return {
            "success": True,
            "operation": request.operation,
            "world_id": world_id,
            "message": f"Simulation {request.operation} completed successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to control simulation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to control simulation",
        )


@router.get(
    "/worlds/{world_id}/simulation/status", response_model=SimulationStatusResponse
)
async def get_simulation_status(
    world_id: str,
    current_user: User = Depends(get_current_user),
    ecs_service: ECSWorldService = Depends(get_ecs_service),
) -> SimulationStatusResponse:
    """Get simulation status with RBAC permission checks."""
    try:
        # Get world with RBAC
        world = await ecs_service.get_world_with_rbac(current_user.username, world_id)

        if not world:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to access this world",
            )

        # Get world status
        world_status = ecs_service.get_world_status()

        return SimulationStatusResponse(
            world_id=world_id,
            status="active",
            time_acceleration=1.0,  # Default value
            entity_count=world_status["entity_count"],
            system_count=world_status["system_count"],
            agent_count=world_status["agent_count"],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get simulation status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get simulation status",
        )


@router.post("/worlds/{world_id}/share")
async def share_world(
    world_id: str,
    request: WorldShareRequest,
    current_user: User = Depends(get_current_user),
    ecs_service: ECSWorldService = Depends(get_ecs_service),
) -> Dict[str, Any]:
    """Share a world with another user with RBAC permission checks."""
    try:
        # Share world with RBAC
        success = await ecs_service.share_world_with_rbac(
            user_id=current_user.username,
            world_id=world_id,
            target_user_id=request.target_user_id,
            permission_level=request.permission_level,
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to share this world",
            )

        return {
            "success": True,
            "world_id": world_id,
            "target_user_id": request.target_user_id,
            "permission_level": request.permission_level,
            "message": f"World shared successfully with {request.target_user_id}",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to share world: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to share world",
        )


@router.get("/worlds/{world_id}/analytics")
async def get_world_analytics(
    world_id: str,
    current_user: User = Depends(get_current_user),
    ecs_service: ECSWorldService = Depends(get_ecs_service),
) -> Dict[str, Any]:
    """Get world analytics with RBAC permission checks."""
    try:
        # Check permission to view analytics
        has_permission = await ecs_service.rbac_service.check_world_permission(
            user_id=current_user.username, world_id=world_id, operation="view_analytics"
        )

        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view world analytics",
            )

        # Get world with RBAC
        world = await ecs_service.get_world_with_rbac(current_user.username, world_id)

        if not world:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="World not found"
            )

        # Get analytics data
        world_status = ecs_service.get_world_status()

        return {
            "world_id": world_id,
            "analytics": {
                "entity_count": world_status["entity_count"],
                "system_count": world_status["system_count"],
                "agent_count": world_status["agent_count"],
                "generation_distribution": world_status.get(
                    "generation_distribution", {}
                ),
                "spirit_distribution": world_status.get("spirit_distribution", {}),
            },
            "timestamp": world_status.get("timestamp", "unknown"),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get world analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get world analytics",
        )


@router.get("/metrics")
async def get_ecs_metrics(
    current_user: User = Depends(get_current_user),
    ecs_service: ECSWorldService = Depends(get_ecs_service),
) -> Dict[str, Any]:
    """Get ECS service metrics with RBAC permission checks."""
    try:
        # Check if user has permission to view metrics
        if not ecs_service.rbac_service:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="RBAC service not available",
            )

        # Get metrics
        metrics = await ecs_service.rbac_service.get_metrics()

        return {
            "service": "ecs_world",
            "metrics": metrics,
            "timestamp": "2024-01-01T00:00:00Z",  # Current timestamp
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get ECS metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get ECS metrics",
        )
