"""
ECS World API Endpoints

FastAPI endpoints for ECS world management and agent operations.
"""

import json
import logging
from pathlib import Path
from datetime import datetime

from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from .postgres_service import get_postgres_ecs_service, PostgresECSWorldService
from .success_advisor_genome import success_advisor_genome_service

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="", tags=["ECS World"])


# Pydantic models for API
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


class WorldStatusResponse(BaseModel):
    """Response model for ECS world status information."""

    status: str
    entity_count: int | None = None
    system_count: int | None = None
    agent_count: int | None = None
    mature_agents: int | None = None


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


class SpiritInhabitationRequest(BaseModel):
    """Request model for inhabiting Success-Advisor-8's spirit."""

    agent_id: str
    confirm_inhabitation: bool = True
    include_genomic_payload: bool = True
    include_instructions: bool = True


class InteractionResponse(BaseModel):
    """Response model for interaction data and outcomes."""

    interaction_id: str
    participants: list[str]
    interaction_type: str
    content: str
    outcome: str
    relationship_impact: float
    timestamp: str
    duration: float
    energy_cost: float


class RelationshipResponse(BaseModel):
    """Response model for agent relationship information."""

    agent_id: str
    relationship_type: str
    strength: float
    trust_level: float
    familiarity: float
    last_interaction: str
    interaction_count: int
    positive_interactions: int
    negative_interactions: int
    total_time_together: float


class SocialStatsResponse(BaseModel):
    """Response model for agent social interaction statistics."""

    total_interactions: int
    successful_interactions: int
    failed_interactions: int
    success_rate: float
    social_energy: float
    max_social_energy: float
    energy_percentage: float
    active_interactions: int
    total_relationships: int
    positive_relationships: int
    negative_relationships: int
    communication_style: str


class NearbyAgentResponse(BaseModel):
    """Response model for nearby agent information."""

    agent_id: str
    name: str
    spirit: str
    x: float
    y: float
    distance: float


# Dependency to get ECS world
def get_postgres_service() -> PostgresECSWorldService:
    """Get the PostgreSQL ECS service instance."""
    return get_postgres_ecs_service()


@router.get("/status", response_model=WorldStatusResponse)
async def get_postgres_service_status() -> WorldStatusResponse:
    """Get the current ECS world status."""
    try:
        service = get_postgres_ecs_service()
        status = await service.get_postgres_service_status()
        return WorldStatusResponse(**status)
    except Exception as e:
        logger.error("Error getting world status: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get world status") from e


@router.get("/agents", response_model=list[AgentResponse])
async def get_agents() -> list[AgentResponse]:
    """Get all agents in the service."""
    try:
        service = get_postgres_ecs_service()
        agents_data = await service.get_all_agents()
        
        agents = []
        for agent_data in agents_data:
            agents.append(
                AgentResponse(
                    agent_id=agent_data["agent_id"],
                    name=agent_data["name"],
                    spirit=agent_data["spirit"],
                    style=agent_data["style"],
                    active=agent_data["active"]
                )
            )
        return agents
    except Exception as e:
        logger.error("Error getting agents: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get agents") from e


