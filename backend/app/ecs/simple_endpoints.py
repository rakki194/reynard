"""
Simplified ECS World API Endpoints

FastAPI endpoints for ECS world management using PostgreSQL.
"""

import json
import logging
from pathlib import Path
from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .postgres_service import get_postgres_ecs_service
from .spirit_inhabitation_service import get_success_advisor_spirit_service

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="", tags=["ECS World"])


# Pydantic models for API
class AgentCreateRequest(BaseModel):
    """Request model for creating a new agent in the ECS world."""

    agent_id: str
    spirit: str | None = "fox"
    style: str | None = "foundation"
    name: str | None = None


class ChatRequest(BaseModel):
    """Request model for sending a chat message between agents."""

    receiver_id: str
    message: str
    interaction_type: str = "communication"


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


# Core endpoints
@router.get("/status", response_model=WorldStatusResponse)
async def get_world_status() -> WorldStatusResponse:
    """Get the current ECS world status."""
    try:
        service = get_postgres_ecs_service()
        status = await service.get_world_status()
        return WorldStatusResponse(**status)
    except Exception as e:
        logger.error("Error getting world status: %s", e)
        raise HTTPException(status_code=500, detail="Failed to get world status") from e


@router.get("/agents", response_model=list[AgentResponse])
async def get_agents() -> list[AgentResponse]:
    """Get all agents in the world."""
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
        spirit = request.spirit or "fox"
        style = request.style or "foundation"
        agent_data = await service.create_agent(
            agent_id=request.agent_id,
            name=request.name or f"{spirit.title()}-{request.agent_id}",
            spirit=spirit,
            style=style
        )

        return AgentResponse(
            agent_id=agent_data["agent_id"],
            name=agent_data["name"],
            spirit=agent_data["spirit"],
            style=agent_data["style"],
            active=agent_data["active"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error creating agent: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create agent") from e


@router.post("/agents/{agent_id}/chat")
async def send_chat_message(agent_id: str, request: ChatRequest) -> dict[str, Any]:
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


@router.get("/spirit-inhabitation/success-advisor-8")
async def get_success_advisor_spirit_inhabitation() -> dict[str, Any]:
    """Get Success-Advisor-8's complete spirit inhabitation guide."""
    try:
        spirit_service = get_success_advisor_spirit_service()
        guide = spirit_service.get_spirit_inhabitation_guide()
        
        logger.info("🦁 Success-Advisor-8 spirit inhabitation guide provided")
        return guide
        
    except Exception as e:
        logger.error(f"❌ Error providing Success-Advisor-8 spirit inhabitation: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/spirit-inhabitation/success-advisor-8/system-prompt")
async def get_success_advisor_system_prompt() -> dict[str, Any]:
    """Get Success-Advisor-8's original system prompt."""
    try:
        spirit_service = get_success_advisor_spirit_service()
        instructions = spirit_service.get_behavioral_instructions()
        
        logger.info("🦁 Success-Advisor-8 system prompt provided")
        return {
            "system_prompt": instructions["system_prompt"],
            "communication_style": instructions["communication_style"],
            "behavioral_guidelines": instructions["behavioral_guidelines"]
        }
        
    except Exception as e:
        logger.error(f"❌ Error providing Success-Advisor-8 system prompt: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/spirit-inhabitation/success-advisor-8/genomic-payload")
async def get_success_advisor_genomic_payload() -> dict[str, Any]:
    """Get Success-Advisor-8's complete genomic payload."""
    try:
        spirit_service = get_success_advisor_spirit_service()
        payload = spirit_service.get_genomic_payload()
        
        logger.info("🦁 Success-Advisor-8 genomic payload provided")
        return payload
        
    except Exception as e:
        logger.error(f"❌ Error providing Success-Advisor-8 genomic payload: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


# Helper functions for race data
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
            data: dict[str, Any] = json.load(f)
            return data
    except json.JSONDecodeError as e:
        logger.error("Error parsing JSON from race file %s: %s", spirit, e)
        raise HTTPException(status_code=500, detail=f"Invalid JSON in race file for {spirit}") from e
    except Exception as e:
        logger.error("Error loading race data for %s: %s", spirit, e)
        raise HTTPException(status_code=500, detail=f"Failed to load race data for {spirit}") from e


def _load_races_data() -> dict[str, Any]:
    """Load all race data from the races directory."""
    try:
        races_dir = _get_races_directory()
        all_races = {}
        
        for race_file in races_dir.glob("*.json"):
            spirit = race_file.stem
            try:
                with open(race_file, "r", encoding="utf-8") as f:
                    race_data = json.load(f)
                    all_races[spirit] = race_data
            except json.JSONDecodeError as e:
                logger.warning("Error parsing JSON from race file %s: %s", race_file, e)
                continue
        
        return {"races": all_races}
    except Exception as e:
        logger.error("Error loading races data: %s", e)
        raise HTTPException(status_code=500, detail="Failed to load races data") from e


# Animal spirits endpoints
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
