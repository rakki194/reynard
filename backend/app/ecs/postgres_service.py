"""
PostgreSQL-based ECS World Service

Provides ECS world functionality using PostgreSQL database instead of JSON files.
"""

import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import FastAPI, HTTPException
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from .database import (
    AbilityTrait,
    Agent,
    AgentAchievement,
    AgentDomainExpertise,
    AgentInteraction,
    AgentLineage,
    AgentPosition,
    AgentRelationship,
    AgentSpecialization,
    AgentWorkflowPreference,
    BreedingRecord,
    NamingComponent,
    NamingConfig,
    NamingSpirit,
    PersonalityTrait,
    PhysicalTrait,
    WorldConfiguration,
    ecs_db,
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

    # Breeding and Genetic Compatibility Methods

    async def create_offspring(
        self,
        parent1_id: str,
        parent2_id: str,
        offspring_id: str,
        offspring_name: str = None,
    ) -> Dict[str, Any]:
        """
        Create offspring from two parent agents with genetic inheritance.

        Args:
            parent1_id: First parent agent ID
            parent2_id: Second parent agent ID
            offspring_id: Offspring agent ID
            offspring_name: Offspring name (optional)

        Returns:
            Dictionary containing the created offspring data
        """
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                # Get parent agents
                parent1 = (
                    session.query(Agent).filter(Agent.agent_id == parent1_id).first()
                )
                parent2 = (
                    session.query(Agent).filter(Agent.agent_id == parent2_id).first()
                )

                if not parent1 or not parent2:
                    raise HTTPException(
                        status_code=404, detail="One or both parent agents not found"
                    )

                # Calculate genetic compatibility
                compatibility_score = await self._calculate_genetic_compatibility(
                    parent1_id, parent2_id
                )

                if compatibility_score < 0.3:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Genetic compatibility too low: {compatibility_score:.2f}",
                    )

                # Generate offspring name if not provided
                if not offspring_name:
                    offspring_name = f"{parent1.spirit}-{parent2.spirit}-offspring"

                # Create offspring agent
                offspring_generation = max(parent1.generation, parent2.generation) + 1
                offspring = Agent(
                    agent_id=offspring_id,
                    name=offspring_name,
                    spirit=parent1.spirit,  # Inherit from first parent
                    style=parent1.style,
                    generation=offspring_generation,
                    active=True,
                )
                session.add(offspring)
                session.flush()

                # Inherit traits from parents
                await self._inherit_traits(session, offspring, parent1, parent2)

                # Create lineage record
                lineage = AgentLineage(
                    agent_id=offspring.id,
                    parent1_id=parent1.id,
                    parent2_id=parent2.id,
                    generation=offspring_generation,
                    lineage_path=json.dumps([parent1.agent_id, parent2.agent_id]),
                    genetic_markers={
                        "compatibility_score": compatibility_score,
                        "inherited_spirit": parent1.spirit,
                        "generation": offspring_generation,
                    },
                )
                session.add(lineage)

                # Create breeding record
                breeding_record = BreedingRecord(
                    parent1_id=parent1.id,
                    parent2_id=parent2.id,
                    offspring_id=offspring.id,
                    compatibility_score=compatibility_score,
                    genetic_analysis={
                        "parent1_traits": len(parent1.personality_traits),
                        "parent2_traits": len(parent2.personality_traits),
                        "inheritance_pattern": "blended",
                    },
                    breeding_success=True,
                )
                session.add(breeding_record)

                # Add position data
                position = AgentPosition(
                    agent_id=offspring.id,
                    x=(
                        (parent1.position.x + parent2.position.x) / 2
                        if parent1.position and parent2.position
                        else 0.0
                    ),
                    y=(
                        (parent1.position.y + parent2.position.y) / 2
                        if parent1.position and parent2.position
                        else 0.0
                    ),
                    target_x=0.0,
                    target_y=0.0,
                    velocity_x=0.0,
                    velocity_y=0.0,
                    movement_speed=1.0,
                )
                session.add(position)

                session.commit()

                return {
                    "offspring_id": offspring.agent_id,
                    "name": offspring.name,
                    "spirit": offspring.spirit,
                    "generation": offspring.generation,
                    "compatibility_score": compatibility_score,
                    "parent1_id": parent1.agent_id,
                    "parent2_id": parent2.agent_id,
                    "created_at": offspring.created_at.isoformat(),
                }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to create offspring: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to create offspring: {str(e)}"
            )

    async def _calculate_genetic_compatibility(
        self, agent1_id: str, agent2_id: str
    ) -> float:
        """Calculate genetic compatibility between two agents."""
        try:
            with self.get_session() as session:
                agent1 = (
                    session.query(Agent).filter(Agent.agent_id == agent1_id).first()
                )
                agent2 = (
                    session.query(Agent).filter(Agent.agent_id == agent2_id).first()
                )

                if not agent1 or not agent2:
                    return 0.0

                # Calculate trait similarity
                trait_similarity = 0.0
                trait_count = 0

                # Compare personality traits
                for trait1 in agent1.personality_traits:
                    for trait2 in agent2.personality_traits:
                        if trait1.trait_name == trait2.trait_name:
                            similarity = 1.0 - abs(
                                trait1.trait_value - trait2.trait_value
                            )
                            trait_similarity += similarity
                            trait_count += 1

                # Compare physical traits
                for trait1 in agent1.physical_traits:
                    for trait2 in agent2.physical_traits:
                        if trait1.trait_name == trait2.trait_name:
                            similarity = 1.0 - abs(
                                trait1.trait_value - trait2.trait_value
                            )
                            trait_similarity += similarity
                            trait_count += 1

                # Compare ability traits
                for trait1 in agent1.ability_traits:
                    for trait2 in agent2.ability_traits:
                        if trait1.trait_name == trait2.trait_name:
                            similarity = 1.0 - abs(
                                trait1.trait_value - trait2.trait_value
                            )
                            trait_similarity += similarity
                            trait_count += 1

                if trait_count == 0:
                    return 0.5  # Default compatibility if no traits to compare

                base_compatibility = trait_similarity / trait_count

                # Add spirit compatibility bonus
                spirit_bonus = 0.1 if agent1.spirit == agent2.spirit else 0.0

                # Add generation compatibility (closer generations are more compatible)
                generation_diff = abs(agent1.generation - agent2.generation)
                generation_bonus = max(0.0, 0.2 - (generation_diff * 0.05))

                final_compatibility = min(
                    1.0, base_compatibility + spirit_bonus + generation_bonus
                )
                return final_compatibility

        except Exception as e:
            logger.error(f"❌ Failed to calculate genetic compatibility: {e}")
            return 0.0

    async def _inherit_traits(
        self, session: Session, offspring: Agent, parent1: Agent, parent2: Agent
    ):
        """Inherit traits from parents to offspring."""
        try:
            # Inherit personality traits
            for trait1 in parent1.personality_traits:
                trait2 = next(
                    (
                        t
                        for t in parent2.personality_traits
                        if t.trait_name == trait1.trait_name
                    ),
                    None,
                )
                if trait2:
                    # Blend traits with slight mutation
                    import random

                    base_value = (trait1.trait_value + trait2.trait_value) / 2
                    mutation = random.uniform(-0.1, 0.1)
                    final_value = max(0.0, min(1.0, base_value + mutation))

                    offspring_trait = PersonalityTrait(
                        agent_id=offspring.id,
                        trait_name=trait1.trait_name,
                        trait_value=final_value,
                    )
                    session.add(offspring_trait)

            # Inherit physical traits
            for trait1 in parent1.physical_traits:
                trait2 = next(
                    (
                        t
                        for t in parent2.physical_traits
                        if t.trait_name == trait1.trait_name
                    ),
                    None,
                )
                if trait2:
                    import random

                    base_value = (trait1.trait_value + trait2.trait_value) / 2
                    mutation = random.uniform(-0.1, 0.1)
                    final_value = max(0.0, min(1.0, base_value + mutation))

                    offspring_trait = PhysicalTrait(
                        agent_id=offspring.id,
                        trait_name=trait1.trait_name,
                        trait_value=final_value,
                    )
                    session.add(offspring_trait)

            # Inherit ability traits
            for trait1 in parent1.ability_traits:
                trait2 = next(
                    (
                        t
                        for t in parent2.ability_traits
                        if t.trait_name == trait1.trait_name
                    ),
                    None,
                )
                if trait2:
                    import random

                    base_value = (trait1.trait_value + trait2.trait_value) / 2
                    mutation = random.uniform(-0.1, 0.1)
                    final_value = max(0.0, min(1.0, base_value + mutation))

                    offspring_trait = AbilityTrait(
                        agent_id=offspring.id,
                        trait_name=trait1.trait_name,
                        trait_value=final_value,
                    )
                    session.add(offspring_trait)

        except Exception as e:
            logger.error(f"❌ Failed to inherit traits: {e}")
            raise

    async def find_compatible_mates(
        self, agent_id: str, max_results: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find compatible mates for an agent based on genetic compatibility.

        Args:
            agent_id: Agent identifier
            max_results: Maximum number of mates to return

        Returns:
            List of compatible mate information
        """
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                # Get all other agents
                other_agents = (
                    session.query(Agent)
                    .filter(and_(Agent.agent_id != agent_id, Agent.active == True))
                    .all()
                )

                mates = []
                for other_agent in other_agents:
                    compatibility = await self._calculate_genetic_compatibility(
                        agent_id, other_agent.agent_id
                    )

                    if compatibility >= 0.4:  # Minimum compatibility threshold
                        mates.append(
                            {
                                "agent_id": other_agent.agent_id,
                                "name": other_agent.name,
                                "spirit": other_agent.spirit,
                                "generation": other_agent.generation,
                                "compatibility_score": compatibility,
                            }
                        )

                # Sort by compatibility score (highest first)
                mates.sort(key=lambda x: x["compatibility_score"], reverse=True)

                return mates[:max_results]

        except Exception as e:
            logger.error(f"❌ Failed to find compatible mates: {e}")
            return []

    async def analyze_compatibility(
        self, agent1_id: str, agent2_id: str
    ) -> Dict[str, Any]:
        """
        Analyze genetic compatibility between two agents.

        Args:
            agent1_id: First agent identifier
            agent2_id: Second agent identifier

        Returns:
            Detailed compatibility analysis
        """
        self._ensure_initialized()
        try:
            compatibility_score = await self._calculate_genetic_compatibility(
                agent1_id, agent2_id
            )

            with self.get_session() as session:
                agent1 = (
                    session.query(Agent).filter(Agent.agent_id == agent1_id).first()
                )
                agent2 = (
                    session.query(Agent).filter(Agent.agent_id == agent2_id).first()
                )

                if not agent1 or not agent2:
                    raise HTTPException(
                        status_code=404, detail="One or both agents not found"
                    )

                # Detailed analysis
                analysis = {
                    "agent1_id": agent1_id,
                    "agent2_id": agent2_id,
                    "compatibility_score": compatibility_score,
                    "compatibility_level": self._get_compatibility_level(
                        compatibility_score
                    ),
                    "breeding_recommended": compatibility_score >= 0.4,
                    "spirit_compatibility": agent1.spirit == agent2.spirit,
                    "generation_difference": abs(agent1.generation - agent2.generation),
                    "trait_analysis": {
                        "personality_traits": len(agent1.personality_traits),
                        "physical_traits": len(agent1.physical_traits),
                        "ability_traits": len(agent1.ability_traits),
                    },
                    "recommendation": self._get_breeding_recommendation(
                        compatibility_score
                    ),
                }

                return analysis

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to analyze compatibility: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to analyze compatibility: {str(e)}"
            )

    def _get_compatibility_level(self, score: float) -> str:
        """Get compatibility level description."""
        if score >= 0.8:
            return "excellent"
        elif score >= 0.6:
            return "good"
        elif score >= 0.4:
            return "moderate"
        elif score >= 0.2:
            return "poor"
        else:
            return "very_poor"

    def _get_breeding_recommendation(self, score: float) -> str:
        """Get breeding recommendation based on compatibility score."""
        if score >= 0.7:
            return "Highly recommended for breeding"
        elif score >= 0.5:
            return "Good candidate for breeding"
        elif score >= 0.4:
            return "Acceptable for breeding"
        elif score >= 0.3:
            return "Not recommended for breeding"
        else:
            return "Strongly not recommended for breeding"

    async def get_agent_lineage(self, agent_id: str, depth: int = 3) -> Dict[str, Any]:
        """
        Get agent family tree and lineage.

        Args:
            agent_id: Agent identifier
            depth: Maximum depth to traverse

        Returns:
            Lineage information
        """
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                agent = session.query(Agent).filter(Agent.agent_id == agent_id).first()
                if not agent:
                    raise HTTPException(status_code=404, detail="Agent not found")

                lineage_record = (
                    session.query(AgentLineage)
                    .filter(AgentLineage.agent_id == agent.id)
                    .first()
                )

                if not lineage_record:
                    return {
                        "agent_id": agent_id,
                        "generation": agent.generation,
                        "lineage": "No lineage information available",
                        "parents": [],
                        "ancestors": [],
                    }

                # Build lineage tree
                lineage_tree = await self._build_lineage_tree(
                    session, lineage_record, depth
                )

                return {
                    "agent_id": agent_id,
                    "generation": agent.generation,
                    "lineage": lineage_tree,
                    "parents": [
                        {
                            "agent_id": (
                                lineage_record.parent1.agent_id
                                if lineage_record.parent1
                                else None
                            ),
                            "name": (
                                lineage_record.parent1.name
                                if lineage_record.parent1
                                else None
                            ),
                        },
                        {
                            "agent_id": (
                                lineage_record.parent2.agent_id
                                if lineage_record.parent2
                                else None
                            ),
                            "name": (
                                lineage_record.parent2.name
                                if lineage_record.parent2
                                else None
                            ),
                        },
                    ],
                    "genetic_markers": lineage_record.genetic_markers,
                }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to get agent lineage: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to get agent lineage: {str(e)}"
            )

    async def _build_lineage_tree(
        self, session: Session, lineage_record: AgentLineage, depth: int
    ) -> Dict[str, Any]:
        """Build lineage tree recursively."""
        if depth <= 0:
            return {
                "agent_id": lineage_record.agent.agent_id,
                "name": lineage_record.agent.name,
            }

        tree = {
            "agent_id": lineage_record.agent.agent_id,
            "name": lineage_record.agent.name,
            "generation": lineage_record.generation,
        }

        if lineage_record.parent1:
            parent1_lineage = (
                session.query(AgentLineage)
                .filter(AgentLineage.agent_id == lineage_record.parent1_id)
                .first()
            )
            if parent1_lineage:
                tree["parent1"] = await self._build_lineage_tree(
                    session, parent1_lineage, depth - 1
                )

        if lineage_record.parent2:
            parent2_lineage = (
                session.query(AgentLineage)
                .filter(AgentLineage.agent_id == lineage_record.parent2_id)
                .first()
            )
            if parent2_lineage:
                tree["parent2"] = await self._build_lineage_tree(
                    session, parent2_lineage, depth - 1
                )

        return tree

    # Position and Movement Methods

    async def get_agent_position(self, agent_id: str) -> Dict[str, Any]:
        """
        Get the current position of an agent.

        Args:
            agent_id: Agent identifier

        Returns:
            Position data
        """
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                agent = session.query(Agent).filter(Agent.agent_id == agent_id).first()
                if not agent:
                    raise HTTPException(status_code=404, detail="Agent not found")

                position = agent.position
                if not position:
                    # Create default position if none exists
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

                return {
                    "agent_id": agent_id,
                    "x": position.x,
                    "y": position.y,
                    "target_x": position.target_x,
                    "target_y": position.target_y,
                    "velocity_x": position.velocity_x,
                    "velocity_y": position.velocity_y,
                    "movement_speed": position.movement_speed,
                }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to get agent position: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to get agent position: {str(e)}"
            )

    async def get_all_agent_positions(self) -> Dict[str, Any]:
        """
        Get positions of all agents in the world.

        Returns:
            Dictionary containing all agent positions
        """
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                agents = session.query(Agent).filter(Agent.active == True).all()

                positions = []
                for agent in agents:
                    if agent.position:
                        positions.append(
                            {
                                "agent_id": agent.agent_id,
                                "name": agent.name,
                                "x": agent.position.x,
                                "y": agent.position.y,
                                "target_x": agent.position.target_x,
                                "target_y": agent.position.target_y,
                                "velocity_x": agent.position.velocity_x,
                                "velocity_y": agent.position.velocity_y,
                                "movement_speed": agent.position.movement_speed,
                            }
                        )

                return {
                    "total_agents": len(positions),
                    "positions": positions,
                }

        except Exception as e:
            logger.error(f"❌ Failed to get all agent positions: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to get all agent positions: {str(e)}"
            )

    async def move_agent(self, agent_id: str, x: float, y: float) -> Dict[str, Any]:
        """
        Move an agent to a specific position.

        Args:
            agent_id: Agent identifier
            x: Target X coordinate
            y: Target Y coordinate

        Returns:
            Updated position data
        """
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                agent = session.query(Agent).filter(Agent.agent_id == agent_id).first()
                if not agent:
                    raise HTTPException(status_code=404, detail="Agent not found")

                position = agent.position
                if not position:
                    position = AgentPosition(
                        agent_id=agent.id,
                        x=0.0,
                        y=0.0,
                        target_x=x,
                        target_y=y,
                        velocity_x=0.0,
                        velocity_y=0.0,
                        movement_speed=1.0,
                    )
                    session.add(position)
                else:
                    position.target_x = x
                    position.target_y = y
                    # Calculate velocity towards target
                    dx = x - position.x
                    dy = y - position.y
                    distance = (dx**2 + dy**2) ** 0.5
                    if distance > 0:
                        position.velocity_x = (dx / distance) * position.movement_speed
                        position.velocity_y = (dy / distance) * position.movement_speed

                session.commit()

                return {
                    "agent_id": agent_id,
                    "x": position.x,
                    "y": position.y,
                    "target_x": position.target_x,
                    "target_y": position.target_y,
                    "velocity_x": position.velocity_x,
                    "velocity_y": position.velocity_y,
                    "movement_speed": position.movement_speed,
                }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to move agent: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to move agent: {str(e)}"
            )

    async def move_agent_towards(
        self, agent_id: str, target_agent_id: str, distance: float = 50.0
    ) -> Dict[str, Any]:
        """
        Move an agent towards another agent.

        Args:
            agent_id: Agent to move
            target_agent_id: Target agent
            distance: Distance to maintain from target

        Returns:
            Updated position data
        """
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                agent = session.query(Agent).filter(Agent.agent_id == agent_id).first()
                target_agent = (
                    session.query(Agent)
                    .filter(Agent.agent_id == target_agent_id)
                    .first()
                )

                if not agent or not target_agent:
                    raise HTTPException(
                        status_code=404, detail="One or both agents not found"
                    )

                agent_position = agent.position
                target_position = target_agent.position

                if not agent_position or not target_position:
                    raise HTTPException(
                        status_code=400,
                        detail="One or both agents have no position data",
                    )

                # Calculate direction to target
                dx = target_position.x - agent_position.x
                dy = target_position.y - agent_position.y
                current_distance = (dx**2 + dy**2) ** 0.5

                if current_distance > distance:
                    # Move towards target but maintain distance
                    move_distance = current_distance - distance
                    move_x = (dx / current_distance) * move_distance
                    move_y = (dy / current_distance) * move_distance

                    target_x = agent_position.x + move_x
                    target_y = agent_position.y + move_y
                else:
                    # Already at desired distance
                    target_x = agent_position.x
                    target_y = agent_position.y

                # Update agent position
                agent_position.target_x = target_x
                agent_position.target_y = target_y

                # Calculate velocity
                dx = target_x - agent_position.x
                dy = target_y - agent_position.y
                move_distance = (dx**2 + dy**2) ** 0.5
                if move_distance > 0:
                    agent_position.velocity_x = (
                        dx / move_distance
                    ) * agent_position.movement_speed
                    agent_position.velocity_y = (
                        dy / move_distance
                    ) * agent_position.movement_speed

                session.commit()

                return {
                    "agent_id": agent_id,
                    "x": agent_position.x,
                    "y": agent_position.y,
                    "target_x": agent_position.target_x,
                    "target_y": agent_position.target_y,
                    "velocity_x": agent_position.velocity_x,
                    "velocity_y": agent_position.velocity_y,
                    "movement_speed": agent_position.movement_speed,
                    "target_agent_id": target_agent_id,
                    "distance_to_target": current_distance,
                }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to move agent towards target: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to move agent towards target: {str(e)}"
            )

    async def get_agent_distance(
        self, agent1_id: str, agent2_id: str
    ) -> Dict[str, Any]:
        """
        Get the distance between two agents.

        Args:
            agent1_id: First agent identifier
            agent2_id: Second agent identifier

        Returns:
            Distance information
        """
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                agent1 = (
                    session.query(Agent).filter(Agent.agent_id == agent1_id).first()
                )
                agent2 = (
                    session.query(Agent).filter(Agent.agent_id == agent2_id).first()
                )

                if not agent1 or not agent2:
                    raise HTTPException(
                        status_code=404, detail="One or both agents not found"
                    )

                pos1 = agent1.position
                pos2 = agent2.position

                if not pos1 or not pos2:
                    raise HTTPException(
                        status_code=400,
                        detail="One or both agents have no position data",
                    )

                dx = pos2.x - pos1.x
                dy = pos2.y - pos1.y
                distance = (dx**2 + dy**2) ** 0.5

                return {
                    "agent1_id": agent1_id,
                    "agent2_id": agent2_id,
                    "distance": distance,
                    "agent1_position": {"x": pos1.x, "y": pos1.y},
                    "agent2_position": {"x": pos2.x, "y": pos2.y},
                }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to get agent distance: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to get agent distance: {str(e)}"
            )

    async def get_nearby_agents(
        self, agent_id: str, radius: float = 100.0
    ) -> List[Dict[str, Any]]:
        """
        Get all agents within a certain radius of an agent.

        Args:
            agent_id: Agent identifier
            radius: Search radius

        Returns:
            List of nearby agents
        """
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                agent = session.query(Agent).filter(Agent.agent_id == agent_id).first()
                if not agent:
                    raise HTTPException(status_code=404, detail="Agent not found")

                agent_position = agent.position
                if not agent_position:
                    return []

                # Get all other agents with positions
                other_agents = (
                    session.query(Agent)
                    .filter(and_(Agent.agent_id != agent_id, Agent.active == True))
                    .all()
                )

                nearby_agents = []
                for other_agent in other_agents:
                    if other_agent.position:
                        dx = other_agent.position.x - agent_position.x
                        dy = other_agent.position.y - agent_position.y
                        distance = (dx**2 + dy**2) ** 0.5

                        if distance <= radius:
                            nearby_agents.append(
                                {
                                    "agent_id": other_agent.agent_id,
                                    "name": other_agent.name,
                                    "spirit": other_agent.spirit,
                                    "x": other_agent.position.x,
                                    "y": other_agent.position.y,
                                    "distance": distance,
                                }
                            )

                # Sort by distance
                nearby_agents.sort(key=lambda x: x["distance"])

                return nearby_agents

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to get nearby agents: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to get nearby agents: {str(e)}"
            )

    # Breeding Control Methods

    async def enable_breeding(self, enabled: bool = True) -> Dict[str, str]:
        """
        Enable or disable automatic breeding.

        Args:
            enabled: Whether to enable breeding

        Returns:
            Status message
        """
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                # Update or create breeding configuration
                config = (
                    session.query(WorldConfiguration)
                    .filter(WorldConfiguration.config_key == "breeding_enabled")
                    .first()
                )

                if config:
                    config.config_value = enabled
                else:
                    config = WorldConfiguration(
                        config_key="breeding_enabled",
                        config_value=enabled,
                        description="Enable or disable automatic breeding",
                    )
                    session.add(config)

                session.commit()

                status = "enabled" if enabled else "disabled"
                return {
                    "status": f"Breeding {status}",
                    "breeding_enabled": str(enabled),
                }

        except Exception as e:
            logger.error(f"❌ Failed to set breeding status: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to set breeding status: {str(e)}"
            )

    async def get_breeding_stats(self) -> Dict[str, Any]:
        """
        Get breeding statistics.

        Returns:
            Breeding statistics
        """
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                # Get breeding records
                breeding_records = session.query(BreedingRecord).all()

                total_breedings = len(breeding_records)
                successful_breedings = len(
                    [r for r in breeding_records if r.breeding_success]
                )
                failed_breedings = total_breedings - successful_breedings

                if total_breedings > 0:
                    success_rate = successful_breedings / total_breedings
                    avg_compatibility = (
                        sum(r.compatibility_score for r in breeding_records)
                        / total_breedings
                    )
                else:
                    success_rate = 0.0
                    avg_compatibility = 0.0

                # Get breeding configuration
                breeding_config = (
                    session.query(WorldConfiguration)
                    .filter(WorldConfiguration.config_key == "breeding_enabled")
                    .first()
                )
                breeding_enabled = (
                    breeding_config.config_value if breeding_config else False
                )

                return {
                    "breeding_enabled": breeding_enabled,
                    "total_breedings": total_breedings,
                    "successful_breedings": successful_breedings,
                    "failed_breedings": failed_breedings,
                    "success_rate": success_rate,
                    "average_compatibility": avg_compatibility,
                    "recent_breedings": [
                        {
                            "parent1_id": r.parent1.agent_id,
                            "parent2_id": r.parent2.agent_id,
                            "offspring_id": r.offspring.agent_id,
                            "compatibility_score": r.compatibility_score,
                            "success": r.breeding_success,
                            "created_at": r.created_at.isoformat(),
                        }
                        for r in breeding_records[-10:]  # Last 10 breedings
                    ],
                }

        except Exception as e:
            logger.error(f"❌ Failed to get breeding stats: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to get breeding stats: {str(e)}"
            )

    # Relationship Management Methods

    async def get_agent_relationships(self, agent_id: str) -> Dict[str, Any]:
        """
        Get all relationships for an agent.

        Args:
            agent_id: Agent identifier

        Returns:
            Relationship information
        """
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                agent = session.query(Agent).filter(Agent.agent_id == agent_id).first()
                if not agent:
                    raise HTTPException(status_code=404, detail="Agent not found")

                # Get relationships where agent is either agent1 or agent2
                relationships = (
                    session.query(AgentRelationship)
                    .filter(
                        or_(
                            AgentRelationship.agent1_id == agent.id,
                            AgentRelationship.agent2_id == agent.id,
                        )
                    )
                    .all()
                )

                relationship_data = []
                for rel in relationships:
                    # Get the other agent
                    other_agent_id = (
                        rel.agent2_id if rel.agent1_id == agent.id else rel.agent1_id
                    )
                    other_agent = (
                        session.query(Agent).filter(Agent.id == other_agent_id).first()
                    )

                    if other_agent:
                        relationship_data.append(
                            {
                                "relationship_id": str(rel.id),
                                "other_agent_id": other_agent.agent_id,
                                "other_agent_name": other_agent.name,
                                "relationship_type": rel.relationship_type,
                                "strength": rel.strength,
                                "trust_level": rel.trust_level,
                                "familiarity": rel.familiarity,
                                "interaction_count": rel.interaction_count,
                                "positive_interactions": rel.positive_interactions,
                                "negative_interactions": rel.negative_interactions,
                                "last_interaction": (
                                    rel.last_interaction.isoformat()
                                    if rel.last_interaction
                                    else None
                                ),
                            }
                        )

                return {
                    "agent_id": agent_id,
                    "total_relationships": len(relationship_data),
                    "relationships": relationship_data,
                }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to get agent relationships: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to get agent relationships: {str(e)}"
            )

    async def initiate_interaction(
        self, agent1_id: str, agent2_id: str, interaction_type: str = "communication"
    ) -> Dict[str, Any]:
        """
        Initiate an interaction between two agents.

        Args:
            agent1_id: First agent identifier
            agent2_id: Second agent identifier
            interaction_type: Type of interaction

        Returns:
            Interaction data
        """
        self._ensure_initialized()
        try:
            with self.get_session() as session:
                agent1 = (
                    session.query(Agent).filter(Agent.agent_id == agent1_id).first()
                )
                agent2 = (
                    session.query(Agent).filter(Agent.agent_id == agent2_id).first()
                )

                if not agent1 or not agent2:
                    raise HTTPException(
                        status_code=404, detail="One or both agents not found"
                    )

                # Create interaction
                interaction = AgentInteraction(
                    sender_id=agent1.id,
                    receiver_id=agent2.id,
                    interaction_type=interaction_type,
                    message=f"Interaction of type: {interaction_type}",
                    energy_level=1.0,
                )
                session.add(interaction)

                # Update or create relationship
                relationship = (
                    session.query(AgentRelationship)
                    .filter(
                        or_(
                            and_(
                                AgentRelationship.agent1_id == agent1.id,
                                AgentRelationship.agent2_id == agent2.id,
                            ),
                            and_(
                                AgentRelationship.agent1_id == agent2.id,
                                AgentRelationship.agent2_id == agent1.id,
                            ),
                        )
                    )
                    .first()
                )

                if not relationship:
                    relationship = AgentRelationship(
                        agent1_id=agent1.id,
                        agent2_id=agent2.id,
                        relationship_type="acquaintance",
                        strength=0.1,
                        trust_level=0.1,
                        familiarity=0.1,
                        interaction_count=1,
                        positive_interactions=1,
                        negative_interactions=0,
                        last_interaction=datetime.now(timezone.utc),
                    )
                    session.add(relationship)
                else:
                    relationship.interaction_count += 1
                    relationship.positive_interactions += 1
                    relationship.strength = min(1.0, relationship.strength + 0.05)
                    relationship.trust_level = min(1.0, relationship.trust_level + 0.03)
                    relationship.familiarity = min(1.0, relationship.familiarity + 0.02)
                    relationship.last_interaction = datetime.now(timezone.utc)

                # Update last activity for both agents
                agent1.last_activity = datetime.now(timezone.utc)
                agent2.last_activity = datetime.now(timezone.utc)

                session.commit()

                return {
                    "interaction_id": str(interaction.id),
                    "participants": [agent1_id, agent2_id],
                    "interaction_type": interaction_type,
                    "content": interaction.message,
                    "outcome": "successful",
                    "relationship_impact": 0.05,
                    "timestamp": interaction.created_at.isoformat(),
                    "duration": 0.0,
                    "energy_cost": 0.1,
                }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to initiate interaction: {e}")
            raise HTTPException(
                status_code=500, detail=f"Failed to initiate interaction: {str(e)}"
            )


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
