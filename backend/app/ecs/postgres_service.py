"""
PostgreSQL-based ECS World Service

Provides ECS world functionality using PostgreSQL database instead of JSON files.
"""

import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from uuid import UUID

from fastapi import FastAPI, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from .database import ecs_db, Agent, PersonalityTrait, PhysicalTrait, AbilityTrait, AgentPosition, AgentInteraction, AgentAchievement, AgentSpecialization, AgentDomainExpertise, AgentWorkflowPreference

logger = logging.getLogger(__name__)


class PostgresECSWorldService:
    """
    PostgreSQL-based ECS World service for FastAPI backend integration.

    Provides database-backed ECS world functionality with full CRUD operations
    for agents, traits, interactions, and other ECS components.
    """

    def __init__(self):
        """Initialize the PostgreSQL ECS world service."""
        self.db = ecs_db
        self._initialized = False

    async def startup(self) -> None:
        """Initialize the PostgreSQL ECS world service on application startup."""
        try:
            logger.info("🌍 Initializing PostgreSQL ECS World Service")

            # Create tables if they don't exist
            await self.db.create_tables()

            # Check database health
            if not await self.db.health_check():
                raise RuntimeError("Database health check failed")

            self._initialized = True
            logger.info("✅ PostgreSQL ECS World Service initialized successfully")

        except Exception as e:
            logger.error(f"❌ Failed to initialize PostgreSQL ECS World Service: {e}")
            raise

    async def shutdown(self) -> None:
        """Shutdown the PostgreSQL ECS world service."""
        try:
            logger.info("🌍 Shutting down PostgreSQL ECS World Service")
            self.db.close()
            self._initialized = False
            logger.info("✅ PostgreSQL ECS World Service shut down successfully")

        except Exception as e:
            logger.error(f"❌ Error shutting down PostgreSQL ECS World Service: {e}")

    def get_session(self) -> Session:
        """Get a database session."""
        if not self._initialized:
            raise RuntimeError("ECS World Service not initialized")
        return self.db.get_session()

    # Agent Management Methods

    async def create_agent(
        self,
        agent_id: str,
        name: str,
        spirit: str,
        style: str,
        generation: int = 1,
        personality_traits: Optional[Dict[str, float]] = None,
        physical_traits: Optional[Dict[str, float]] = None,
        ability_traits: Optional[Dict[str, float]] = None,
        specializations: Optional[List[str]] = None,
        domain_expertise: Optional[List[str]] = None,
        achievements: Optional[List[str]] = None,
        workflow_preferences: Optional[Dict[str, bool]] = None
    ) -> Dict[str, Any]:
        """
        Create a new agent in the ECS world.

        Args:
            agent_id: Unique agent identifier
            name: Agent name
            spirit: Agent spirit type
            style: Agent naming style
            generation: Agent generation number
            personality_traits: Dictionary of personality traits
            physical_traits: Dictionary of physical traits
            ability_traits: Dictionary of ability traits
            specializations: List of specializations
            domain_expertise: List of domain expertise areas
            achievements: List of achievements
            workflow_preferences: Dictionary of workflow preferences

        Returns:
            Dictionary containing the created agent data
        """
        try:
            with self.get_session() as session:
                # Check if agent already exists
                existing_agent = session.query(Agent).filter(Agent.agent_id == agent_id).first()
                if existing_agent:
                    raise HTTPException(status_code=400, detail=f"Entity {agent_id} already exists")

                # Create the agent
                agent = Agent(
                    agent_id=agent_id,
                    name=name,
                    spirit=spirit,
                    style=style,
                    generation=generation,
                    active=True
                )
                session.add(agent)
                session.flush()  # Get the agent ID

                # Add personality traits
                if personality_traits:
                    for trait_name, trait_value in personality_traits.items():
                        trait = PersonalityTrait(
                            agent_id=agent.id,
                            trait_name=trait_name,
                            trait_value=float(trait_value)
                        )
                        session.add(trait)

                # Add physical traits
                if physical_traits:
                    for trait_name, trait_value in physical_traits.items():
                        trait = PhysicalTrait(
                            agent_id=agent.id,
                            trait_name=trait_name,
                            trait_value=float(trait_value)
                        )
                        session.add(trait)

                # Add ability traits
                if ability_traits:
                    for trait_name, trait_value in ability_traits.items():
                        trait = AbilityTrait(
                            agent_id=agent.id,
                            trait_name=trait_name,
                            trait_value=float(trait_value)
                        )
                        session.add(trait)

                # Add specializations
                if specializations:
                    for specialization in specializations:
                        spec = AgentSpecialization(
                            agent_id=agent.id,
                            specialization=specialization,
                            proficiency=0.8  # Default proficiency
                        )
                        session.add(spec)

                # Add domain expertise
                if domain_expertise:
                    for domain in domain_expertise:
                        expertise = AgentDomainExpertise(
                            agent_id=agent.id,
                            domain=domain,
                            expertise_level=0.7  # Default expertise level
                        )
                        session.add(expertise)

                # Add achievements
                if achievements:
                    for achievement in achievements:
                        ach = AgentAchievement(
                            agent_id=agent.id,
                            achievement_name=achievement,
                            achievement_description=f"Achievement: {achievement}"
                        )
                        session.add(ach)

                # Add workflow preferences
                if workflow_preferences:
                    for pref_name, pref_value in workflow_preferences.items():
                        pref = AgentWorkflowPreference(
                            agent_id=agent.id,
                            preference_name=pref_name,
                            preference_value=bool(pref_value)
                        )
                        session.add(pref)

                # Add position data
                position = AgentPosition(
                    agent_id=agent.id,
                    x=0.0,
                    y=0.0,
                    target_x=0.0,
                    target_y=0.0,
                    velocity_x=0.0,
                    velocity_y=0.0,
                    movement_speed=1.0
                )
                session.add(position)

                session.commit()

                # Return agent data
                return {
                    "agent_id": agent.agent_id,
                    "name": agent.name,
                    "spirit": agent.spirit,
                    "style": agent.style,
                    "generation": agent.generation,
                    "active": agent.active,
                    "created_at": agent.created_at.isoformat(),
                    "last_activity": agent.last_activity.isoformat()
                }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to create agent {agent_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create agent: {str(e)}")

    async def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """
        Get an agent by ID.

        Args:
            agent_id: Agent identifier

        Returns:
            Dictionary containing agent data or None if not found
        """
        try:
            with self.get_session() as session:
                agent = session.query(Agent).filter(Agent.agent_id == agent_id).first()
                if not agent:
                    return None

                # Get all related data
                personality_traits = {t.trait_name: t.trait_value for t in agent.personality_traits}
                physical_traits = {t.trait_name: t.trait_value for t in agent.physical_traits}
                ability_traits = {t.trait_name: t.trait_value for t in agent.ability_traits}
                specializations = [s.specialization for s in agent.specializations]
                domain_expertise = [d.domain for d in agent.domain_expertise]
                achievements = [a.achievement_name for a in agent.achievements]
                workflow_preferences = {w.preference_name: w.preference_value for w in agent.workflow_preferences}

                position = agent.position
                position_data = {
                    "x": position.x if position else 0.0,
                    "y": position.y if position else 0.0,
                    "target_x": position.target_x if position else 0.0,
                    "target_y": position.target_y if position else 0.0,
                    "velocity_x": position.velocity_x if position else 0.0,
                    "velocity_y": position.velocity_y if position else 0.0,
                    "movement_speed": position.movement_speed if position else 1.0
                }

                return {
                    "agent_id": agent.agent_id,
                    "name": agent.name,
                    "spirit": agent.spirit,
                    "style": agent.style,
                    "generation": agent.generation,
                    "active": agent.active,
                    "created_at": agent.created_at.isoformat(),
                    "updated_at": agent.updated_at.isoformat(),
                    "last_activity": agent.last_activity.isoformat(),
                    "personality_traits": personality_traits,
                    "physical_traits": physical_traits,
                    "ability_traits": ability_traits,
                    "specializations": specializations,
                    "domain_expertise": domain_expertise,
                    "achievements": achievements,
                    "workflow_preferences": workflow_preferences,
                    "position": position_data
                }

        except Exception as e:
            logger.error(f"❌ Failed to get agent {agent_id}: {e}")
            return None

    async def get_all_agents(self) -> List[Dict[str, Any]]:
        """
        Get all agents in the ECS world.

        Returns:
            List of dictionaries containing agent data
        """
        try:
            with self.get_session() as session:
                agents = session.query(Agent).filter(Agent.active == True).all()
                
                result = []
                for agent in agents:
                    result.append({
                        "agent_id": agent.agent_id,
                        "name": agent.name,
                        "spirit": agent.spirit,
                        "style": agent.style,
                        "generation": agent.generation,
                        "active": agent.active,
                        "created_at": agent.created_at.isoformat(),
                        "last_activity": agent.last_activity.isoformat()
                    })
                
                return result

        except Exception as e:
            logger.error(f"❌ Failed to get all agents: {e}")
            return []

    async def send_message(
        self,
        sender_id: str,
        receiver_id: str,
        message: str,
        interaction_type: str = "communication"
    ) -> Dict[str, Any]:
        """
        Send a message between agents.

        Args:
            sender_id: Sender agent ID
            receiver_id: Receiver agent ID
            message: Message content
            interaction_type: Type of interaction

        Returns:
            Dictionary containing interaction data
        """
        try:
            with self.get_session() as session:
                # Check if both agents exist
                sender = session.query(Agent).filter(Agent.agent_id == sender_id).first()
                receiver = session.query(Agent).filter(Agent.agent_id == receiver_id).first()

                if not sender or not receiver:
                    raise HTTPException(status_code=404, detail="One or both agents not found")

                # Create interaction
                interaction = AgentInteraction(
                    sender_id=sender.id,
                    receiver_id=receiver.id,
                    interaction_type=interaction_type,
                    message=message,
                    energy_level=1.0
                )
                session.add(interaction)

                # Update last activity for both agents
                sender.last_activity = datetime.now(timezone.utc)
                receiver.last_activity = datetime.now(timezone.utc)

                session.commit()

                return {
                    "success": True,
                    "message": f"Message sent from {sender_id} to {receiver_id}",
                    "content": message,
                    "interaction_type": interaction_type,
                    "sender_energy": 1.0,
                    "timestamp": interaction.created_at.isoformat()
                }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to send message from {sender_id} to {receiver_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

    async def get_world_status(self) -> Dict[str, Any]:
        """
        Get the current status of the ECS world.

        Returns:
            Dictionary containing world status information
        """
        try:
            with self.get_session() as session:
                total_agents = session.query(Agent).count()
                active_agents = session.query(Agent).filter(Agent.active == True).count()
                total_interactions = session.query(AgentInteraction).count()

                return {
                    "status": "active",
                    "entity_count": total_agents,
                    "system_count": 5,  # Fixed number of systems
                    "agent_count": active_agents,
                    "mature_agents": active_agents,  # All agents are considered mature
                    "total_interactions": total_interactions,
                    "database_type": "postgresql",
                    "initialized": self._initialized
                }

        except Exception as e:
            logger.error(f"❌ Failed to get world status: {e}")
            return {
                "status": "error",
                "error": str(e),
                "initialized": self._initialized
            }


# Global service instance
postgres_ecs_service = PostgresECSWorldService()


def get_postgres_ecs_service() -> PostgresECSWorldService:
    """Get the global PostgreSQL ECS service instance."""
    return postgres_ecs_service


def register_postgres_ecs_service(app: FastAPI) -> None:
    """Register the PostgreSQL ECS service with the FastAPI app."""
    @app.on_event("startup")
    async def startup_event():
        await postgres_ecs_service.startup()

    @app.on_event("shutdown")
    async def shutdown_event():
        await postgres_ecs_service.shutdown()
