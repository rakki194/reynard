"""
ECS World API Endpoints

FastAPI endpoints for ECS world management and agent operations.
"""

import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from .service import get_ecs_world, get_ecs_service
from reynard_ecs_world import AgentWorld
from reynard_ecs_world.components.agent import AgentComponent

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/ecs", tags=["ECS World"])


# Pydantic models for API
class AgentCreateRequest(BaseModel):
    agent_id: str
    spirit: Optional[str] = "fox"
    style: Optional[str] = "foundation"
    name: Optional[str] = None


class OffspringCreateRequest(BaseModel):
    parent1_id: str
    parent2_id: str
    offspring_id: str


class WorldStatusResponse(BaseModel):
    status: str
    entity_count: Optional[int] = None
    system_count: Optional[int] = None
    agent_count: Optional[int] = None
    mature_agents: Optional[int] = None


class AgentResponse(BaseModel):
    agent_id: str
    name: str
    spirit: str
    style: str
    active: bool


# Dependency to get ECS world
def get_world() -> AgentWorld:
    """Get the ECS world instance."""
    try:
        return get_ecs_world()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/status", response_model=WorldStatusResponse)
async def get_world_status():
    """Get the current ECS world status."""
    try:
        service = get_ecs_service()
        status = service.get_world_status()
        return WorldStatusResponse(**status)
    except Exception as e:
        logger.error(f"Error getting world status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get world status")


@router.get("/agents", response_model=List[AgentResponse])
async def get_agents(world: AgentWorld = Depends(get_world)):
    """Get all agents in the world."""
    try:
        agents = []
        for entity in world.get_agent_entities():
            agent_component = entity.get_component(AgentComponent)
            if agent_component:
                agents.append(AgentResponse(
                    agent_id=entity.id,
                    name=agent_component.name,
                    spirit=agent_component.spirit,
                    style=agent_component.style,
                    active=entity.active
                ))
        return agents
    except Exception as e:
        logger.error(f"Error getting agents: {e}")
        raise HTTPException(status_code=500, detail="Failed to get agents")


@router.post("/agents", response_model=AgentResponse)
async def create_agent(
    request: AgentCreateRequest,
    world: AgentWorld = Depends(get_world)
):
    """Create a new agent."""
    try:
        entity = world.create_agent(
            agent_id=request.agent_id,
            spirit=request.spirit,
            style=request.style,
            name=request.name
        )
        
        agent_component = entity.get_component(AgentComponent)
        if not agent_component:
            raise HTTPException(status_code=500, detail="Failed to create agent component")
        
        return AgentResponse(
            agent_id=entity.id,
            name=agent_component.name,
            spirit=agent_component.spirit,
            style=agent_component.style,
            active=entity.active
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating agent: {e}")
        raise HTTPException(status_code=500, detail="Failed to create agent")


@router.post("/agents/offspring", response_model=AgentResponse)
async def create_offspring(
    request: OffspringCreateRequest,
    world: AgentWorld = Depends(get_world)
):
    """Create offspring from two parent agents."""
    try:
        entity = world.create_offspring(
            parent1_id=request.parent1_id,
            parent2_id=request.parent2_id,
            offspring_id=request.offspring_id
        )
        
        agent_component = entity.get_component(AgentComponent)
        if not agent_component:
            raise HTTPException(status_code=500, detail="Failed to create offspring")
        
        return AgentResponse(
            agent_id=entity.id,
            name=agent_component.name,
            spirit=agent_component.spirit,
            style=agent_component.style,
            active=entity.active
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating offspring: {e}")
        raise HTTPException(status_code=500, detail="Failed to create offspring")


@router.get("/agents/{agent_id}/mates")
async def find_compatible_mates(
    agent_id: str,
    max_results: int = 5,
    world: AgentWorld = Depends(get_world)
):
    """Find compatible mates for an agent."""
    try:
        mates = world.find_compatible_mates(agent_id, max_results)
        return {"agent_id": agent_id, "compatible_mates": mates}
    except Exception as e:
        logger.error(f"Error finding mates: {e}")
        raise HTTPException(status_code=500, detail="Failed to find compatible mates")


@router.get("/agents/{agent1_id}/compatibility/{agent2_id}")
async def analyze_compatibility(
    agent1_id: str,
    agent2_id: str,
    world: AgentWorld = Depends(get_world)
):
    """Analyze genetic compatibility between two agents."""
    try:
        compatibility = world.analyze_genetic_compatibility(agent1_id, agent2_id)
        return compatibility
    except Exception as e:
        logger.error(f"Error analyzing compatibility: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze compatibility")


@router.get("/agents/{agent_id}/lineage")
async def get_agent_lineage(
    agent_id: str,
    depth: int = 3,
    world: AgentWorld = Depends(get_world)
):
    """Get agent family tree and lineage."""
    try:
        lineage = world.get_agent_lineage(agent_id, depth)
        return lineage
    except Exception as e:
        logger.error(f"Error getting lineage: {e}")
        raise HTTPException(status_code=500, detail="Failed to get agent lineage")


@router.post("/breeding/enable")
async def enable_breeding(
    enabled: bool = True,
    world: AgentWorld = Depends(get_world)
):
    """Enable or disable automatic breeding."""
    try:
        world.enable_automatic_reproduction(enabled)
        return {"message": f"Automatic breeding {'enabled' if enabled else 'disabled'}"}
    except Exception as e:
        logger.error(f"Error toggling breeding: {e}")
        raise HTTPException(status_code=500, detail="Failed to toggle breeding")


@router.get("/breeding/stats")
async def get_breeding_stats(world: AgentWorld = Depends(get_world)):
    """Get breeding statistics."""
    try:
        stats = world.get_breeding_stats()
        return stats
    except Exception as e:
        logger.error(f"Error getting breeding stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get breeding statistics")
