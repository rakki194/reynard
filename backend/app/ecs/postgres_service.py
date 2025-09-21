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

from .database import (
    ecs_db,
    Agent,
    PersonalityTrait,
    PhysicalTrait,
    AbilityTrait,
    AgentPosition,
    AgentInteraction,
    AgentAchievement,
    AgentSpecialization,
    AgentDomainExpertise,
    AgentWorkflowPreference,
    NamingSpirit,
    NamingComponent,
    NamingConfig,
)

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

    def _ensure_initialized(self) -> None:
        """Ensure the service is initialized."""
        if not self._initialized:
            logger.warning(
                "ECS World Service not initialized, initializing synchronously..."
            )
            try:
                # Initialize synchronously without async
                logger.info("🌍 Initializing PostgreSQL ECS World Service")

                # Create tables if they don't exist (synchronous)
                self.db.create_tables_sync()

                # Check database health (synchronous)
                if not self.db.health_check_sync():
                    raise RuntimeError("Database health check failed")

                self._initialized = True
                logger.info("✅ PostgreSQL ECS World Service initialized successfully")

            except Exception as e:
                logger.error(f"Failed to initialize ECS service: {e}")
                raise RuntimeError("ECS World Service not initialized")

    def get_session(self) -> Session:
        """Get a database session."""
        self._ensure_initialized()
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
        workflow_preferences: Optional[Dict[str, bool]] = None,
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
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                # Check if agent already exists
                existing_agent = (
                    session.query(Agent).filter(Agent.agent_id == agent_id).first()
                )
                if existing_agent:
                    raise HTTPException(
                        status_code=400, detail=f"Entity {agent_id} already exists"
                    )

                # Create the agent
                agent = Agent(
                    agent_id=agent_id,
                    name=name,
                    spirit=spirit,
                    style=style,
                    generation=generation,
                    active=True,
                )
                session.add(agent)
                session.flush()  # Get the agent ID

                # Add personality traits
                if personality_traits:
                    for trait_name, trait_value in personality_traits.items():
                        trait = PersonalityTrait(
                            agent_id=agent.id,
                            trait_name=trait_name,
                            trait_value=float(trait_value),
                        )
                        session.add(trait)

                # Add physical traits
                if physical_traits:
                    for trait_name, trait_value in physical_traits.items():
                        trait = PhysicalTrait(
                            agent_id=agent.id,
                            trait_name=trait_name,
                            trait_value=float(trait_value),
                        )
                        session.add(trait)

                # Add ability traits
                if ability_traits:
                    for trait_name, trait_value in ability_traits.items():
                        trait = AbilityTrait(
                            agent_id=agent.id,
                            trait_name=trait_name,
                            trait_value=float(trait_value),
                        )
                        session.add(trait)

                # Add specializations
                if specializations:
                    for specialization in specializations:
                        spec = AgentSpecialization(
                            agent_id=agent.id,
                            specialization=specialization,
                            proficiency=0.8,  # Default proficiency
                        )
                        session.add(spec)

                # Add domain expertise
                if domain_expertise:
                    for domain in domain_expertise:
                        expertise = AgentDomainExpertise(
                            agent_id=agent.id,
                            domain=domain,
                            expertise_level=0.7,  # Default expertise level
                        )
                        session.add(expertise)

                # Add achievements
                if achievements:
                    for achievement in achievements:
                        ach = AgentAchievement(
                            agent_id=agent.id,
                            achievement_name=achievement,
                            achievement_description=f"Achievement: {achievement}",
                        )
                        session.add(ach)

                # Add workflow preferences
                if workflow_preferences:
                    for pref_name, pref_value in workflow_preferences.items():
                        pref = AgentWorkflowPreference(
                            agent_id=agent.id,
                            preference_name=pref_name,
                            preference_value=bool(pref_value),
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
                    movement_speed=1.0,
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
                    "last_activity": agent.last_activity.isoformat(),
                }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to create agent {agent_id}: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to create agent: {str(e)}"
            )

    async def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """
        Get an agent by ID.

        Args:
            agent_id: Agent identifier

        Returns:
            Dictionary containing agent data or None if not found
        """
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                agent = session.query(Agent).filter(Agent.agent_id == agent_id).first()
                if not agent:
                    return None

                # Get all related data
                personality_traits = {
                    t.trait_name: t.trait_value for t in agent.personality_traits
                }
                physical_traits = {
                    t.trait_name: t.trait_value for t in agent.physical_traits
                }
                ability_traits = {
                    t.trait_name: t.trait_value for t in agent.ability_traits
                }
                specializations = [s.specialization for s in agent.specializations]
                domain_expertise = [d.domain for d in agent.domain_expertise]
                achievements = [a.achievement_name for a in agent.achievements]
                workflow_preferences = {
                    w.preference_name: w.preference_value
                    for w in agent.workflow_preferences
                }

                position = agent.position
                position_data = {
                    "x": position.x if position else 0.0,
                    "y": position.y if position else 0.0,
                    "target_x": position.target_x if position else 0.0,
                    "target_y": position.target_y if position else 0.0,
                    "velocity_x": position.velocity_x if position else 0.0,
                    "velocity_y": position.velocity_y if position else 0.0,
                    "movement_speed": position.movement_speed if position else 1.0,
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
                    "position": position_data,
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
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                agents = session.query(Agent).filter(Agent.active == True).all()

                result = []
                for agent in agents:
                    result.append(
                        {
                            "agent_id": agent.agent_id,
                            "name": agent.name,
                            "spirit": agent.spirit,
                            "style": agent.style,
                            "generation": agent.generation,
                            "active": agent.active,
                            "created_at": agent.created_at.isoformat(),
                            "last_activity": agent.last_activity.isoformat(),
                        }
                    )

                return result

        except Exception as e:
            logger.error(f"❌ Failed to get all agents: {e}")
            return []

    async def send_message(
        self,
        sender_id: str,
        receiver_id: str,
        message: str,
        interaction_type: str = "communication",
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
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                # Check if both agents exist
                sender = (
                    session.query(Agent).filter(Agent.agent_id == sender_id).first()
                )
                receiver = (
                    session.query(Agent).filter(Agent.agent_id == receiver_id).first()
                )

                if not sender or not receiver:
                    raise HTTPException(
                        status_code=404, detail="One or both agents not found"
                    )

                # Create interaction
                interaction = AgentInteraction(
                    sender_id=sender.id,
                    receiver_id=receiver.id,
                    interaction_type=interaction_type,
                    message=message,
                    energy_level=1.0,
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
                    "timestamp": interaction.created_at.isoformat(),
                }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(
                f"❌ Failed to send message from {sender_id} to {receiver_id}: {e}"
            )
            raise HTTPException(
                status_code=500, detail=f"Failed to send message: {str(e)}"
            )

    async def get_agent_interactions(
        self, agent_id: str, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get interaction history for a specific agent.

        Args:
            agent_id: Agent identifier (string)
            limit: Maximum number of interactions to return

        Returns:
            List of interaction dictionaries
        """
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                # First, get the agent's UUID from the string agent_id
                agent = session.query(Agent).filter(Agent.agent_id == agent_id).first()
                if not agent:
                    logger.warning(f"Agent {agent_id} not found")
                    return []

                # Get interactions where the agent is either sender or receiver using UUID
                interactions = (
                    session.query(AgentInteraction)
                    .filter(
                        or_(
                            AgentInteraction.sender_id == agent.id,
                            AgentInteraction.receiver_id == agent.id,
                        )
                    )
                    .order_by(AgentInteraction.created_at.desc())
                    .limit(limit)
                    .all()
                )

                result = []
                for interaction in interactions:
                    # Get sender and receiver agent_ids for display
                    sender_agent = (
                        session.query(Agent)
                        .filter(Agent.id == interaction.sender_id)
                        .first()
                    )
                    receiver_agent = (
                        session.query(Agent)
                        .filter(Agent.id == interaction.receiver_id)
                        .first()
                    )

                    result.append(
                        {
                            "interaction_id": str(interaction.id),
                            "sender_id": (
                                sender_agent.agent_id
                                if sender_agent
                                else str(interaction.sender_id)
                            ),
                            "receiver_id": (
                                receiver_agent.agent_id
                                if receiver_agent
                                else str(interaction.receiver_id)
                            ),
                            "message": interaction.message,
                            "interaction_type": interaction.interaction_type,
                            "timestamp": interaction.created_at.isoformat(),
                            "energy_level": interaction.energy_level,
                        }
                    )

                return result

        except Exception as e:
            logger.error(f"❌ Failed to get interactions for agent {agent_id}: {e}")
            return []

    async def get_world_status(self) -> Dict[str, Any]:
        """
        Get the current status of the ECS world.

        Returns:
            Dictionary containing world status information
        """
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                total_agents = session.query(Agent).count()
                active_agents = (
                    session.query(Agent).filter(Agent.active == True).count()
                )
                total_interactions = session.query(AgentInteraction).count()

                return {
                    "status": "active",
                    "entity_count": total_agents,
                    "system_count": 5,  # Fixed number of systems
                    "agent_count": active_agents,
                    "mature_agents": active_agents,  # All agents are considered mature
                    "total_interactions": total_interactions,
                    "database_type": "postgresql",
                    "initialized": self._initialized,
                }

        except Exception as e:
            logger.error(f"❌ Failed to get world status: {e}")
            return {
                "status": "error",
                "error": str(e),
                "initialized": self._initialized,
            }

    # Naming Configuration Methods

    async def get_naming_spirits(self) -> Dict[str, Any]:
        """Get all available spirits with their configurations."""
        try:
            session = self.get_session()
            spirits = (
                session.query(NamingSpirit).filter(NamingSpirit.enabled == True).all()
            )

            result = {}
            for spirit in spirits:
                result[spirit.name] = spirit.to_dict()

            session.close()
            return {"spirits": result}

        except Exception as e:
            logger.error(f"Error getting naming spirits: {e}")
            raise

    async def get_naming_spirit(self, spirit_name: str) -> Dict[str, Any]:
        """Get a specific spirit configuration."""
        try:
            session = self.get_session()
            spirit = (
                session.query(NamingSpirit)
                .filter(
                    and_(NamingSpirit.name == spirit_name, NamingSpirit.enabled == True)
                )
                .first()
            )

            if not spirit:
                raise HTTPException(
                    status_code=404, detail=f"Spirit '{spirit_name}' not found"
                )

            result = spirit.to_dict()
            session.close()
            return {"spirit": spirit_name, "data": result}

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting spirit {spirit_name}: {e}")
            raise

    async def get_naming_components(self) -> Dict[str, Any]:
        """Get all naming components organized by type."""
        try:
            session = self.get_session()
            components = (
                session.query(NamingComponent)
                .filter(NamingComponent.enabled == True)
                .all()
            )

            result = {}
            for component in components:
                if component.component_type not in result:
                    result[component.component_type] = []
                result[component.component_type].append(component.component_value)

            session.close()
            return result

        except Exception as e:
            logger.error(f"Error getting naming components: {e}")
            raise

    async def get_naming_component_type(self, component_type: str) -> Dict[str, Any]:
        """Get a specific type of naming component."""
        try:
            session = self.get_session()
            components = (
                session.query(NamingComponent)
                .filter(
                    and_(
                        NamingComponent.component_type == component_type,
                        NamingComponent.enabled == True,
                    )
                )
                .all()
            )

            if not components:
                raise HTTPException(
                    status_code=404,
                    detail=f"Component type '{component_type}' not found",
                )

            values = [component.component_value for component in components]
            session.close()
            return {"component_type": component_type, "values": values}

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error getting component type {component_type}: {e}")
            raise

    async def get_naming_config(self) -> Dict[str, Any]:
        """Get the complete naming configuration."""
        try:
            session = self.get_session()
            configs = (
                session.query(NamingConfig).filter(NamingConfig.enabled == True).all()
            )

            result = {}
            for config in configs:
                result[config.config_key] = config.config_value

            session.close()
            return result

        except Exception as e:
            logger.error(f"Error getting naming config: {e}")
            raise

    async def get_naming_schemes(self) -> Dict[str, Any]:
        """Get all available naming schemes."""
        try:
            session = self.get_session()
            schemes_config = (
                session.query(NamingConfig)
                .filter(
                    and_(
                        NamingConfig.config_key == "schemes",
                        NamingConfig.enabled == True,
                    )
                )
                .first()
            )

            if not schemes_config:
                return {"schemes": {}}

            session.close()
            return {"schemes": schemes_config.config_value}

        except Exception as e:
            logger.error(f"Error getting naming schemes: {e}")
            raise

    async def get_naming_styles(self) -> Dict[str, Any]:
        """Get all available naming styles."""
        try:
            session = self.get_session()
            styles_config = (
                session.query(NamingConfig)
                .filter(
                    and_(
                        NamingConfig.config_key == "styles",
                        NamingConfig.enabled == True,
                    )
                )
                .first()
            )

            if not styles_config:
                return {"styles": {}}

            session.close()
            return {"styles": styles_config.config_value}

        except Exception as e:
            logger.error(f"Error getting naming styles: {e}")
            raise

    async def get_generation_numbers(self) -> Dict[str, Any]:
        """Get generation numbers for all spirits."""
        try:
            session = self.get_session()
            spirits = (
                session.query(NamingSpirit).filter(NamingSpirit.enabled == True).all()
            )

            result = {}
            for spirit in spirits:
                result[spirit.name] = spirit.generation_numbers

            session.close()
            return result

        except Exception as e:
            logger.error(f"Error getting generation numbers: {e}")
            raise

    async def get_spirit_generation_numbers(self, spirit_name: str) -> Dict[str, Any]:
        """Get generation numbers for a specific spirit."""
        try:
            session = self.get_session()
            spirit = (
                session.query(NamingSpirit)
                .filter(
                    and_(NamingSpirit.name == spirit_name, NamingSpirit.enabled == True)
                )
                .first()
            )

            if not spirit:
                raise HTTPException(
                    status_code=404, detail=f"Spirit '{spirit_name}' not found"
                )

            result = {"spirit": spirit_name, "numbers": spirit.generation_numbers}
            session.close()
            return result

        except HTTPException:
            raise
        except Exception as e:
            logger.error(
                f"Error getting generation numbers for spirit {spirit_name}: {e}"
            )
            raise


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
