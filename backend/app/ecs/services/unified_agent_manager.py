"""
Unified Agent State Manager

Single source of truth for all agent state operations, integrating with
the existing FastAPI ECS backend for comprehensive agent management.
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.ecs.database import (
    AbilityTrait,
    Agent,
    AgentInteraction,
    PersonalityTrait,
    PhysicalTrait,
)
from app.ecs.legacy_tracking import (
    SuccessAdvisor8Activity,
    SuccessAdvisor8LegacyTracker,
)
from app.ecs.postgres_service import PostgresECSWorldService

logger = logging.getLogger(__name__)


class AgentState:
    """Unified agent state model."""

    def __init__(
        self,
        agent_id: str,
        name: str,
        spirit: str,
        style: str,
        generation: int,
        traits: Dict[str, float],
        memories: List[Dict],
        relationships: Dict[str, Dict],
        last_activity: datetime,
        ecs_entity_id: Optional[str] = None,
        specializations: Optional[List[str]] = None,
        achievements: Optional[List[Dict]] = None,
    ):
        self.agent_id = agent_id
        self.name = name
        self.spirit = spirit
        self.style = style
        self.generation = generation
        self.traits = traits
        self.memories = memories
        self.relationships = relationships
        self.last_activity = last_activity
        self.ecs_entity_id = ecs_entity_id
        self.specializations = specializations or []
        self.achievements = achievements or []

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "spirit": self.spirit,
            "style": self.style,
            "generation": self.generation,
            "traits": self.traits,
            "memories": self.memories,
            "relationships": self.relationships,
            "last_activity": self.last_activity.isoformat(),
            "ecs_entity_id": self.ecs_entity_id,
            "specializations": self.specializations,
            "achievements": self.achievements,
        }


class UnifiedAgentStateManager:
    """
    Single source of truth for all agent state operations.

    Integrates with the existing FastAPI ECS backend to provide
    comprehensive agent state management and Success-Advisor-8
    legacy tracking capabilities.
    """

    def __init__(self, ecs_service: PostgresECSWorldService, codebase_path: str = "."):
        """
        Initialize the unified agent state manager.

        Args:
            ecs_service: Existing PostgreSQL ECS world service
            codebase_path: Path to the codebase for legacy tracking
        """
        self.ecs_service = ecs_service
        self.legacy_tracker = SuccessAdvisor8LegacyTracker(
            codebase_path, "CHANGELOG.md"
        )
        logger.info("UnifiedAgentStateManager initialized with ECS integration")

    async def get_agent_state(self, agent_id: str) -> Optional[AgentState]:
        """
        Get complete agent state from ECS world.

        Args:
            agent_id: Unique identifier for the agent

        Returns:
            Complete agent state or None if not found
        """
        try:
            # Get agent from ECS database
            agent = await self.ecs_service.get_agent(agent_id)
            if not agent:
                logger.warning(f"Agent {agent_id} not found in ECS database")
                return None

            # Get traits
            traits = await self._get_agent_traits(agent_id)

            # Get memories (from interactions)
            memories = await self._get_agent_memories(agent_id)

            # Get relationships
            relationships = await self._get_agent_relationships(agent_id)

            # Get specializations
            specializations = await self._get_agent_specializations(agent_id)

            # Get achievements
            achievements = await self._get_agent_achievements(agent_id)

            return AgentState(
                agent_id=agent.agent_id,
                name=agent.name,
                spirit=agent.spirit,
                style=agent.style,
                generation=agent.generation,
                traits=traits,
                memories=memories,
                relationships=relationships,
                last_activity=agent.last_activity or datetime.now(),
                ecs_entity_id=str(agent.id),
                specializations=specializations,
                achievements=achievements,
            )

        except Exception as e:
            logger.error(f"Error getting agent state for {agent_id}: {e}")
            return None

    async def update_agent_state(self, agent_id: str, state: AgentState) -> bool:
        """
        Update agent state in ECS world.

        Args:
            agent_id: Unique identifier for the agent
            state: New agent state

        Returns:
            True if update successful, False otherwise
        """
        try:
            # Update agent basic info
            await self.ecs_service.update_agent(
                agent_id=agent_id,
                name=state.name,
                spirit=state.spirit,
                style=state.style,
                generation=state.generation,
            )

            # Update traits
            await self._update_agent_traits(agent_id, state.traits)

            # Update specializations
            await self._update_agent_specializations(agent_id, state.specializations)

            # Update achievements
            await self._update_agent_achievements(agent_id, state.achievements)

            logger.info(f"Successfully updated agent state for {agent_id}")
            return True

        except Exception as e:
            logger.error(f"Error updating agent state for {agent_id}: {e}")
            return False

    async def track_agent_activity(
        self, agent_id: str, activity: str, context: Dict[str, Any]
    ) -> None:
        """
        Track agent activity for legacy analysis.

        Args:
            agent_id: Unique identifier for the agent
            activity: Description of the activity
            context: Additional context about the activity
        """
        try:
            # Record interaction in ECS database
            await self.ecs_service.record_interaction(
                agent_id=agent_id,
                interaction_type="activity",
                description=activity,
                metadata=context,
            )

            # If this is Success-Advisor-8, track in legacy system
            if agent_id == "success-advisor-8" or "Success-Advisor-8" in activity:
                # Success-Advisor-8 activities are tracked through the ECS service
                # The legacy tracker will pick them up from the database
                pass

            logger.debug(f"Tracked activity for agent {agent_id}: {activity}")

        except Exception as e:
            logger.error(f"Error tracking activity for agent {agent_id}: {e}")

    async def get_success_advisor_8_legacy_report(self) -> Dict[str, Any]:
        """
        Get comprehensive Success-Advisor-8 legacy report.

        Returns:
            Complete legacy tracking report
        """
        try:
            report = await self.legacy_tracker.generate_legacy_report()
            return report.to_dict() if hasattr(report, "to_dict") else report

        except Exception as e:
            logger.error(f"Error generating Success-Advisor-8 legacy report: {e}")
            return {"error": str(e)}

    async def _get_agent_traits(self, agent_id: str) -> Dict[str, float]:
        """Get agent traits from ECS database."""
        try:
            traits = {}

            # Get personality traits
            personality_traits = await self.ecs_service.get_personality_traits(agent_id)
            for trait in personality_traits:
                traits[f"personality_{trait.trait_name}"] = trait.value

            # Get physical traits
            physical_traits = await self.ecs_service.get_physical_traits(agent_id)
            for trait in physical_traits:
                traits[f"physical_{trait.trait_name}"] = trait.value

            # Get ability traits
            ability_traits = await self.ecs_service.get_ability_traits(agent_id)
            for trait in ability_traits:
                traits[f"ability_{trait.trait_name}"] = trait.value

            return traits

        except Exception as e:
            logger.error(f"Error getting traits for agent {agent_id}: {e}")
            return {}

    async def _get_agent_memories(self, agent_id: str) -> List[Dict]:
        """Get agent memories from interactions."""
        try:
            interactions = await self.ecs_service.get_agent_interactions(agent_id)
            memories = []

            for interaction in interactions:
                memories.append(
                    {
                        "id": str(interaction.id),
                        "type": interaction.interaction_type,
                        "description": interaction.description,
                        "timestamp": interaction.timestamp.isoformat(),
                        "metadata": interaction.metadata or {},
                    }
                )

            return memories

        except Exception as e:
            logger.error(f"Error getting memories for agent {agent_id}: {e}")
            return []

    async def _get_agent_relationships(self, agent_id: str) -> Dict[str, Dict]:
        """Get agent relationships."""
        try:
            relationships = await self.ecs_service.get_agent_relationships(agent_id)
            relationship_dict = {}

            for rel in relationships:
                relationship_dict[rel.related_agent_id] = {
                    "type": rel.relationship_type,
                    "strength": rel.strength,
                    "created_at": rel.created_at.isoformat(),
                    "last_interaction": (
                        rel.last_interaction.isoformat()
                        if rel.last_interaction
                        else None
                    ),
                }

            return relationship_dict

        except Exception as e:
            logger.error(f"Error getting relationships for agent {agent_id}: {e}")
            return {}

    async def _get_agent_specializations(self, agent_id: str) -> List[str]:
        """Get agent specializations."""
        try:
            specializations = await self.ecs_service.get_agent_specializations(agent_id)
            return [spec.specialization_name for spec in specializations]

        except Exception as e:
            logger.error(f"Error getting specializations for agent {agent_id}: {e}")
            return []

    async def _get_agent_achievements(self, agent_id: str) -> List[Dict]:
        """Get agent achievements."""
        try:
            achievements = await self.ecs_service.get_agent_achievements(agent_id)
            achievement_list = []

            for achievement in achievements:
                achievement_list.append(
                    {
                        "id": str(achievement.id),
                        "name": achievement.achievement_name,
                        "description": achievement.description,
                        "earned_at": achievement.earned_at.isoformat(),
                        "metadata": achievement.metadata or {},
                    }
                )

            return achievement_list

        except Exception as e:
            logger.error(f"Error getting achievements for agent {agent_id}: {e}")
            return []

    async def _update_agent_traits(
        self, agent_id: str, traits: Dict[str, float]
    ) -> None:
        """Update agent traits in ECS database."""
        try:
            # Update personality traits
            personality_traits = {
                k: v for k, v in traits.items() if k.startswith("personality_")
            }
            for trait_name, value in personality_traits.items():
                await self.ecs_service.update_personality_trait(
                    agent_id, trait_name.replace("personality_", ""), value
                )

            # Update physical traits
            physical_traits = {
                k: v for k, v in traits.items() if k.startswith("physical_")
            }
            for trait_name, value in physical_traits.items():
                await self.ecs_service.update_physical_trait(
                    agent_id, trait_name.replace("physical_", ""), value
                )

            # Update ability traits
            ability_traits = {
                k: v for k, v in traits.items() if k.startswith("ability_")
            }
            for trait_name, value in ability_traits.items():
                await self.ecs_service.update_ability_trait(
                    agent_id, trait_name.replace("ability_", ""), value
                )

        except Exception as e:
            logger.error(f"Error updating traits for agent {agent_id}: {e}")

    async def _update_agent_specializations(
        self, agent_id: str, specializations: List[str]
    ) -> None:
        """Update agent specializations in ECS database."""
        try:
            await self.ecs_service.update_agent_specializations(
                agent_id, specializations
            )
        except Exception as e:
            logger.error(f"Error updating specializations for agent {agent_id}: {e}")

    async def _update_agent_achievements(
        self, agent_id: str, achievements: List[Dict]
    ) -> None:
        """Update agent achievements in ECS database."""
        try:
            for achievement in achievements:
                await self.ecs_service.add_agent_achievement(
                    agent_id=agent_id,
                    achievement_name=achievement["name"],
                    description=achievement["description"],
                    metadata=achievement.get("metadata", {}),
                )
        except Exception as e:
            logger.error(f"Error updating achievements for agent {agent_id}: {e}")

    async def close(self) -> None:
        """Close the unified agent state manager."""
        try:
            await self.ecs_service.shutdown()
            logger.info("UnifiedAgentStateManager closed successfully")
        except Exception as e:
            logger.error(f"Error closing UnifiedAgentStateManager: {e}")
