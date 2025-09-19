"""
ECS World API Endpoints

FastAPI endpoints for ECS world management and agent operations.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from reynard_ecs_world import AgentWorld
from reynard_ecs_world.components.agent import AgentComponent
from reynard_ecs_world.components.position import PositionComponent
from reynard_ecs_world.components.interaction import InteractionComponent, InteractionType

from .service import get_ecs_service, get_ecs_world

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/ecs", tags=["ECS World"])


# Pydantic models for API
class AgentCreateRequest(BaseModel):
    agent_id: str
    spirit: str | None = "fox"
    style: str | None = "foundation"
    name: str | None = None


class OffspringCreateRequest(BaseModel):
    parent1_id: str
    parent2_id: str
    offspring_id: str


class WorldStatusResponse(BaseModel):
    status: str
    entity_count: int | None = None
    system_count: int | None = None
    agent_count: int | None = None
    mature_agents: int | None = None


class AgentResponse(BaseModel):
    agent_id: str
    name: str
    spirit: str
    style: str
    active: bool


class PositionResponse(BaseModel):
    agent_id: str
    x: float
    y: float
    target_x: float
    target_y: float
    velocity_x: float
    velocity_y: float
    movement_speed: float


class MoveRequest(BaseModel):
    x: float
    y: float


class MoveTowardsRequest(BaseModel):
    target_agent_id: str
    distance: float = 50.0


class InteractionRequest(BaseModel):
    agent2_id: str
    interaction_type: str = "communication"


class ChatRequest(BaseModel):
    receiver_id: str
    message: str
    interaction_type: str = "communication"


class InteractionResponse(BaseModel):
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
    agent_id: str
    name: str
    spirit: str
    x: float
    y: float
    distance: float


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


@router.get("/agents", response_model=list[AgentResponse])
async def get_agents(world: AgentWorld = Depends(get_world)):
    """Get all agents in the world."""
    try:
        agents = []
        for entity in world.get_agent_entities():
            agent_component = entity.get_component(AgentComponent)
            if agent_component:
                agents.append(
                    AgentResponse(
                        agent_id=entity.id,
                        name=agent_component.name,
                        spirit=agent_component.spirit,
                        style=agent_component.style,
                        active=entity.active,
                    )
                )
        return agents
    except Exception as e:
        logger.error(f"Error getting agents: {e}")
        raise HTTPException(status_code=500, detail="Failed to get agents")


@router.post("/agents", response_model=AgentResponse)
async def create_agent(
    request: AgentCreateRequest, world: AgentWorld = Depends(get_world)
):
    """Create a new agent."""
    try:
        entity = world.create_agent(
            agent_id=request.agent_id,
            spirit=request.spirit,
            style=request.style,
            name=request.name,
        )

        agent_component = entity.get_component(AgentComponent)
        if not agent_component:
            raise HTTPException(
                status_code=500, detail="Failed to create agent component"
            )

        return AgentResponse(
            agent_id=entity.id,
            name=agent_component.name,
            spirit=agent_component.spirit,
            style=agent_component.style,
            active=entity.active,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating agent: {e}")
        raise HTTPException(status_code=500, detail="Failed to create agent")


@router.post("/agents/offspring", response_model=AgentResponse)
async def create_offspring(
    request: OffspringCreateRequest, world: AgentWorld = Depends(get_world)
):
    """Create offspring from two parent agents."""
    try:
        entity = world.create_offspring(
            parent1_id=request.parent1_id,
            parent2_id=request.parent2_id,
            offspring_id=request.offspring_id,
        )

        agent_component = entity.get_component(AgentComponent)
        if not agent_component:
            raise HTTPException(status_code=500, detail="Failed to create offspring")

        return AgentResponse(
            agent_id=entity.id,
            name=agent_component.name,
            spirit=agent_component.spirit,
            style=agent_component.style,
            active=entity.active,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating offspring: {e}")
        raise HTTPException(status_code=500, detail="Failed to create offspring")


@router.get("/agents/{agent_id}/mates")
async def find_compatible_mates(
    agent_id: str, max_results: int = 5, world: AgentWorld = Depends(get_world)
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
    agent1_id: str, agent2_id: str, world: AgentWorld = Depends(get_world)
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
    agent_id: str, depth: int = 3, world: AgentWorld = Depends(get_world)
):
    """Get agent family tree and lineage."""
    try:
        lineage = world.get_agent_lineage(agent_id, depth)
        return lineage
    except Exception as e:
        logger.error(f"Error getting lineage: {e}")
        raise HTTPException(status_code=500, detail="Failed to get agent lineage")


@router.post("/breeding/enable")
async def enable_breeding(enabled: bool = True, world: AgentWorld = Depends(get_world)):
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


# Position and Movement Endpoints

@router.get("/agents/{agent_id}/position", response_model=PositionResponse)
async def get_agent_position(agent_id: str, world: AgentWorld = Depends(get_world)):
    """Get the current position of an agent."""
    try:
        entity = world.get_entity(agent_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        position_component = entity.get_component(PositionComponent)
        if not position_component:
            raise HTTPException(status_code=404, detail="Agent has no position component")
        
        return PositionResponse(
            agent_id=agent_id,
            x=position_component.x,
            y=position_component.y,
            target_x=position_component.target_x,
            target_y=position_component.target_y,
            velocity_x=position_component.velocity_x,
            velocity_y=position_component.velocity_y,
            movement_speed=position_component.movement_speed
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agent position: {e}")
        raise HTTPException(status_code=500, detail="Failed to get agent position")


@router.get("/agents/positions")
async def get_all_agent_positions(world: AgentWorld = Depends(get_world)):
    """Get positions of all agents in the world."""
    try:
        positions = {}
        for entity in world.get_agent_entities():
            position_component = entity.get_component(PositionComponent)
            if position_component:
                positions[entity.id] = {
                    "x": position_component.x,
                    "y": position_component.y,
                    "target_x": position_component.target_x,
                    "target_y": position_component.target_y,
                    "velocity_x": position_component.velocity_x,
                    "velocity_y": position_component.velocity_y,
                    "movement_speed": position_component.movement_speed
                }
        return {"positions": positions}
    except Exception as e:
        logger.error(f"Error getting all agent positions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get agent positions")


@router.post("/agents/{agent_id}/move", response_model=PositionResponse)
async def move_agent(agent_id: str, request: MoveRequest, world: AgentWorld = Depends(get_world)):
    """Move an agent to a specific position."""
    try:
        entity = world.get_entity(agent_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        position_component = entity.get_component(PositionComponent)
        if not position_component:
            raise HTTPException(status_code=404, detail="Agent has no position component")
        
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
            movement_speed=position_component.movement_speed
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error moving agent: {e}")
        raise HTTPException(status_code=500, detail="Failed to move agent")


@router.post("/agents/{agent_id}/move_towards", response_model=PositionResponse)
async def move_agent_towards(agent_id: str, request: MoveTowardsRequest, world: AgentWorld = Depends(get_world)):
    """Move an agent towards another agent."""
    try:
        entity = world.get_entity(agent_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        target_entity = world.get_entity(request.target_agent_id)
        if not target_entity:
            raise HTTPException(status_code=404, detail="Target agent not found")
        
        position_component = entity.get_component(PositionComponent)
        target_position_component = target_entity.get_component(PositionComponent)
        
        if not position_component or not target_position_component:
            raise HTTPException(status_code=404, detail="Agent or target has no position component")
        
        # Calculate direction towards target
        dx = target_position_component.x - position_component.x
        dy = target_position_component.y - position_component.y
        distance = (dx * dx + dy * dy) ** 0.5
        
        if distance > 0:
            # Normalize direction and apply distance
            dx /= distance
            dy /= distance
            
            # Set target position at the specified distance from target
            position_component.target_x = target_position_component.x - dx * request.distance
            position_component.target_y = target_position_component.y - dy * request.distance
        
        return PositionResponse(
            agent_id=agent_id,
            x=position_component.x,
            y=position_component.y,
            target_x=position_component.target_x,
            target_y=position_component.target_y,
            velocity_x=position_component.velocity_x,
            velocity_y=position_component.velocity_y,
            movement_speed=position_component.movement_speed
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error moving agent towards target: {e}")
        raise HTTPException(status_code=500, detail="Failed to move agent towards target")


@router.get("/agents/{agent1_id}/distance/{agent2_id}")
async def get_agent_distance(agent1_id: str, agent2_id: str, world: AgentWorld = Depends(get_world)):
    """Get the distance between two agents."""
    try:
        entity1 = world.get_entity(agent1_id)
        entity2 = world.get_entity(agent2_id)
        
        if not entity1 or not entity2:
            raise HTTPException(status_code=404, detail="One or both agents not found")
        
        position1 = entity1.get_component(PositionComponent)
        position2 = entity2.get_component(PositionComponent)
        
        if not position1 or not position2:
            raise HTTPException(status_code=404, detail="One or both agents have no position component")
        
        distance = position1.distance_to(position2)
        
        return {
            "agent1_id": agent1_id,
            "agent2_id": agent2_id,
            "distance": distance,
            "position1": {"x": position1.x, "y": position1.y},
            "position2": {"x": position2.x, "y": position2.y}
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agent distance: {e}")
        raise HTTPException(status_code=500, detail="Failed to get agent distance")


@router.get("/agents/{agent_id}/nearby")
async def get_nearby_agents(agent_id: str, radius: float = 100.0, world: AgentWorld = Depends(get_world)):
    """Get all agents within a certain radius of an agent."""
    try:
        entity = world.get_entity(agent_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        position_component = entity.get_component(PositionComponent)
        if not position_component:
            raise HTTPException(status_code=404, detail="Agent has no position component")
        
        nearby_agents = []
        for other_entity in world.get_agent_entities():
            if other_entity.id == agent_id:
                continue
            
            other_position = other_entity.get_component(PositionComponent)
            if other_position:
                distance = position_component.distance_to(other_position)
                if distance <= radius:
                    agent_component = other_entity.get_component(AgentComponent)
                    if agent_component:
                        nearby_agents.append(NearbyAgentResponse(
                            agent_id=other_entity.id,
                            name=agent_component.name,
                            spirit=agent_component.spirit,
                            x=other_position.x,
                            y=other_position.y,
                            distance=distance
                        ))
        
        return {"nearby_agents": nearby_agents, "radius": radius}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting nearby agents: {e}")
        raise HTTPException(status_code=500, detail="Failed to get nearby agents")


# Interaction and Communication Endpoints

@router.post("/agents/{agent_id}/interact")
async def initiate_interaction(agent_id: str, request: InteractionRequest, world: AgentWorld = Depends(get_world)):
    """Initiate an interaction between two agents."""
    try:
        entity1 = world.get_entity(agent_id)
        entity2 = world.get_entity(request.agent2_id)
        
        if not entity1 or not entity2:
            raise HTTPException(status_code=404, detail="One or both agents not found")
        
        interaction_component1 = entity1.get_component(InteractionComponent)
        if not interaction_component1:
            raise HTTPException(status_code=404, detail="Agent has no interaction component")
        
        # Check if agent can interact
        if not interaction_component1.can_interact():
            return {
                "success": False,
                "message": "Agent cannot interact (low energy, cooldown, or too many active interactions)",
                "social_energy": interaction_component1.social_energy,
                "active_interactions": len(interaction_component1.active_interactions)
            }
        
        # For now, return a simple interaction initiation
        # In a full implementation, this would create an actual interaction
        return {
            "success": True,
            "message": f"Interaction initiated between {agent_id} and {request.agent2_id}",
            "interaction_type": request.interaction_type,
            "agent1_energy": interaction_component1.social_energy
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error initiating interaction: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate interaction")


@router.post("/agents/{agent_id}/chat")
async def send_chat_message(agent_id: str, request: ChatRequest, world: AgentWorld = Depends(get_world)):
    """Send a chat message from one agent to another."""
    try:
        entity1 = world.get_entity(agent_id)
        entity2 = world.get_entity(request.receiver_id)
        
        if not entity1 or not entity2:
            raise HTTPException(status_code=404, detail="One or both agents not found")
        
        interaction_component1 = entity1.get_component(InteractionComponent)
        if not interaction_component1:
            raise HTTPException(status_code=404, detail="Agent has no interaction component")
        
        # Check if agent can interact
        if not interaction_component1.can_interact():
            return {
                "success": False,
                "message": "Agent cannot send message (low energy, cooldown, or too many active interactions)",
                "social_energy": interaction_component1.social_energy
            }
        
        # For now, return a simple chat message result
        # In a full implementation, this would create an actual interaction and store the message
        return {
            "success": True,
            "message": f"Message sent from {agent_id} to {request.receiver_id}",
            "content": request.message,
            "interaction_type": request.interaction_type,
            "sender_energy": interaction_component1.social_energy
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending chat message: {e}")
        raise HTTPException(status_code=500, detail="Failed to send chat message")


@router.get("/agents/{agent_id}/interactions")
async def get_interaction_history(agent_id: str, limit: int = 10, world: AgentWorld = Depends(get_world)):
    """Get the interaction history for an agent."""
    try:
        entity = world.get_entity(agent_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        interaction_component = entity.get_component(InteractionComponent)
        if not interaction_component:
            raise HTTPException(status_code=404, detail="Agent has no interaction component")
        
        # Get recent interactions
        recent_interactions = interaction_component.interaction_history[-limit:]
        
        interactions = []
        for interaction in recent_interactions:
            interactions.append(InteractionResponse(
                interaction_id=interaction.id,
                participants=interaction.participants,
                interaction_type=interaction.interaction_type.value,
                content=interaction.content,
                outcome=interaction.outcome.value,
                relationship_impact=interaction.relationship_impact,
                timestamp=interaction.timestamp.isoformat(),
                duration=interaction.duration,
                energy_cost=interaction.energy_cost
            ))
        
        return {"interactions": interactions, "total_count": len(interaction_component.interaction_history)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting interaction history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get interaction history")


@router.get("/agents/{agent_id}/relationships")
async def get_agent_relationships(agent_id: str, world: AgentWorld = Depends(get_world)):
    """Get all relationships for an agent."""
    try:
        entity = world.get_entity(agent_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        interaction_component = entity.get_component(InteractionComponent)
        if not interaction_component:
            raise HTTPException(status_code=404, detail="Agent has no interaction component")
        
        relationships = []
        for relationship in interaction_component.relationship_map.values():
            relationships.append(RelationshipResponse(
                agent_id=relationship.agent_id,
                relationship_type=relationship.relationship_type,
                strength=relationship.strength,
                trust_level=relationship.trust_level,
                familiarity=relationship.familiarity,
                last_interaction=relationship.last_interaction.isoformat(),
                interaction_count=relationship.interaction_count,
                positive_interactions=relationship.positive_interactions,
                negative_interactions=relationship.negative_interactions,
                total_time_together=relationship.total_time_together
            ))
        
        return {"relationships": relationships, "total_count": len(relationships)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agent relationships: {e}")
        raise HTTPException(status_code=500, detail="Failed to get agent relationships")


@router.get("/agents/{agent_id}/social_stats", response_model=SocialStatsResponse)
async def get_agent_social_stats(agent_id: str, world: AgentWorld = Depends(get_world)):
    """Get social interaction statistics for an agent."""
    try:
        entity = world.get_entity(agent_id)
        if not entity:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        interaction_component = entity.get_component(InteractionComponent)
        if not interaction_component:
            raise HTTPException(status_code=404, detail="Agent has no interaction component")
        
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
            communication_style=stats["communication_style"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agent social stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get agent social stats")
