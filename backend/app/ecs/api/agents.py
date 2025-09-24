"""ECS Agent Management API
========================

Agent lifecycle, breeding, and interaction endpoints.
"""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..postgres_service import PostgresECSWorldService, get_postgres_ecs_service

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/agents", tags=["ECS Agents"])


class AgentCreateRequest(BaseModel):
    """Request model for creating a new agent in the ECS service."""

    agent_id: str
    spirit: str | None = "fox"
    style: str | None = "foundation"
    name: str | None = None


class OffspringCreateRequest(BaseModel):
    """Request model for creating offspring from two parent agents."""

    parent1_id: str
    parent2_id: str
    offspring_id: str


class AgentResponse(BaseModel):
    """Response model for agent information."""

    agent_id: str
    name: str
    spirit: str
    style: str
    active: bool


class PositionResponse(BaseModel):
    """Response model for agent position and movement data."""

    agent_id: str
    x: float
    y: float
    target_x: float
    target_y: float
    velocity_x: float
    velocity_y: float
    movement_speed: float


class MoveRequest(BaseModel):
    """Request model for moving an agent to specific coordinates."""

    x: float
    y: float


class MoveTowardsRequest(BaseModel):
    """Request model for moving an agent towards another agent."""

    target_agent_id: str
    distance: float = 50.0


class InteractionRequest(BaseModel):
    """Request model for initiating an interaction between agents."""

    agent2_id: str
    interaction_type: str = "communication"


class ChatRequest(BaseModel):
    """Request model for sending a chat message between agents."""

    receiver_id: str
    message: str
    interaction_type: str = "communication"


# Agent Management Endpoints


@router.get("", response_model=list[AgentResponse])
async def get_agents() -> list[AgentResponse]:
    """Get all agents in the service."""
    try:
        service = get_postgres_ecs_service()
        agents_data = await service.get_all_agents()

        return [
            AgentResponse(
                agent_id=agent_data["agent_id"],
                name=agent_data["name"],
                spirit=agent_data["spirit"],
                style=agent_data["style"],
                active=agent_data["active"],
            )
            for agent_data in agents_data
        ]
    except Exception as e:
        logger.exception("Error getting agents")
        raise HTTPException(status_code=500, detail="Failed to get agents") from e


@router.get("/search")
async def search_agents(
    query: str,
    exact_match: bool = False,
    service: PostgresECSWorldService = Depends(get_postgres_ecs_service),
) -> dict[str, Any]:
    """Search for agents by name or ID with flexible matching."""
    try:
        agents_data = await service.get_all_agents()
        
        # Filter agents based on query
        if exact_match:
            matching_agents = [
                agent for agent in agents_data
                if agent["agent_id"] == query or agent["name"] == query
            ]
        else:
            query_lower = query.lower()
            matching_agents = [
                agent for agent in agents_data
                if (query_lower in agent["agent_id"].lower() or 
                    query_lower in agent["name"].lower() or
                    query_lower in agent["spirit"].lower())
            ]
        
        return {
            "query": query,
            "exact_match": exact_match,
            "results": matching_agents,
            "count": len(matching_agents)
        }
    except Exception as e:
        logger.exception("Error searching agents")
        raise HTTPException(status_code=500, detail="Failed to search agents") from e


