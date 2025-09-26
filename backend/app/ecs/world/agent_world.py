"""Agent World

Specialized ECS world for agent management with breeding and trait inheritance.
Now fully integrated with RBAC system for comprehensive access control.
"""

import logging
import os
import random
from pathlib import Path
from typing import Optional

from ..components import (
    AgentComponent,
    GenderComponent,
    GenderExpression,
    GenderIdentity,
    GenderProfile,
    InteractionComponent,
    KnowledgeComponent,
    LifecycleComponent,
    LineageComponent,
    MemoryComponent,
    PositionComponent,
    ReproductionComponent,
    SocialComponent,
    TraitComponent,
)
from ..core.entity import Entity
from ..core.world import ECSWorld
from ..systems import (
    GenderSystem,
    InteractionSystem,
    LearningSystem,
    MemorySystem,
    SocialSystem,
)

logger = logging.getLogger(__name__)


class AgentWorld(ECSWorld):
    """ECS world specialized for agent management.

    Provides high-level interface for agent creation, breeding,
    trait inheritance, and world simulation.
    """

    def __init__(self, data_dir: Path | None = None, world_id: str = "default_world"):
        """Initialize the agent world.

        Args:
            data_dir: Directory for persistent data storage
            world_id: Unique identifier for this world

        """
        super().__init__()
        if data_dir is None:
            # Use absolute path from current working directory
            self.data_dir = Path(os.getcwd()) / "data" / "ecs"
        else:
            # Ensure data_dir is a Path object
            self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # World metadata
        self.world_id = world_id
        self.owner_id: Optional[str] = None
        self.collaborators: list[str] = []
        self.created_at = None
        self.last_accessed = None

        # Add systems
        self.add_system(MemorySystem(self))
        self.add_system(InteractionSystem(self))
        self.add_system(SocialSystem(self))
        self.add_system(LearningSystem(self))
        self.add_system(GenderSystem(self))

        # Initialize time tracking
        self.current_time = 0.0

        # Load existing agents
        self._load_existing_agents()

    def create_agent(
        self,
        agent_id: str,
        spirit: str | None = None,
        style: str | None = None,
        name: str | None = None,
        user_id: str = "system",
    ) -> Entity:
        """Create a new agent entity with comprehensive traits.

        Args:
            agent_id: Unique identifier for the agent
            spirit: Animal spirit (fox, wolf, otter, etc.)
            style: Naming style (foundation, exo, hybrid, etc.)
            name: Optional custom name
            user_id: ID of the user creating the agent

        Returns:
            The created agent entity

        """
        entity = self.create_entity(agent_id)

        # Set defaults and convert enums to strings
        if spirit:
            spirit = spirit.value if hasattr(spirit, "value") else str(spirit)
        else:
            spirit = "fox"

        if style:
            style = style.value if hasattr(style, "value") else str(style)
        else:
            style = "foundation"

        if name is None:
            name = f"{spirit.capitalize()}-{random.randint(1, 999)}"

        # Add core components
        entity.add_component(AgentComponent(name=name, spirit=spirit, style=style))

        # Add lifecycle component
        entity.add_component(LifecycleComponent())

        # Add position component
        entity.add_component(
            PositionComponent(x=random.uniform(-100, 100), y=random.uniform(-100, 100)),
        )

        # Add trait component with generated traits
        entity.add_component(TraitComponent())

        # Add lineage component
        entity.add_component(LineageComponent())

        # Add reproduction component
        repro_component = ReproductionComponent()
        repro_component.can_reproduce = True  # Enable reproduction
        entity.add_component(repro_component)

        # Add social component
        entity.add_component(SocialComponent())

        # Add interaction component
        entity.add_component(InteractionComponent())

        # Add memory component
        entity.add_component(MemoryComponent())

        # Add knowledge component
        entity.add_component(KnowledgeComponent())

        # Add gender component
        from ..components.gender import GenderExpression, GenderIdentity, GenderProfile

        gender_profile = GenderProfile(
            primary_identity=GenderIdentity.NON_BINARY,
            expression_style=GenderExpression.NEUTRAL,
        )
        entity.add_component(GenderComponent(gender_profile))

        # Store agent metadata for RBAC
        entity.metadata = {
            "created_by": user_id,
            "created_at": self.current_time,
            "world_id": self.world_id,
        }

        logger.info(
            f"Created agent {agent_id} with spirit {spirit} and style {style} for user {user_id}"
        )
        return entity

    def create_offspring(
        self,
        parent1_id: str,
        parent2_id: str,
        offspring_id: str | None = None,
    ) -> Entity | None:
        """Create offspring from two parent agents.

        Args:
            parent1_id: ID of first parent
            parent2_id: ID of second parent
            offspring_id: Optional custom ID for offspring

        Returns:
            The created offspring entity or None if creation failed

        """
        parent1 = self.get_entity(parent1_id)
        parent2 = self.get_entity(parent2_id)

        if not parent1 or not parent2:
            logger.error(f"Parent agents not found: {parent1_id}, {parent2_id}")
            return None

        # Check if parents can reproduce
        repro1 = parent1.get_component(ReproductionComponent)
        repro2 = parent2.get_component(ReproductionComponent)

        if not repro1 or not repro2:
            logger.error("Parent agents missing reproduction components")
            return None

        if not repro1.can_reproduce or not repro2.can_reproduce:
            logger.error("Parent agents cannot reproduce")
            return None

        # Generate offspring ID
        if offspring_id is None:
            offspring_id = (
                f"offspring_{parent1_id}_{parent2_id}_{random.randint(1000, 9999)}"
            )

        # Create offspring entity
        offspring = self.create_entity(offspring_id)

        # Get parent components
        agent1 = parent1.get_component(AgentComponent)
        agent2 = parent2.get_component(AgentComponent)
        traits1 = parent1.get_component(TraitComponent)
        traits2 = parent2.get_component(TraitComponent)
        lineage1 = parent1.get_component(LineageComponent)
        lineage2 = parent2.get_component(LineageComponent)

        # Create offspring agent component
        offspring_agent = AgentComponent(
            name=f"Offspring-{random.randint(1, 999)}",
            spirit=random.choice([agent1.spirit, agent2.spirit]),
            style=random.choice([agent1.style, agent2.style]),
        )
        offspring.add_component(offspring_agent)

        # Create offspring lifecycle component
        offspring.add_component(LifecycleComponent())

        # Create offspring position component (near parents)
        pos1 = parent1.get_component(PositionComponent)
        pos2 = parent2.get_component(PositionComponent)
        if pos1 and pos2:
            offspring.add_component(
                PositionComponent(
                    x=(pos1.x + pos2.x) / 2 + random.uniform(-10, 10),
                    y=(pos1.y + pos2.y) / 2 + random.uniform(-10, 10),
                ),
            )
        else:
            offspring.add_component(PositionComponent())

        # Create offspring trait component with inheritance
        if traits1 and traits2:
            offspring_traits = self._inherit_traits(traits1, traits2)
            offspring.add_component(offspring_traits)
        else:
            offspring.add_component(TraitComponent())

        # Create offspring lineage component
        offspring_lineage = LineageComponent()
        offspring_lineage.parents = [parent1_id, parent2_id]
        offspring_lineage.generation = offspring_agent.generation
        offspring.add_component(offspring_lineage)

        # Update parent lineages
        if lineage1:
            lineage1.children.append(offspring_id)
        if lineage2:
            lineage2.children.append(offspring_id)

        # Create offspring reproduction component
        offspring.add_component(ReproductionComponent())

        # Create offspring social component
        offspring.add_component(SocialComponent())

        # Create offspring interaction component
        offspring.add_component(InteractionComponent())

        # Create offspring memory component
        offspring.add_component(MemoryComponent())

        # Create offspring knowledge component
        offspring.add_component(KnowledgeComponent())

        # Create offspring gender component
        # Create gender profile for offspring
        offspring_gender_profile = GenderProfile(
            primary_identity=GenderIdentity.NON_BINARY,
            expression_style=GenderExpression.ANDROGYNOUS,
        )
        offspring.add_component(GenderComponent(offspring_gender_profile))

        # Update parent reproduction cooldowns
        repro1.last_mating = self.current_time
        repro2.last_mating = self.current_time
        repro1.offspring_count += 1
        repro2.offspring_count += 1

        logger.info(
            f"Created offspring {offspring_id} from parents {parent1_id} and {parent2_id}",
        )
        return offspring

    def _inherit_traits(
        self,
        traits1: TraitComponent,
        traits2: TraitComponent,
    ) -> TraitComponent:
        """Create offspring traits by inheriting from parents."""
        offspring_traits = TraitComponent()

        # Inherit personality traits
        for trait_name in offspring_traits.personality:
            parent1_value = traits1.personality.get(trait_name, 0.5)
            parent2_value = traits2.personality.get(trait_name, 0.5)

            # Average with some mutation
            base_value = (parent1_value + parent2_value) / 2
            mutation = random.uniform(-0.1, 0.1)
            final_value = max(0.0, min(1.0, base_value + mutation))

            offspring_traits.personality[trait_name] = final_value

        # Inherit physical traits
        for trait_name in offspring_traits.physical:
            parent1_value = traits1.physical.get(trait_name, 0.5)
            parent2_value = traits2.physical.get(trait_name, 0.5)

            # Average with some mutation
            base_value = (parent1_value + parent2_value) / 2
            mutation = random.uniform(-0.1, 0.1)
            final_value = max(0.0, min(1.0, base_value + mutation))

            offspring_traits.physical[trait_name] = final_value

        # Inherit ability traits
        for trait_name in offspring_traits.abilities:
            parent1_value = traits1.abilities.get(trait_name, 0.5)
            parent2_value = traits2.abilities.get(trait_name, 0.5)

            # Average with some mutation
            base_value = (parent1_value + parent2_value) / 2
            mutation = random.uniform(-0.1, 0.1)
            final_value = max(0.0, min(1.0, base_value + mutation))

            offspring_traits.abilities[trait_name] = final_value

        return offspring_traits

    def find_compatible_mates(self, agent_id: str, max_results: int = 10) -> list[dict]:
        """Find compatible mates for an agent.

        Args:
            agent_id: ID of the agent to find mates for
            max_results: Maximum number of results to return

        Returns:
            List of compatible mate information

        """
        agent = self.get_entity(agent_id)
        if not agent:
            return []

        agent_traits = agent.get_component(TraitComponent)
        agent_repro = agent.get_component(ReproductionComponent)
        agent_lifecycle = agent.get_component(LifecycleComponent)

        if not agent_traits or not agent_repro or not agent_lifecycle:
            return []

        # Check if agent can reproduce
        if not agent_repro.can_reproduce or not agent_lifecycle.is_mature():
            return []

        compatible_mates = []

        # Find all other agents
        for entity in self.entities.values():
            if entity.id == agent_id:
                continue

            other_traits = entity.get_component(TraitComponent)
            other_repro = entity.get_component(ReproductionComponent)
            other_lifecycle = entity.get_component(LifecycleComponent)

            if not other_traits or not other_repro or not other_lifecycle:
                continue

            # Check if other agent can reproduce
            if not other_repro.can_reproduce or not other_lifecycle.is_mature():
                continue

            # Calculate compatibility
            compatibility = agent_traits.calculate_compatibility(other_traits)

            if compatibility > 0.4:  # Minimum compatibility threshold
                compatible_mates.append(
                    {
                        "agent_id": entity.id,
                        "compatibility": compatibility,
                        "name": (
                            entity.get_component(AgentComponent).name
                            if entity.get_component(AgentComponent)
                            else "Unknown"
                        ),
                    },
                )

        # Sort by compatibility and return top results
        compatible_mates.sort(
            key=lambda x: (
                float(x["compatibility"])
                if isinstance(x["compatibility"], (int, float))
                else 0.0
            ),
            reverse=True,
        )
        return compatible_mates[:max_results]

    def analyze_genetic_compatibility(self, agent1_id: str, agent2_id: str) -> dict:
        """Analyze genetic compatibility between two agents.

        Args:
            agent1_id: ID of first agent
            agent2_id: ID of second agent

        Returns:
            Compatibility analysis dictionary

        """
        agent1 = self.get_entity(agent1_id)
        agent2 = self.get_entity(agent2_id)

        if not agent1 or not agent2:
            return {"error": "One or both agents not found"}

        traits1 = agent1.get_component(TraitComponent)
        traits2 = agent2.get_component(TraitComponent)

        if not traits1 or not traits2:
            return {"error": "One or both agents missing trait components"}

        compatibility = traits1.calculate_compatibility(traits2)

        # Analyze trait similarities
        personality_similarity = self._calculate_trait_similarity(
            traits1.personality,
            traits2.personality,
        )
        physical_similarity = self._calculate_trait_similarity(
            traits1.physical,
            traits2.physical,
        )
        ability_similarity = self._calculate_trait_similarity(
            traits1.abilities,
            traits2.abilities,
        )

        return {
            "agent1_id": agent1_id,
            "agent2_id": agent2_id,
            "overall_compatibility": compatibility,
            "personality_similarity": personality_similarity,
            "physical_similarity": physical_similarity,
            "ability_similarity": ability_similarity,
            "recommendation": (
                "Recommended"
                if compatibility > 0.6
                else "Not recommended" if compatibility < 0.4 else "Neutral"
            ),
        }

    def _calculate_trait_similarity(self, traits1: dict, traits2: dict) -> float:
        """Calculate similarity between two trait sets."""
        total_diff = 0.0
        trait_count = 0

        for trait_name in dir(traits1):
            if not trait_name.startswith("_"):
                trait1_value = getattr(traits1, trait_name)
                trait2_value = getattr(traits2, trait_name)

                if isinstance(trait1_value, (int, float)):
                    total_diff += abs(trait1_value - trait2_value)
                    trait_count += 1

        if trait_count == 0:
            return 0.0

        average_diff = total_diff / trait_count
        return 1.0 - average_diff  # Convert difference to similarity

    def get_agent_lineage(self, agent_id: str) -> dict:
        """Get lineage information for an agent.

        Args:
            agent_id: ID of the agent

        Returns:
            Lineage information dictionary

        """
        agent = self.get_entity(agent_id)
        if not agent:
            return {"error": "Agent not found"}

        lineage = agent.get_component(LineageComponent)
        if not lineage:
            return {"error": "Agent missing lineage component"}

        # Get ancestor information
        ancestors = []
        for ancestor_id in lineage.ancestors:
            ancestor = self.get_entity(ancestor_id)
            if ancestor:
                ancestor_agent = ancestor.get_component(AgentComponent)
                ancestors.append(
                    {
                        "id": ancestor_id,
                        "name": ancestor_agent.name if ancestor_agent else "Unknown",
                        "generation": (
                            ancestor.get_component(LineageComponent).generation
                            if ancestor.get_component(LineageComponent)
                            else 0
                        ),
                    },
                )

        # Get descendant information
        descendants = []
        for descendant_id in lineage.descendants:
            descendant = self.get_entity(descendant_id)
            if descendant:
                descendant_agent = descendant.get_component(AgentComponent)
                descendants.append(
                    {
                        "id": descendant_id,
                        "name": (
                            descendant_agent.name if descendant_agent else "Unknown"
                        ),
                        "generation": (
                            descendant.get_component(LineageComponent).generation
                            if descendant.get_component(LineageComponent)
                            else 0
                        ),
                    },
                )

        return {
            "agent_id": agent_id,
            "generation": lineage.generation,
            "parents": lineage.parents,
            "children": lineage.children,
            "ancestors": ancestors,
            "descendants": descendants,
            "family_size": len(ancestors) + len(descendants) + 1,
        }

    def _load_existing_agents(self) -> None:
        """Load existing agents from persistent storage."""
        # This would typically load from a database or file
        # For now, we'll just log that we're loading
        logger.info("Loading existing agents from persistent storage")

    def save_agents(self) -> None:
        """Save all agents to persistent storage."""
        # This would typically save to a database or file
        # For now, we'll just log that we're saving
        logger.info("Saving all agents to persistent storage")

    def get_agent_entities(self) -> list[Entity]:
        """Get all entities that have AgentComponent.

        Returns:
            List of entities that are agents

        """
        return self.get_entities_with_components(AgentComponent)

    def get_world_stats(self) -> dict:
        """Get comprehensive world statistics."""
        total_agents = len(self.entities)

        # Count agents by generation
        generation_counts: dict[int, int] = {}
        for entity in self.entities.values():
            lineage = entity.get_component(LineageComponent)
            if lineage:
                gen = lineage.generation
                generation_counts[gen] = generation_counts.get(gen, 0) + 1

        # Count agents by spirit
        spirit_counts: dict[str, int] = {}
        for entity in self.entities.values():
            agent = entity.get_component(AgentComponent)
            if agent:
                spirit = agent.spirit
                spirit_counts[spirit] = spirit_counts.get(spirit, 0) + 1

        return {
            "total_agents": total_agents,
            "generation_distribution": generation_counts,
            "spirit_distribution": spirit_counts,
            "systems_active": len(self.systems),
            "current_time": self.current_time,
            "world_id": self.world_id,
            "owner_id": self.owner_id,
            "collaborators": self.collaborators,
        }

    def set_owner(self, user_id: str) -> None:
        """Set the owner of this world."""
        self.owner_id = user_id
        if user_id not in self.collaborators:
            self.collaborators.append(user_id)

    def add_collaborator(self, user_id: str) -> None:
        """Add a collaborator to this world."""
        if user_id not in self.collaborators:
            self.collaborators.append(user_id)

    def remove_collaborator(self, user_id: str) -> None:
        """Remove a collaborator from this world."""
        if user_id in self.collaborators and user_id != self.owner_id:
            self.collaborators.remove(user_id)

    def has_access(self, user_id: str) -> bool:
        """Check if a user has access to this world."""
        return user_id == self.owner_id or user_id in self.collaborators

    def can_manage(self, user_id: str) -> bool:
        """Check if a user can manage this world."""
        return user_id == self.owner_id

    def can_create_agents(self, user_id: str) -> bool:
        """Check if a user can create agents in this world."""
        return self.has_access(user_id)

    def can_control_simulation(self, user_id: str) -> bool:
        """Check if a user can control simulation in this world."""
        return self.can_manage(user_id)

    def get_agent_creator(self, agent_id: str) -> Optional[str]:
        """Get the user who created a specific agent."""
        entity = self.get_entity(agent_id)
        if entity and hasattr(entity, 'metadata') and entity.metadata:
            return entity.metadata.get("created_by")
        return None
