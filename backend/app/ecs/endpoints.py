"""
🦊 Reynard ECS World API Endpoints
==================================

Comprehensive FastAPI endpoints for ECS (Entity Component System) world management
and agent operations within the Reynard ecosystem. This module provides sophisticated
API endpoints for agent lifecycle management, world simulation, and advanced agent
interactions including breeding, trait inheritance, and social dynamics.

The ECS World API provides:
- Agent creation and lifecycle management with trait-based personalities
- World simulation control with time acceleration and status monitoring
- Agent breeding and genetic compatibility analysis
- Trait inheritance and offspring creation with genetic algorithms
- Social interaction tracking and relationship management
- Position tracking and spatial awareness for agent movement
- Comprehensive caching and performance optimization
- Real-time world status and simulation metrics

Key Features:
- Agent Management: Complete agent lifecycle from creation to interaction
- World Simulation: Time-accelerated virtual environment with configurable speed
- Genetic System: Trait inheritance, compatibility analysis, and offspring creation
- Social Dynamics: Interaction tracking, relationship management, and communication
- Spatial Awareness: Position tracking and movement capabilities
- Performance Optimization: Comprehensive caching and query optimization
- Real-time Monitoring: World status, simulation metrics, and health checks

API Endpoints:
- Agent Operations: Create, retrieve, update, and manage agents
- World Control: Start, stop, and configure world simulation
- Breeding System: Genetic compatibility analysis and offspring creation
- Social Features: Interaction tracking and relationship management
- Spatial Features: Position tracking and movement operations
- Monitoring: World status, metrics, and health information

The ECS system integrates seamlessly with the Reynard backend architecture,
providing a sophisticated virtual world for agent simulation and interaction
with comprehensive API access and real-time monitoring capabilities.

Author: Reynard Development Team
Version: 1.0.0
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from .cache_decorators import (
    cache_naming_components,
    cache_naming_config,
    cache_naming_spirits,
)
from .database import NamingComponent, NamingConfig, NamingSpirit, ecs_db
from .postgres_service import PostgresECSWorldService, get_postgres_ecs_service
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
        status = await service.get_world_status()
        return WorldStatusResponse(**status)
    except Exception as e:
        logger.exception("Error getting world status")
        raise HTTPException(status_code=500, detail="Failed to get world status") from e


@router.get("/agents", response_model=list[AgentResponse])
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


@router.post("/agents", response_model=AgentResponse)
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


@router.post("/agents/offspring", response_model=AgentResponse)
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


@router.get("/agents/{agent_id}/mates")
async def find_compatible_mates(
    agent_id: str,
    max_results: int = 5,
    service: PostgresECSWorldService = Depends(get_postgres_service),
) -> dict[str, Any]:
    """Find compatible mates for an agent."""
    try:
        mates = await service.find_compatible_mates(agent_id, max_results)
        return {"agent_id": agent_id, "compatible_mates": mates}
    except Exception as e:
        logger.exception("Error finding mates")
        raise HTTPException(
            status_code=500, detail="Failed to find compatible mates"
        ) from e


@router.get("/agents/{agent1_id}/compatibility/{agent2_id}")
async def analyze_compatibility(
    agent1_id: str,
    agent2_id: str,
    service: PostgresECSWorldService = Depends(get_postgres_service),
) -> dict[str, Any]:
    """Analyze genetic compatibility between two agents."""
    try:
        return await service.analyze_compatibility(agent1_id, agent2_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error analyzing compatibility")
        raise HTTPException(
            status_code=500, detail="Failed to analyze compatibility"
        ) from e


@router.get("/agents/{agent_id}/lineage")
async def get_agent_lineage(
    agent_id: str,
    depth: int = 3,
    service: PostgresECSWorldService = Depends(get_postgres_service),
):
    """Get agent family tree and lineage."""
    try:
        return await service.get_agent_lineage(agent_id, depth)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting agent lineage")
        raise HTTPException(
            status_code=500, detail="Failed to get agent lineage"
        ) from e


@router.post("/breeding/enable")
async def enable_breeding(
    enabled: bool = True,
    service: PostgresECSWorldService = Depends(get_postgres_service),
) -> dict[str, str]:
    """Enable or disable automatic breeding."""
    try:
        return await service.enable_breeding(enabled)
    except Exception as e:
        logger.exception("Error enabling breeding")
        raise HTTPException(status_code=500, detail="Failed to enable breeding") from e


@router.get("/breeding/stats")
async def get_breeding_stats(
    service: PostgresECSWorldService = Depends(get_postgres_service),
) -> dict[str, Any]:
    """Get breeding statistics."""
    try:
        return await service.get_breeding_stats()
    except Exception as e:
        logger.exception("Error getting breeding stats")
        raise HTTPException(
            status_code=500, detail="Failed to get breeding stats"
        ) from e


# Position and Movement Endpoints


@router.get("/agents/{agent_id}/position", response_model=PositionResponse)
async def get_agent_position(
    agent_id: str, service: PostgresECSWorldService = Depends(get_postgres_service)
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
            status_code=500, detail="Failed to get agent position"
        ) from e


@router.get("/agents/positions")
async def get_all_agent_positions(
    service: PostgresECSWorldService = Depends(get_postgres_service),
) -> dict[str, Any]:
    """Get positions of all agents in the service."""
    try:
        return await service.get_all_agent_positions()
    except Exception as e:
        logger.exception("Error getting all agent positions")
        raise HTTPException(
            status_code=500, detail="Failed to get all agent positions"
        ) from e


@router.post("/agents/{agent_id}/move", response_model=PositionResponse)
async def move_agent(
    agent_id: str,
    request: MoveRequest,
    service: PostgresECSWorldService = Depends(get_postgres_service),
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


@router.post("/agents/{agent_id}/move_towards", response_model=PositionResponse)
async def move_agent_towards(
    agent_id: str,
    request: MoveTowardsRequest,
    service: PostgresECSWorldService = Depends(get_postgres_service),
):
    """Move an agent towards another agent."""
    try:
        position_data = await service.move_agent_towards(
            agent_id, request.target_agent_id, request.distance
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
            status_code=500, detail="Failed to move agent towards target"
        ) from e


@router.get("/agents/{agent1_id}/distance/{agent2_id}")
async def get_agent_distance(
    agent1_id: str,
    agent2_id: str,
    service: PostgresECSWorldService = Depends(get_postgres_service),
):
    """Get the distance between two agents."""
    try:
        return await service.get_agent_distance(agent1_id, agent2_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting agent distance")
        raise HTTPException(
            status_code=500, detail="Failed to get agent distance"
        ) from e


@router.get("/agents/{agent_id}/nearby")
async def get_nearby_agents(
    agent_id: str,
    radius: float = 100.0,
    service: PostgresECSWorldService = Depends(get_postgres_service),
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
            status_code=500, detail="Failed to get nearby agents"
        ) from e


# Interaction and Communication Endpoints


@router.post("/agents/{agent_id}/interact")
async def initiate_interaction(
    agent_id: str,
    request: InteractionRequest,
    service: PostgresECSWorldService = Depends(get_postgres_service),
):
    """Initiate an interaction between two agents."""
    try:
        return await service.initiate_interaction(
            agent_id, request.agent2_id, request.interaction_type
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error initiating interaction")
        raise HTTPException(
            status_code=500, detail="Failed to initiate interaction"
        ) from e


@router.post("/agents/{agent_id}/chat")
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
            status_code=500, detail="Failed to send chat message"
        ) from e


@router.get("/agents/{agent_id}/interactions")
async def get_interaction_history(
    agent_id: str,
    limit: int = 10,
    service: PostgresECSWorldService = Depends(get_postgres_service),
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
            status_code=500, detail="Failed to get interaction history"
        ) from e


@router.get("/agents/{agent_id}/relationships")
async def get_agent_relationships(
    agent_id: str, service: PostgresECSWorldService = Depends(get_postgres_service)
):
    """Get all relationships for an agent."""
    try:
        return await service.get_agent_relationships(agent_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting agent relationships")
        raise HTTPException(
            status_code=500, detail="Failed to get agent relationships"
        ) from e


@router.get("/agents/{agent_id}/social_stats", response_model=SocialStatsResponse)
async def get_agent_social_stats(
    agent_id: str, service: PostgresECSWorldService = Depends(get_postgres_service)
) -> SocialStatsResponse:
    """Get social interaction statistics for an agent."""
    try:
        # Get interaction history to calculate stats
        interactions = await service.get_agent_interactions(agent_id, limit=1000)

        total_interactions = len(interactions)
        successful_interactions = len(
            [i for i in interactions if i.get("energy_level", 0) > 0]
        )
        failed_interactions = total_interactions - successful_interactions
        success_rate = (
            successful_interactions / total_interactions
            if total_interactions > 0
            else 0.0
        )

        return SocialStatsResponse(
            total_interactions=total_interactions,
            successful_interactions=successful_interactions,
            failed_interactions=failed_interactions,
            success_rate=success_rate,
            social_energy=1.0,
            max_social_energy=1.0,
            energy_percentage=1.0,
            active_interactions=0,
            total_relationships=0,
            positive_relationships=0,
            negative_relationships=0,
            communication_style="casual",
        )
    except Exception as e:
        logger.exception("Error getting agent social stats")
        raise HTTPException(
            status_code=500, detail="Failed to get agent social stats"
        ) from e


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

        with file_path.open(encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.exception("Error parsing JSON from %s", filename)
        raise HTTPException(
            status_code=500, detail=f"Invalid JSON in {filename}"
        ) from e
    except Exception as e:
        logger.exception("Error loading data from %s", filename)
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

        with race_file.open(encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.exception("Error parsing JSON from race file %s", spirit)
        raise HTTPException(
            status_code=500, detail=f"Invalid JSON in race file for {spirit}"
        ) from e
    except Exception as e:
        logger.exception("Error loading race data for %s", spirit)
        raise HTTPException(
            status_code=500, detail=f"Failed to load race data for {spirit}"
        ) from e


@cache_naming_spirits(ttl=1800)
async def _load_races_data() -> dict[str, Any]:
    """Load all race data from the database and return in the old format."""
    try:

        with ecs_db.get_session() as session:
            spirits = session.query(NamingSpirit).filter(NamingSpirit.enabled).all()

        result = {}
        for spirit in spirits:
            result[spirit.name] = spirit.base_names or []

        return result
    except Exception as e:
        logger.exception("Error loading races data")
        raise HTTPException(status_code=500, detail="Failed to load races data") from e


@cache_naming_spirits(ttl=1800)
async def _get_all_races_data_from_db() -> dict[str, Any]:
    """Load all race data from the database with full details."""
    try:

        with ecs_db.get_session() as session:
            naming_spirits = session.query(NamingSpirit).all()
            all_races = {}

            for spirit in naming_spirits:
                all_races[spirit.name] = {
                    "name": spirit.name,
                    "category": spirit.category,
                    "description": spirit.description,
                    "emoji": spirit.emoji,
                    "traits": spirit.traits,
                    "names": spirit.base_names,
                    "generation_numbers": spirit.generation_numbers,
                }

            return {"races": all_races}
    except Exception as e:
        logger.exception("Error loading races data")
        raise HTTPException(status_code=500, detail="Failed to load races data") from e


def _get_race_data_from_db(spirit: str) -> dict[str, Any]:
    """Load race data for a specific spirit from the database."""
    try:

        with ecs_db.get_session() as session:
            naming_spirit = (
                session.query(NamingSpirit).filter(NamingSpirit.name == spirit).first()
            )

            if not naming_spirit:
                raise HTTPException(
                    status_code=404, detail=f"Race data for spirit '{spirit}' not found"
                )

            return {
                "name": naming_spirit.name,
                "category": naming_spirit.category,
                "description": naming_spirit.description,
                "emoji": naming_spirit.emoji,
                "traits": naming_spirit.traits,
                "names": naming_spirit.base_names,
                "generation_numbers": naming_spirit.generation_numbers,
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error loading race data for %s", spirit)
        raise HTTPException(
            status_code=500, detail=f"Failed to load race data for {spirit}"
        ) from e


@cache_naming_components(ttl=1800)
async def _get_naming_components_from_db() -> dict[str, Any]:
    """Load naming components from the database."""
    try:

        with ecs_db.get_session() as session:
            components = session.query(NamingComponent).all()
            components_dict = {}

            for component in components:
                if component.component_type not in components_dict:
                    components_dict[component.component_type] = {
                        "category": component.component_type,
                        "description": f"Naming components for {component.component_type}",
                        "enabled": component.enabled,
                        "values": [],
                    }

                if component.enabled:
                    components_dict[component.component_type]["values"].append(
                        component.component_value
                    )

            return components_dict
    except Exception as e:
        logger.exception("Error loading naming components")
        raise HTTPException(
            status_code=500, detail="Failed to load naming components"
        ) from e


@cache_naming_config(ttl=3600)
async def _get_naming_config_from_db() -> dict[str, Any]:
    """Load naming configuration from the database."""
    try:

        with ecs_db.get_session() as session:
            configs = session.query(NamingConfig).all()
            config_dict = {}

            for config in configs:
                config_dict[config.config_key] = config.config_value

            return config_dict
    except Exception as e:
        logger.exception("Error loading naming config")
        raise HTTPException(
            status_code=500, detail="Failed to load naming config"
        ) from e


@router.get("/naming/animal-spirits", response_model=None)
async def get_animal_spirits() -> dict[str, Any]:
    """Get all animal spirit names organized by spirit type."""
    try:
        return await _get_all_races_data_from_db()
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting animal spirits")
        raise HTTPException(
            status_code=500, detail="Failed to get animal spirits"
        ) from e


@router.get("/naming/animal-spirits/{spirit}", response_model=None)
async def get_animal_spirit_names(spirit: str) -> dict[str, Any]:
    """Get names for a specific animal spirit."""
    try:
        race_data = _get_race_data_from_db(spirit)
        return {"spirit": spirit, "names": race_data["names"]}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting names for spirit %s", spirit)
        raise HTTPException(
            status_code=500, detail=f"Failed to get names for spirit {spirit}"
        ) from e


@router.get("/naming/components", response_model=None)
async def get_naming_components() -> dict[str, Any]:
    """Get all naming components (suffixes, prefixes, etc.)."""
    try:
        return await _get_naming_components_from_db()
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting naming components")
        raise HTTPException(
            status_code=500, detail="Failed to get naming components"
        ) from e


@router.get("/naming/components/{component_type}", response_model=None)
async def get_naming_component_type(component_type: str) -> dict[str, Any]:
    """Get a specific type of naming component."""
    try:
        components = await _get_naming_components_from_db()
        if component_type not in components:
            raise HTTPException(
                status_code=404, detail=f"Component type '{component_type}' not found"
            )
        return components[component_type]
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting component type %s", component_type)
        raise HTTPException(
            status_code=500, detail=f"Failed to get component type {component_type}"
        ) from e


@router.get("/naming/config", response_model=None)
async def get_naming_config() -> dict[str, Any]:
    """Get the complete naming configuration."""
    try:
        return await _get_naming_config_from_db()
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting naming config")
        raise HTTPException(
            status_code=500, detail="Failed to get naming config"
        ) from e


@router.get("/naming/config/schemes", response_model=None)
async def get_naming_schemes() -> dict[str, Any]:
    """Get all available naming schemes."""
    try:
        config = await _get_naming_config_from_db()
        return {"schemes": config.get("schemes", {})}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting naming schemes")
        raise HTTPException(
            status_code=500, detail="Failed to get naming schemes"
        ) from e


@router.get("/naming/config/styles", response_model=None)
async def get_naming_styles() -> dict[str, Any]:
    """Get all available naming styles."""
    try:
        config = await _get_naming_config_from_db()
        return {"styles": config.get("styles", {})}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting naming styles")
        raise HTTPException(
            status_code=500, detail="Failed to get naming styles"
        ) from e


@router.get("/naming/config/spirits", response_model=None)
async def get_naming_spirits() -> dict[str, Any]:
    """Get all available spirits with their configurations from database."""
    try:
        # Get database service
        db = get_postgres_ecs_service()

        # Get all naming spirits from database
        return await db.get_naming_spirits()

    except Exception as e:
        logger.exception("Error getting naming spirits from database")
        raise HTTPException(
            status_code=500, detail="Failed to get naming spirits from database"
        ) from e


@router.get("/naming/generation-numbers", response_model=None)
async def get_generation_numbers() -> dict[str, Any]:
    """Get generation numbers for all spirits from database."""
    try:
        # Get database service
        db = get_postgres_ecs_service()

        # Get generation numbers from database
        return await db.get_generation_numbers()

    except Exception as e:
        logger.exception("Error getting generation numbers from database")
        raise HTTPException(
            status_code=500, detail="Failed to get generation numbers from database"
        ) from e


@router.get("/naming/generation-numbers/{spirit}", response_model=None)
async def get_spirit_generation_numbers(spirit: str) -> dict[str, Any]:
    """Get generation numbers for a specific spirit."""
    try:
        race_data = _get_race_data_from_db(spirit)
        return {"spirit": spirit, "generation_numbers": race_data["generation_numbers"]}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting generation numbers for spirit %s", spirit)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get generation numbers for spirit {spirit}",
        ) from e


@router.get("/naming/enums", response_model=None)
async def get_naming_enums() -> dict[str, Any]:
    """Get all naming enums and categories from database."""
    try:
        # Get database session
        db = get_postgres_ecs_service()

        # Get all naming spirits
        spirits = await db.get_naming_spirits()

        # Get all naming components (styles, etc.)
        components = await db.get_naming_components()

        # Get naming config
        config = await db.get_naming_config()

        # Build enums response
        return {
            "spirits": spirits,
            "components": components,
            "config": config,
            "styles": {
                "foundation": {
                    "enabled": True,
                    "description": "Asimov-inspired strategic names",
                },
                "exo": {
                    "enabled": True,
                    "description": "Combat/technical operational names",
                },
                "hybrid": {
                    "enabled": True,
                    "description": "Mythological/historical references",
                },
                "cyberpunk": {
                    "enabled": True,
                    "description": "Tech-prefixed cyber names",
                },
                "mythological": {
                    "enabled": True,
                    "description": "Divine/mystical references",
                },
                "scientific": {
                    "enabled": True,
                    "description": "Latin scientific classifications",
                },
            },
        }

    except Exception as e:
        logger.exception("Error getting naming enums from database")
        raise HTTPException(
            status_code=500, detail="Failed to get naming enums from database"
        ) from e


@router.get("/naming/characters", response_model=None)
async def get_characters() -> dict[str, Any]:
    """Get all stored characters."""
    try:
        return _load_json_data("characters.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting characters")
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
        logger.exception("Error getting character %s", character_id)
        raise HTTPException(
            status_code=500, detail=f"Failed to get character {character_id}"
        ) from e


# Trait System Endpoints
@router.get("/traits/personality", response_model=None)
async def get_personality_traits() -> dict[str, Any]:
    """Get all personality trait definitions."""
    try:
        return _load_json_data("personality_traits.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting personality traits")
        raise HTTPException(
            status_code=500, detail="Failed to get personality traits"
        ) from e


@router.get("/traits/personality/{spirit}", response_model=None)
async def get_spirit_personality_traits(spirit: str) -> dict[str, Any]:
    """Get personality traits for a specific spirit."""
    try:
        data = _load_json_data("personality_traits.json")
        if spirit not in data.get("spirit_base_traits", {}):
            raise HTTPException(status_code=404, detail=f"Spirit '{spirit}' not found")
        return {
            "spirit": spirit,
            "base_traits": data["spirit_base_traits"][spirit],
            "trait_definitions": data["personality_traits"],
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting personality traits for spirit %s", spirit)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get personality traits for spirit {spirit}",
        ) from e


@router.get("/traits/physical", response_model=None)
async def get_physical_traits() -> dict[str, Any]:
    """Get all physical trait definitions."""
    try:
        return _load_json_data("physical_traits.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting physical traits")
        raise HTTPException(
            status_code=500, detail="Failed to get physical traits"
        ) from e


@router.get("/traits/physical/{spirit}", response_model=None)
async def get_spirit_physical_traits(spirit: str) -> dict[str, Any]:
    """Get physical traits for a specific spirit."""
    try:
        data = _load_json_data("physical_traits.json")
        if spirit not in data.get("spirit_base_physical", {}):
            raise HTTPException(status_code=404, detail=f"Spirit '{spirit}' not found")
        return {
            "spirit": spirit,
            "base_traits": data["spirit_base_physical"][spirit],
            "trait_definitions": data["physical_traits"],
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting physical traits for spirit %s", spirit)
        raise HTTPException(
            status_code=500, detail=f"Failed to get physical traits for spirit {spirit}"
        ) from e


@router.get("/traits/abilities", response_model=None)
async def get_ability_traits() -> dict[str, Any]:
    """Get all ability trait definitions."""
    try:
        return _load_json_data("ability_traits.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting ability traits")
        raise HTTPException(
            status_code=500, detail="Failed to get ability traits"
        ) from e


@router.get("/traits/abilities/{spirit}", response_model=None)
async def get_spirit_ability_traits(spirit: str) -> dict[str, Any]:
    """Get ability traits for a specific spirit."""
    try:
        data = _load_json_data("ability_traits.json")
        if spirit not in data.get("spirit_base_abilities", {}):
            raise HTTPException(status_code=404, detail=f"Spirit '{spirit}' not found")
        return {
            "spirit": spirit,
            "base_traits": data["spirit_base_abilities"][spirit],
            "trait_definitions": data["ability_traits"],
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting ability traits for spirit %s", spirit)
        raise HTTPException(
            status_code=500, detail=f"Failed to get ability traits for spirit {spirit}"
        ) from e


@router.get("/traits/config", response_model=None)
async def get_trait_config() -> dict[str, Any]:
    """Get the complete trait system configuration."""
    try:
        return _load_json_data("trait_config.json")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting trait config")
        raise HTTPException(status_code=500, detail="Failed to get trait config") from e


@router.get("/traits/spirit/{spirit}", response_model=None)
async def get_spirit_trait_profile(spirit: str) -> dict[str, Any]:
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
            "personality_traits": personality_data["spirit_base_traits"].get(
                spirit, {}
            ),
            "physical_traits": physical_data["spirit_base_physical"].get(spirit, {}),
            "ability_traits": ability_data["spirit_base_abilities"].get(spirit, {}),
            "trait_definitions": {
                "personality": personality_data["personality_traits"],
                "physical": physical_data["physical_traits"],
                "abilities": ability_data["ability_traits"],
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error getting trait profile for spirit %s", spirit)
        raise HTTPException(
            status_code=500, detail=f"Failed to get trait profile for spirit {spirit}"
        ) from e


@router.post("/spirit-inhabitation/success-advisor-8")
async def inhabit_success_advisor_spirit(
    request: SpiritInhabitationRequest,
) -> dict[str, Any]:
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
        logger.info(
            f"🦁 Agent {request.agent_id} requesting Success-Advisor-8 spirit inhabitation"
        )

        # Get the complete spirit inhabitation guide
        inhabitation_guide = (
            success_advisor_genome_service.get_spirit_inhabitation_guide()
        )

        # Prepare response with requested components
        response = {
            "agent_id": request.agent_id,
            "spirit": "success-advisor-8",
            "inhabitation_status": "ready",
            "timestamp": datetime.now().isoformat(),
        }

        if request.include_genomic_payload:
            response["genomic_payload"] = inhabitation_guide["genomic_payload"]

        if request.include_instructions:
            response["instructions"] = inhabitation_guide["genomic_payload"][
                "instructions"
            ]
            response["behavioral_guidelines"] = inhabitation_guide["genomic_payload"][
                "instructions"
            ]["behavioral_guidelines"]
            response["communication_style"] = inhabitation_guide["genomic_payload"][
                "instructions"
            ]["communication_style"]
            response["workflow_protocols"] = inhabitation_guide["genomic_payload"][
                "instructions"
            ]["workflow_protocols"]
            response["quality_standards"] = inhabitation_guide["genomic_payload"][
                "instructions"
            ]["quality_standards"]
            response["crisis_management"] = inhabitation_guide["genomic_payload"][
                "instructions"
            ]["crisis_management"]
            response["mentoring_guidelines"] = inhabitation_guide["genomic_payload"][
                "instructions"
            ]["mentoring_guidelines"]
            response["legacy_responsibilities"] = inhabitation_guide["genomic_payload"][
                "instructions"
            ]["legacy_responsibilities"]

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
                "Activate the roleplay persona with authority",
            ],
        }

        logger.info(
            f"✅ Success-Advisor-8 spirit inhabitation guide provided to agent {request.agent_id}"
        )
        return response

    except Exception as e:
        logger.exception("❌ Error providing Success-Advisor-8 spirit inhabitation")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/interactions")
async def create_interaction(request: dict[str, Any]) -> dict[str, Any]:
    """Create an interaction between agents."""
    try:
        agent1_id = request.get("agent1_id")
        agent2_id = request.get("agent2_id")
        interaction_type = request.get("interaction_type", "communication")

        if not agent1_id or not agent2_id:
            raise HTTPException(
                status_code=400, detail="agent1_id and agent2_id are required"
            )

        # Get the ECS service
        ecs_service = get_postgres_ecs_service()

        # Create interaction using the ECS service send_message method
        interaction = await ecs_service.send_message(
            sender_id=agent1_id,
            receiver_id=agent2_id,
            message=f"Interaction of type: {interaction_type}",
            interaction_type=interaction_type,
        )

        return {"success": True, "interaction": interaction}

    except Exception as e:
        logger.exception("Failed to create interaction")
        raise HTTPException(
            status_code=500, detail=f"Failed to create interaction: {e!s}"
        ) from e


@router.get("/spirit-inhabitation/success-advisor-8/genome")
async def get_success_advisor_genome() -> dict[str, Any]:
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
            "metadata": genomic_payload["metadata"],
        }

    except Exception as e:
        logger.exception("❌ Error providing Success-Advisor-8 genome")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/spirit-inhabitation/success-advisor-8/instructions")
async def get_success_advisor_instructions() -> dict[str, Any]:
    """
    Get Success-Advisor-8 behavioral instructions and guidelines.

    Returns comprehensive behavioral guidelines, communication style,
    workflow protocols, and quality standards.
    """
    try:
        logger.info("🦁 Providing Success-Advisor-8 behavioral instructions")

        instructions = success_advisor_genome_service.get_genomic_payload()[
            "instructions"
        ]

        return {
            "status": "success",
            "instructions": instructions,
            "metadata": {
                "service_version": "1.0.0",
                "created_by": "Success-Advisor-8",
                "purpose": "Behavioral guidance and roleplay instructions",
            },
        }

    except Exception as e:
        logger.exception("❌ Error providing Success-Advisor-8 instructions")
        raise HTTPException(status_code=500, detail=str(e)) from e