@router.post("", response_model=AgentResponse)
async def create_agent(request: AgentCreateRequest) -> AgentResponse:
    """Create a new agent."""
    try:
        service = get_postgres_ecs_service()

        # Generate a name if none provided
        agent_name = request.name
        if not agent_name:
            # Generate a simple name using agent_id and spirit
            agent_name = f"{request.spirit}-{request.agent_id.split('-')[-1]}"

        agent_data = await service.create_agent(
            agent_id=request.agent_id,
            name=agent_name,
            spirit=request.spirit or "fox",
            style=request.style or "foundation",
        )

        return AgentResponse(
            agent_id=agent_data["agent_id"],
            name=agent_data["name"],
            spirit=agent_data["spirit"],
            style=agent_data["style"],
            active=agent_data["active"],
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.exception("Error creating agent")
        raise HTTPException(status_code=500, detail="Failed to create agent") from e


# Breeding Endpoints


@router.post("/offspring", response_model=AgentResponse)
async def create_offspring(request: OffspringCreateRequest) -> AgentResponse:
    """Create offspring from two parent agents."""
    try:
        service = get_postgres_ecs_service()
        offspring_data = await service.create_offspring(
            parent1_id=request.parent1_id,
            parent2_id=request.parent2_id,
            offspring_id=request.offspring_id,
        )

        return AgentResponse(
            agent_id=offspring_data["offspring_id"],
            name=offspring_data["name"],
            spirit=offspring_data["spirit"],
            style="foundation",  # Default style
            active=True,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error creating offspring")
        raise HTTPException(status_code=500, detail="Failed to create offspring") from e


@router.get("/{agent_id}/mates")
async def find_compatible_mates(
    agent_id: str,
    max_results: int = 5,
    service: PostgresECSWorldService = Depends(get_postgres_ecs_service),
) -> dict[str, Any]:
    """Find compatible mates for an agent."""
    try:
        mates = await service.find_compatible_mates(agent_id, max_results)
        return {"agent_id": agent_id, "compatible_mates": mates}
    except Exception as e:
        logger.exception("Error finding mates")
        raise HTTPException(
            status_code=500, detail="Failed to find compatible mates",
        ) from e


@router.get("/{agent1_id}/compatibility/{agent2_id}")
async def analyze_compatibility(
    agent1_id: str,
    agent2_id: str,
    service: PostgresECSWorldService = Depends(get_postgres_ecs_service),
) -> dict[str, Any]:
    """Analyze genetic compatibility between two agents."""
    try:
        return await service.analyze_compatibility(agent1_id, agent2_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error analyzing compatibility")
        raise HTTPException(
            status_code=500, detail="Failed to analyze compatibility",
        ) from e


@router.get("/{agent_id}/lineage")
async def get_agent_lineage(
    agent_id: str,
    depth: int = 3,
    service: PostgresECSWorldService = Depends(get_postgres_ecs_service),
):
    """Get agent family tree and lineage."""
    try:
        return await service.get_agent_lineage(agent_id, depth)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting agent lineage")
        raise HTTPException(
            status_code=500, detail="Failed to get agent lineage",
        ) from e


# Position and Movement Endpoints


@router.get("/{agent_id}/position", response_model=PositionResponse)
async def get_agent_position(
    agent_id: str, service: PostgresECSWorldService = Depends(get_postgres_ecs_service),
) -> PositionResponse:
    """Get the current position of an agent."""
    try:
        position_data = await service.get_agent_position(agent_id)
        return PositionResponse(
            agent_id=position_data["agent_id"],
            x=position_data["x"],
            y=position_data["y"],
            target_x=position_data["target_x"],
            target_y=position_data["target_y"],
            velocity_x=position_data["velocity_x"],
            velocity_y=position_data["velocity_y"],
            movement_speed=position_data["movement_speed"],
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting agent position")
        raise HTTPException(
            status_code=500, detail="Failed to get agent position",
        ) from e


@router.get("/positions")
async def get_all_agent_positions(
    service: PostgresECSWorldService = Depends(get_postgres_ecs_service),
) -> dict[str, Any]:
    """Get positions of all agents in the service."""
    try:
        return await service.get_all_agent_positions()
    except Exception as e:
        logger.exception("Error getting all agent positions")
        raise HTTPException(
            status_code=500, detail="Failed to get all agent positions",
        ) from e


@router.post("/{agent_id}/move", response_model=PositionResponse)
async def move_agent(
    agent_id: str,
    request: MoveRequest,
    service: PostgresECSWorldService = Depends(get_postgres_ecs_service),
):
    """Move an agent to a specific position."""
    try:
        position_data = await service.move_agent(agent_id, request.x, request.y)
        return PositionResponse(
            agent_id=position_data["agent_id"],
            x=position_data["x"],
            y=position_data["y"],
            target_x=position_data["target_x"],
            target_y=position_data["target_y"],
            velocity_x=position_data["velocity_x"],
            velocity_y=position_data["velocity_y"],
            movement_speed=position_data["movement_speed"],
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error moving agent")
        raise HTTPException(status_code=500, detail="Failed to move agent") from e


@router.post("/{agent_id}/move_towards", response_model=PositionResponse)
async def move_agent_towards(
    agent_id: str,
    request: MoveTowardsRequest,
    service: PostgresECSWorldService = Depends(get_postgres_ecs_service),
):
    """Move an agent towards another agent."""
    try:
        position_data = await service.move_agent_towards(
            agent_id, request.target_agent_id, request.distance,
        )
        return PositionResponse(
            agent_id=position_data["agent_id"],
            x=position_data["x"],
            y=position_data["y"],
            target_x=position_data["target_x"],
            target_y=position_data["target_y"],
            velocity_x=position_data["velocity_x"],
            velocity_y=position_data["velocity_y"],
            movement_speed=position_data["movement_speed"],
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error moving agent towards target")
        raise HTTPException(
            status_code=500, detail="Failed to move agent towards target",
        ) from e


@router.get("/{agent1_id}/distance/{agent2_id}")
async def get_agent_distance(
    agent1_id: str,
    agent2_id: str,
    service: PostgresECSWorldService = Depends(get_postgres_ecs_service),
):
    """Get the distance between two agents."""
    try:
        return await service.get_agent_distance(agent1_id, agent2_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting agent distance")
        raise HTTPException(
            status_code=500, detail="Failed to get agent distance",
        ) from e


@router.get("/{agent_id}/nearby")
async def get_nearby_agents(
    agent_id: str,
    radius: float = 100.0,
    service: PostgresECSWorldService = Depends(get_postgres_ecs_service),
):
    """Get all agents within a certain radius of an agent."""
    try:
        nearby_agents = await service.get_nearby_agents(agent_id, radius)
        return {
            "agent_id": agent_id,
            "radius": radius,
            "nearby_agents": nearby_agents,
            "count": len(nearby_agents),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting nearby agents")
        raise HTTPException(
            status_code=500, detail="Failed to get nearby agents",
        ) from e


# Interaction and Communication Endpoints


@router.post("/{agent_id}/interact")
async def initiate_interaction(
    agent_id: str,
    request: InteractionRequest,
    service: PostgresECSWorldService = Depends(get_postgres_ecs_service),
):
    """Initiate an interaction between two agents."""
    try:
        return await service.initiate_interaction(
            agent_id, request.agent2_id, request.interaction_type,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error initiating interaction")
        raise HTTPException(
            status_code=500, detail="Failed to initiate interaction",
        ) from e


@router.post("/{agent_id}/chat")
async def send_chat_message(agent_id: str, request: ChatRequest) -> dict[str, Any]:
    """Send a chat message from one agent to another."""
    try:
        service = get_postgres_ecs_service()
        return await service.send_message(
            sender_id=agent_id,
            receiver_id=request.receiver_id,
            message=request.message,
            interaction_type=request.interaction_type,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error sending chat message")
        raise HTTPException(
            status_code=500, detail="Failed to send chat message",
        ) from e


@router.get("/{agent_id}/interactions")
async def get_interaction_history(
    agent_id: str,
    limit: int = 10,
    service: PostgresECSWorldService = Depends(get_postgres_ecs_service),
) -> dict[str, Any]:
    """Get the interaction history for an agent."""
    try:
        interactions = await service.get_agent_interactions(agent_id, limit)
        return {
            "interactions": interactions,
            "total_count": len(interactions),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting interaction history")
        raise HTTPException(
            status_code=500, detail="Failed to get interaction history",
        ) from e


@router.get("/{agent_id}/relationships")
async def get_agent_relationships(
    agent_id: str, service: PostgresECSWorldService = Depends(get_postgres_ecs_service),
):
    """Get all relationships for an agent."""
    try:
        return await service.get_agent_relationships(agent_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting agent relationships")
        raise HTTPException(
            status_code=500, detail="Failed to get agent relationships",
        ) from e


@router.get("/{agent_id}/social_stats")
async def get_agent_social_stats(
    agent_id: str, service: PostgresECSWorldService = Depends(get_postgres_ecs_service),
):
    """Get social interaction statistics for an agent."""
    try:
        # Get interaction history to calculate stats
        interactions = await service.get_agent_interactions(agent_id, limit=1000)

        total_interactions = len(interactions)
        successful_interactions = len(
            [i for i in interactions if i.get("energy_level", 0) > 0],
        )
        failed_interactions = total_interactions - successful_interactions
        success_rate = (
            successful_interactions / total_interactions
            if total_interactions > 0
            else 0.0
        )

        return {
            "total_interactions": total_interactions,
            "successful_interactions": successful_interactions,
            "failed_interactions": failed_interactions,
            "success_rate": success_rate,
            "social_energy": 1.0,
            "max_social_energy": 1.0,
            "energy_percentage": 1.0,
            "active_interactions": 0,
            "total_relationships": 0,
            "positive_relationships": 0,
            "negative_relationships": 0,
            "communication_style": "casual",
        }
    except Exception as e:
        logger.exception("Error getting agent social stats")
        raise HTTPException(
            status_code=500, detail="Failed to get agent social stats",
        ) from e