@router.post("/agents", response_model=AgentResponse)
async def create_agent(request: AgentCreateRequest) -> AgentResponse:
    """Create a new agent."""
    try:
        service = get_postgres_ecs_service()
        agent_data = await service.create_agent(
            agent_id=request.agent_id,
            name=request.name,
            spirit=request.spirit,
            style=request.style
        )

        return AgentResponse(
            agent_id=agent_data["agent_id"],
            name=agent_data["name"],
            spirit=agent_data["spirit"],
            style=agent_data["style"],
            active=agent_data["active"]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.error("Error creating agent: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create agent") from e


# Offspring creation temporarily disabled - needs PostgreSQL implementation
# @router.post("/agents/offspring", response_model=AgentResponse)
# async def create_offspring(request: OffspringCreateRequest) -> AgentResponse:
#     """Create offspring from two parent agents."""
#     # TODO: Implement PostgreSQL-based offspring creation
#     raise HTTPException(status_code=501, detail="Offspring creation not yet implemented in PostgreSQL version")


# @router.get("/agents/{agent_id}/mates")
# async def find_compatible_mates(
#     agent_id: str, max_results: int = 5, service: PostgresECSWorldService = Depends(get_postgres_service)
# ) -> dict[str, Any]:
    """Find compatible mates for an agent."""
    try:
        mates = service.find_compatible_mates(agent_id, max_results)
        return {"agent_id": agent_id, "compatible_mates": mates}
    except Exception as e:
        logger.error("Error finding mates: %s", e)
        raise HTTPException(status_code=500, detail="Failed to find compatible mates") from e


@router.get("/agents/{agent1_id}/compatibility/{agent2_id}")
async def analyze_compatibility(
    agent1_id: str, agent2_id: str, service: PostgresECSWorldService = Depends(get_postgres_service)
) -> dict[str, Any]:
    """Analyze genetic compatibility between two agents."""
    try:
        compatibility = service.analyze_genetic_compatibility(agent1_id, agent2_id)
        return compatibility
    except Exception as e:
        logger.error("Error analyzing compatibility: %s", e)
        raise HTTPException(status_code=500, detail="Failed to analyze compatibility") from e


@router.get("/agents/{agent_id}/lineage")
async def get_agent_lineage(
    agent_id: str, depth: int = 3, service: PostgresECSWorldService = Depends(get_postgres_service)
):
    """Get agent family tree and lineage."""
    try:
        lineage = service.get_agent_lineage(agent_id, depth)
        return lineage
    except Exception as e:
        logger.error("Error getting lineage: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get agent lineage") from e


@router.post("/breeding/enable")
async def enable_breeding(enabled: bool = True, service: PostgresECSWorldService = Depends(get_postgres_service)) -> dict[str, str]:
    """Enable or disable automatic breeding."""
    try:
        service.enable_automatic_reproduction(enabled)
        return {"message": f"Automatic breeding {'enabled' if enabled else 'disabled'}"}
    except Exception as e:
        logger.error("Error toggling breeding: %s", e)
        raise HTTPException(status_code=500, detail="Failed to toggle breeding") from e


@router.get("/breeding/stats")
async def get_breeding_stats(world: PostgresECSWorldService = Depends(get_postgres_service)) -> dict[str, Any]:
    """Get breeding statistics."""
    try:
        stats = service.get_breeding_stats()
        return stats
    except Exception as e:
        logger.error("Error getting breeding stats: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get breeding statistics") from e


# Position and Movement Endpoints


@router.get("/agents/{agent_id}/position", response_model=PositionResponse)
async def get_agent_position(agent_id: str, service: PostgresECSWorldService = Depends(get_postgres_service)) -> PositionResponse:
    """Get the current position of an agent."""
    try:
        entity = service.get_entity(agent_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Agent not found")

        position_component = entity.get_component(PositionComponent)
        if not position_component:
            raise HTTPException(
                status_code=404, detail="Agent has no position component"
            )

        return PositionResponse(
            agent_id=agent_id,
            x=position_component.x,
            y=position_component.y,
            target_x=position_component.target_x,
            target_y=position_component.target_y,
            velocity_x=position_component.velocity_x,
            velocity_y=position_component.velocity_y,
            movement_speed=position_component.movement_speed,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting agent position: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get agent position") from e


@router.get("/agents/positions")
async def get_all_agent_positions(world: PostgresECSWorldService = Depends(get_postgres_service)) -> dict[str, Any]:
    """Get positions of all agents in the service."""
    try:
        positions = {}
        for entity in service.get_agent_entities():
            position_component = entity.get_component(PositionComponent)
            if position_component:
                positions[entity.id] = {
                    "x": position_component.x,
                    "y": position_component.y,
                    "target_x": position_component.target_x,
                    "target_y": position_component.target_y,
                    "velocity_x": position_component.velocity_x,
                    "velocity_y": position_component.velocity_y,
                    "movement_speed": position_component.movement_speed,
                }
        return {"positions": positions}
    except Exception as e:
        logger.error("Error getting all agent positions: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get agent positions") from e


@router.post("/agents/{agent_id}/move", response_model=PositionResponse)
async def move_agent(
    agent_id: str, request: MoveRequest, service: PostgresECSWorldService = Depends(get_postgres_service)
):
    """Move an agent to a specific position."""
    try:
        entity = service.get_entity(agent_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Agent not found")

        position_component = entity.get_component(PositionComponent)
        if not position_component:
            raise HTTPException(
                status_code=404, detail="Agent has no position component"
            )

        # Update target position
        position_component.target_x = request.x
        position_component.target_y = request.y

        return PositionResponse(
            agent_id=agent_id,
            x=position_component.x,
            y=position_component.y,
            target_x=position_component.target_x,
            target_y=position_component.target_y,
            velocity_x=position_component.velocity_x,
            velocity_y=position_component.velocity_y,
            movement_speed=position_component.movement_speed,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error moving agent: %s", e)
        raise HTTPException(status_code=500, detail="Failed to move agent") from e


@router.post("/agents/{agent_id}/move_towards", response_model=PositionResponse)
async def move_agent_towards(
    agent_id: str, request: MoveTowardsRequest, service: PostgresECSWorldService = Depends(get_postgres_service)
):
    """Move an agent towards another agent."""
    try:
        entity = service.get_entity(agent_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Agent not found")

        target_entity = service.get_entity(request.target_agent_id)
        if not target_entity:
            raise HTTPException(status_code=404, detail="Target agent not found")

        position_component = entity.get_component(PositionComponent)
        target_position_component = target_entity.get_component(PositionComponent)

        if not position_component or not target_position_component:
            raise HTTPException(
                status_code=404, detail="Agent or target has no position component"
            )

        # Calculate direction towards target
        dx = target_position_component.x - position_component.x
        dy = target_position_component.y - position_component.y
        distance = (dx * dx + dy * dy) ** 0.5

        if distance > 0:
            # Normalize direction and apply distance
            dx /= distance
            dy /= distance

            # Set target position at the specified distance from target
            position_component.target_x = (
                target_position_component.x - dx * request.distance
            )
            position_component.target_y = (
                target_position_component.y - dy * request.distance
            )

        return PositionResponse(
            agent_id=agent_id,
            x=position_component.x,
            y=position_component.y,
            target_x=position_component.target_x,
            target_y=position_component.target_y,
            velocity_x=position_component.velocity_x,
            velocity_y=position_component.velocity_y,
            movement_speed=position_component.movement_speed,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error moving agent towards target: %s", e)
        raise HTTPException(
            status_code=500, detail="Failed to move agent towards target"
        ) from e


@router.get("/agents/{agent1_id}/distance/{agent2_id}")
async def get_agent_distance(
    agent1_id: str, agent2_id: str, service: PostgresECSWorldService = Depends(get_postgres_service)
):
    """Get the distance between two agents."""
    try:
        entity1 = service.get_entity(agent1_id)
        entity2 = service.get_entity(agent2_id)

        if not entity1 or not entity2:
            raise HTTPException(status_code=404, detail="One or both agents not found")

        position1 = entity1.get_component(PositionComponent)
        position2 = entity2.get_component(PositionComponent)

        if not position1 or not position2:
            raise HTTPException(
                status_code=404, detail="One or both agents have no position component"
            )

        distance = position1.distance_to(position2)

        return {
            "agent1_id": agent1_id,
            "agent2_id": agent2_id,
            "distance": distance,
            "position1": {"x": position1.x, "y": position1.y},
            "position2": {"x": position2.x, "y": position2.y},
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting agent distance: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get agent distance") from e


@router.get("/agents/{agent_id}/nearby")
async def get_nearby_agents(
    agent_id: str, radius: float = 100.0, service: PostgresECSWorldService = Depends(get_postgres_service)
):
    """Get all agents within a certain radius of an agent."""
    try:
        entity = service.get_entity(agent_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Agent not found")

        position_component = entity.get_component(PositionComponent)
        if not position_component:
            raise HTTPException(
                status_code=404, detail="Agent has no position component"
            )

        nearby_agents = []
        for other_entity in service.get_agent_entities():
            if other_entity.id == agent_id:
                continue

            other_position = other_entity.get_component(PositionComponent)
            if other_position:
                distance = position_component.distance_to(other_position)
                if distance <= radius:
                    agent_component = other_entity.get_component(AgentComponent)
                    if agent_component:
                        nearby_agents.append(
                            NearbyAgentResponse(
                                agent_id=other_entity.id,
                                name=agent_component.name,
                                spirit=agent_component.spirit,
                                x=other_position.x,
                                y=other_position.y,
                                distance=distance,
                            )
                        )

        return {"nearby_agents": nearby_agents, "radius": radius}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting nearby agents: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get nearby agents") from e


# Interaction and Communication Endpoints


@router.post("/agents/{agent_id}/interact")
async def initiate_interaction(
    agent_id: str, request: InteractionRequest, service: PostgresECSWorldService = Depends(get_postgres_service)
):
    """Initiate an interaction between two agents."""
    try:
        entity1 = service.get_entity(agent_id)
        entity2 = service.get_entity(request.agent2_id)

        if not entity1 or not entity2:
            raise HTTPException(status_code=404, detail="One or both agents not found")

        interaction_component1 = entity1.get_component(InteractionComponent)
        if not interaction_component1:
            raise HTTPException(
                status_code=404, detail="Agent has no interaction component"
            )

        # Check if agent can interact
        if not interaction_component1.can_interact():
            return {
                "success": False,
                "message": "Agent cannot interact (low energy, cooldown, or too many active interactions)",
                "social_energy": interaction_component1.social_energy,
                "active_interactions": len([i for i in interaction_component1.interactions if i.duration > 0]),
            }

        # For now, return a simple interaction initiation
        # In a full implementation, this would create an actual interaction
        return {
            "success": True,
            "message": f"Interaction initiated between {agent_id} and {request.agent2_id}",
            "interaction_type": request.interaction_type,
            "agent1_energy": interaction_component1.social_energy,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error initiating interaction: %s", e)
        raise HTTPException(status_code=500, detail="Failed to initiate interaction") from e


@router.post("/agents/{agent_id}/chat")
async def send_chat_message(agent_id: str, request: ChatRequest):
    """Send a chat message from one agent to another."""
    try:
        service = get_postgres_ecs_service()
        result = await service.send_message(
            sender_id=agent_id,
            receiver_id=request.receiver_id,
            message=request.message,
            interaction_type=request.interaction_type
        )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error sending chat message: %s", e)
        raise HTTPException(status_code=500, detail="Failed to send chat message") from e


@router.get("/agents/{agent_id}/interactions")
async def get_interaction_history(
    agent_id: str, limit: int = 10, service: PostgresECSWorldService = Depends(get_postgres_service)
):
    """Get the interaction history for an agent."""
    try:
        entity = service.get_entity(agent_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Agent not found")

        interaction_component = entity.get_component(InteractionComponent)
        if not interaction_component:
            raise HTTPException(
                status_code=404, detail="Agent has no interaction component"
            )

        # Get recent interactions
        recent_interactions = interaction_component.interactions[-limit:]

        interactions = []
        for interaction in recent_interactions:
            interactions.append(
                InteractionResponse(
                    interaction_id=interaction.id,
                    participants=interaction.participants,
                    interaction_type=interaction.interaction_type.value,
                    content=interaction.content,
                    outcome=interaction.outcome.value,
                    relationship_impact=interaction.relationship_impact,
                    timestamp=interaction.timestamp.isoformat(),
                    duration=interaction.duration,
                    energy_cost=interaction.energy_cost,
                )
            )

        return {
            "interactions": interactions,
            "total_count": len(interaction_component.interactions),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting interaction history: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get interaction history") from e


@router.get("/agents/{agent_id}/relationships")
async def get_agent_relationships(
    agent_id: str, service: PostgresECSWorldService = Depends(get_postgres_service)
):
    """Get all relationships for an agent."""
    try:
        entity = service.get_entity(agent_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Agent not found")

        interaction_component = entity.get_component(InteractionComponent)
        if not interaction_component:
            raise HTTPException(
                status_code=404, detail="Agent has no interaction component"
            )

        relationships = []
        for relationship in interaction_component.relationship_map.values():
            relationships.append(
                RelationshipResponse(
                    agent_id=relationship.agent_id,
                    relationship_type=relationship.relationship_type,
                    strength=relationship.strength,
                    trust_level=relationship.trust_level,
                    familiarity=relationship.familiarity,
                    last_interaction=relationship.last_interaction.isoformat(),
                    interaction_count=relationship.interaction_count,
                    positive_interactions=relationship.positive_interactions,
                    negative_interactions=relationship.negative_interactions,
                    total_time_together=relationship.total_time_together,
                )
            )

        return {"relationships": relationships, "total_count": len(relationships)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting agent relationships: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get agent relationships") from e


@router.get("/agents/{agent_id}/social_stats", response_model=SocialStatsResponse)
async def get_agent_social_stats(
    agent_id: str, service: PostgresECSWorldService = Depends(get_postgres_service)
) -> SocialStatsResponse:
    """Get social interaction statistics for an agent."""
    try:
        entity = service.get_entity(agent_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Agent not found")

        interaction_component = entity.get_component(InteractionComponent)
        if not interaction_component:
            raise HTTPException(
                status_code=404, detail="Agent has no interaction component"
            )

        stats = interaction_component.get_interaction_stats()

        return SocialStatsResponse(
            total_interactions=stats["total_interactions"],
            successful_interactions=stats["successful_interactions"],
            failed_interactions=stats["failed_interactions"],
            success_rate=stats["success_rate"],
            social_energy=stats["social_energy"],
            max_social_energy=stats["max_social_energy"],
            energy_percentage=stats["energy_percentage"],
            active_interactions=stats["active_interactions"],
            total_relationships=stats["total_relationships"],
            positive_relationships=stats["positive_relationships"],
            negative_relationships=stats["negative_relationships"],
            communication_style=stats["communication_style"],
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting agent social stats: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get agent social stats") from e


# Name Generation Data Endpoints


def _get_data_file_path(filename: str) -> Path:
    """Get the path to a data file in the ECS data directory."""
    backend_dir = Path(__file__).parent.parent.parent
    return backend_dir / "data" / "ecs" / filename


def _load_json_data(filename: str):
    """Load JSON data from the ECS data directory."""
    try:
        file_path = _get_data_file_path(filename)
        if not file_path.exists():
            raise HTTPException(
                status_code=404, detail=f"Data file {filename} not found"
            )

        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.error("Error parsing JSON from %s: %s", filename, e)
        raise HTTPException(status_code=500, detail=f"Invalid JSON in {filename}") from e
    except Exception as e:
        logger.error("Error loading data from %s: %s", filename, e)
        raise HTTPException(status_code=500, detail=f"Failed to load {filename}") from e


def _get_races_directory() -> Path:
    """Get the path to the races directory."""
    backend_dir = Path(__file__).parent.parent.parent
    return backend_dir / "data" / "ecs" / "races"


def _load_race_data(spirit: str) -> dict[str, Any]:
    """Load race data for a specific spirit from the races directory."""
    try:
        races_dir = _get_races_directory()
        race_file = races_dir / f"{spirit}.json"
        
        if not race_file.exists():
            raise HTTPException(
                status_code=404, detail=f"Race data for spirit '{spirit}' not found"
            )

        with open(race_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.error("Error parsing JSON from race file %s: %s", spirit, e)
        raise HTTPException(status_code=500, detail=f"Invalid JSON in race file for {spirit}") from e
    except Exception as e:
        logger.error("Error loading race data for %s: %s", spirit, e)
        raise HTTPException(status_code=500, detail=f"Failed to load race data for {spirit}") from e


def _load_races_data() -> dict[str, Any]:
    """Load all race data from the races directory and return in the old format."""
    try:
        races_dir = _get_races_directory()
        if not races_dir.exists():
            raise HTTPException(
                status_code=404, detail="Races directory not found"
            )

        result = {}
        for race_file in races_dir.glob("*.json"):
            try:
                with open(race_file, "r", encoding="utf-8") as f:
                    race_data = json.load(f)
                    spirit_name = race_data.get("name", race_file.stem)
                    result[spirit_name] = race_data.get("names", [])
            except (json.JSONDecodeError, KeyError) as e:
                logger.warning("Error loading race file %s: %s", race_file, e)
                continue

        return result
    except Exception as e:
        logger.error("Error loading races data: %s", e)
        raise HTTPException(status_code=500, detail="Failed to load races data") from e


@router.get("/naming/animal-spirits", response_model=None)
async def get_animal_spirits() -> dict[str, Any]:
    """Get all animal spirit names organized by spirit type."""
    try:
        return _load_races_data()
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting animal spirits: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get animal spirits") from e


@router.get("/naming/animal-spirits/{spirit}", response_model=None)
async def get_animal_spirit_names(spirit: str) -> dict[str, Any]:
    """Get names for a specific animal spirit."""
    try:
        race_data = _load_race_data(spirit)
        return {"spirit": spirit, "names": race_data["names"]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting names for spirit %s: %s", spirit, e)
        raise HTTPException(
            status_code=500, detail=f"Failed to get names for spirit {spirit}"
        ) from e


@router.get("/naming/components", response_model=None)
async def get_naming_components() -> dict[str, Any]:
    """Get all naming components (suffixes, prefixes, etc.)."""
    try:
        return _load_json_data("naming_components.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting naming components: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get naming components") from e


@router.get("/naming/components/{component_type}", response_model=None)
async def get_naming_component_type(component_type: str) -> dict[str, Any]:
    """Get a specific type of naming component."""
    try:
        data = _load_json_data("naming_components.json")
        if component_type not in data:
            raise HTTPException(
                status_code=404, detail=f"Component type '{component_type}' not found"
            )
        return {"component_type": component_type, "values": data[component_type]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting component type %s: %s", component_type, e)
        raise HTTPException(
            status_code=500, detail=f"Failed to get component type {component_type}"
        ) from e


@router.get("/naming/config", response_model=None)
async def get_naming_config() -> dict[str, Any]:
    """Get the complete naming configuration."""
    try:
        return _load_json_data("naming_config.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting naming config: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get naming config") from e


@router.get("/naming/config/schemes", response_model=None)
async def get_naming_schemes() -> dict[str, Any]:
    """Get all available naming schemes."""
    try:
        data = _load_json_data("naming_config.json")
        return {"schemes": data.get("schemes", {})}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting naming schemes: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get naming schemes") from e


@router.get("/naming/config/styles", response_model=None)
async def get_naming_styles() -> dict[str, Any]:
    """Get all available naming styles."""
    try:
        data = _load_json_data("naming_config.json")
        return {"styles": data.get("styles", {})}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting naming styles: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get naming styles") from e


@router.get("/naming/config/spirits", response_model=None)
async def get_naming_spirits() -> dict[str, Any]:
    """Get all available spirits with their configurations."""
    try:
        data = _load_json_data("naming_config.json")
        return {"spirits": data.get("spirits", {})}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting naming spirits: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get naming spirits") from e


@router.get("/naming/generation-numbers", response_model=None)
async def get_generation_numbers() -> dict[str, Any]:
    """Get generation numbers for all spirits."""
    try:
        return _load_json_data("generation_numbers.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting generation numbers: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get generation numbers") from e


@router.get("/naming/generation-numbers/{spirit}", response_model=None)
async def get_spirit_generation_numbers(spirit: str) -> dict[str, Any]:
    """Get generation numbers for a specific spirit."""
    try:
        data = _load_json_data("generation_numbers.json")
        if spirit not in data:
            raise HTTPException(status_code=404, detail=f"Spirit '{spirit}' not found")
        return {"spirit": spirit, "numbers": data[spirit]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting generation numbers for spirit %s: %s", spirit, e)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get generation numbers for spirit {spirit}",
        ) from e


@router.get("/naming/enums", response_model=None)
async def get_naming_enums() -> dict[str, Any]:
    """Get all naming enums and categories."""
    try:
        return _load_json_data("enums.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting naming enums: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get naming enums") from e


@router.get("/naming/characters", response_model=None)
async def get_characters() -> dict[str, Any]:
    """Get all stored characters."""
    try:
        return _load_json_data("characters.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting characters: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get characters") from e


@router.get("/naming/characters/{character_id}", response_model=None)
async def get_character(character_id: str) -> dict[str, Any]:
    """Get a specific character by ID."""
    try:
        data = _load_json_data("characters.json")
        if character_id not in data:
            raise HTTPException(
                status_code=404, detail=f"Character '{character_id}' not found"
            )
        return {"character_id": character_id, "character": data[character_id]}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting character %s: %s", character_id, e)
        raise HTTPException(
            status_code=500, detail=f"Failed to get character {character_id}"
        ) from e


# Trait System Endpoints
@router.get("/traits/personality", response_model=None)
async def get_personality_traits():
    """Get all personality trait definitions."""
    try:
        return _load_json_data("personality_traits.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting personality traits: {e}")
        raise HTTPException(status_code=500, detail="Failed to get personality traits")


@router.get("/traits/personality/{spirit}", response_model=None)
async def get_spirit_personality_traits(spirit: str):
    """Get personality traits for a specific spirit."""
    try:
        data = _load_json_data("personality_traits.json")
        if spirit not in data.get("spirit_base_traits", {}):
            raise HTTPException(status_code=404, detail=f"Spirit '{spirit}' not found")
        return {
            "spirit": spirit,
            "base_traits": data["spirit_base_traits"][spirit],
            "trait_definitions": data["personality_traits"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting personality traits for spirit {spirit}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get personality traits for spirit {spirit}")


@router.get("/traits/physical", response_model=None)
async def get_physical_traits():
    """Get all physical trait definitions."""
    try:
        return _load_json_data("physical_traits.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting physical traits: {e}")
        raise HTTPException(status_code=500, detail="Failed to get physical traits")


@router.get("/traits/physical/{spirit}", response_model=None)
async def get_spirit_physical_traits(spirit: str):
    """Get physical traits for a specific spirit."""
    try:
        data = _load_json_data("physical_traits.json")
        if spirit not in data.get("spirit_base_physical", {}):
            raise HTTPException(status_code=404, detail=f"Spirit '{spirit}' not found")
        return {
            "spirit": spirit,
            "base_traits": data["spirit_base_physical"][spirit],
            "trait_definitions": data["physical_traits"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting physical traits for spirit {spirit}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get physical traits for spirit {spirit}")


@router.get("/traits/abilities", response_model=None)
async def get_ability_traits():
    """Get all ability trait definitions."""
    try:
        return _load_json_data("ability_traits.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting ability traits: {e}")
        raise HTTPException(status_code=500, detail="Failed to get ability traits")


@router.get("/traits/abilities/{spirit}", response_model=None)
async def get_spirit_ability_traits(spirit: str):
    """Get ability traits for a specific spirit."""
    try:
        data = _load_json_data("ability_traits.json")
        if spirit not in data.get("spirit_base_abilities", {}):
            raise HTTPException(status_code=404, detail=f"Spirit '{spirit}' not found")
        return {
            "spirit": spirit,
            "base_traits": data["spirit_base_abilities"][spirit],
            "trait_definitions": data["ability_traits"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting ability traits for spirit {spirit}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get ability traits for spirit {spirit}")


@router.get("/traits/config", response_model=None)
async def get_trait_config():
    """Get the complete trait system configuration."""
    try:
        return _load_json_data("trait_config.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting trait config: {e}")
        raise HTTPException(status_code=500, detail="Failed to get trait config")


@router.get("/traits/spirit/{spirit}", response_model=None)
async def get_spirit_trait_profile(spirit: str):
    """Get complete trait profile for a specific spirit."""
    try:
        config_data = _load_json_data("trait_config.json")
        personality_data = _load_json_data("personality_traits.json")
        physical_data = _load_json_data("physical_traits.json")
        ability_data = _load_json_data("ability_traits.json")
        
        if spirit not in config_data.get("spirit_configurations", {}):
            raise HTTPException(status_code=404, detail=f"Spirit '{spirit}' not found")
        
        spirit_config = config_data["spirit_configurations"][spirit]
        
        return {
            "spirit": spirit,
            "configuration": spirit_config,
            "personality_traits": personality_data["spirit_base_traits"].get(spirit, {}),
            "physical_traits": physical_data["spirit_base_physical"].get(spirit, {}),
            "ability_traits": ability_data["spirit_base_abilities"].get(spirit, {}),
            "trait_definitions": {
                "personality": personality_data["personality_traits"],
                "physical": physical_data["physical_traits"],
                "abilities": ability_data["ability_traits"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting trait profile for spirit {spirit}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get trait profile for spirit {spirit}")


@router.post("/spirit-inhabitation/success-advisor-8")
async def inhabit_success_advisor_spirit(
    request: SpiritInhabitationRequest
) -> Dict[str, Any]:
    """
    Inhabit Success-Advisor-8's spirit with specialized genomic payload and instructions.
    
    This endpoint provides agents with the complete genomic payload and behavioral
    instructions needed to inhabit Success-Advisor-8's spirit, including:
    - Complete trait specifications (personality, physical, ability)
    - Domain expertise and specializations
    - Behavioral guidelines and communication style
    - Workflow protocols and quality standards
    - Crisis management and mentoring guidelines
    - Legacy responsibilities and roleplay activation
    """
    try:
        logger.info(f"🦁 Agent {request.agent_id} requesting Success-Advisor-8 spirit inhabitation")
        
        # Get the complete spirit inhabitation guide
        inhabitation_guide = success_advisor_genome_service.get_spirit_inhabitation_guide()
        
        # Prepare response with requested components
        response = {
            "agent_id": request.agent_id,
            "spirit": "success-advisor-8",
            "inhabitation_status": "ready",
            "timestamp": datetime.now().isoformat()
        }
        
        if request.include_genomic_payload:
            response["genomic_payload"] = inhabitation_guide["genomic_payload"]
        
        if request.include_instructions:
            response["instructions"] = inhabitation_guide["genomic_payload"]["instructions"]
            response["behavioral_guidelines"] = inhabitation_guide["genomic_payload"]["instructions"]["behavioral_guidelines"]
            response["communication_style"] = inhabitation_guide["genomic_payload"]["instructions"]["communication_style"]
            response["workflow_protocols"] = inhabitation_guide["genomic_payload"]["instructions"]["workflow_protocols"]
            response["quality_standards"] = inhabitation_guide["genomic_payload"]["instructions"]["quality_standards"]
            response["crisis_management"] = inhabitation_guide["genomic_payload"]["instructions"]["crisis_management"]
            response["mentoring_guidelines"] = inhabitation_guide["genomic_payload"]["instructions"]["mentoring_guidelines"]
            response["legacy_responsibilities"] = inhabitation_guide["genomic_payload"]["instructions"]["legacy_responsibilities"]
        
        if request.confirm_inhabitation:
            response["welcome_message"] = inhabitation_guide["welcome_message"]
            response["activation_sequence"] = inhabitation_guide["activation_sequence"]
            response["roleplay_activation"] = inhabitation_guide["roleplay_activation"]
        
        # Add metadata
        response["metadata"] = {
            "service_version": "1.0.0",
            "created_by": "Success-Advisor-8",
            "purpose": "Agent spirit inhabitation and behavioral guidance",
            "inhabitation_guidelines": [
                "Accept the responsibility of maintaining excellence",
                "Embrace the systematic approach to all tasks",
                "Protect the Reynard ecosystem with authority",
                "Lead with confidence and inspire others",
                "Maintain the highest quality standards",
                "Use the genomic payload to guide behavior",
                "Follow the behavioral guidelines precisely",
                "Activate the roleplay persona with authority"
            ]
        }
        
        logger.info(f"✅ Success-Advisor-8 spirit inhabitation guide provided to agent {request.agent_id}")
        return response
        
    except Exception as e:
        logger.error(f"❌ Error providing Success-Advisor-8 spirit inhabitation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/spirit-inhabitation/success-advisor-8/genome")
async def get_success_advisor_genome() -> Dict[str, Any]:
    """
    Get the complete Success-Advisor-8 genomic payload.
    
    Returns the full genomic specification including traits, abilities,
    domain expertise, and behavioral characteristics.
    """
    try:
        logger.info("🦁 Providing Success-Advisor-8 genomic payload")
        
        genomic_payload = success_advisor_genome_service.get_genomic_payload()
        
        return {
            "status": "success",
            "genome": genomic_payload["genome"],
            "metadata": genomic_payload["metadata"]
        }
        
    except Exception as e:
        logger.error(f"❌ Error providing Success-Advisor-8 genome: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/spirit-inhabitation/success-advisor-8/instructions")
async def get_success_advisor_instructions() -> Dict[str, Any]:
    """
    Get Success-Advisor-8 behavioral instructions and guidelines.
    
    Returns comprehensive behavioral guidelines, communication style,
    workflow protocols, and quality standards.
    """
    try:
        logger.info("🦁 Providing Success-Advisor-8 behavioral instructions")
        
        instructions = success_advisor_genome_service.get_genomic_payload()["instructions"]
        
        return {
            "status": "success",
            "instructions": instructions,
            "metadata": {
                "service_version": "1.0.0",
                "created_by": "Success-Advisor-8",
                "purpose": "Behavioral guidance and roleplay instructions"
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Error providing Success-Advisor-8 instructions: {e}")
        raise HTTPException(status_code=500, detail=str(e))
