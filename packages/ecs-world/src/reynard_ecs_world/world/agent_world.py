"""
Agent World

Specialized ECS world for agent management with breeding and trait inheritance.
"""

import logging
import random
from pathlib import Path
from typing import Any

from ..components import (
    AgentComponent,
    LifecycleComponent,
    LineageComponent,
    PositionComponent,
    ReproductionComponent,
    SocialComponent,
    TraitComponent,
)
from ..core.entity import Entity
from ..core.world import ECSWorld

logger = logging.getLogger(__name__)


class AgentWorld(ECSWorld):
    """
    ECS world specialized for agent management.

    Provides high-level interface for agent creation, breeding,
    trait inheritance, and world simulation.
    """

    def __init__(self, data_dir: Path | None = None):
        """
        Initialize the agent world.

        Args:
            data_dir: Directory for persistent data storage
        """
        super().__init__()
        if data_dir is None:
            # Use absolute path from current working directory
            import os

            self.data_dir = Path(os.getcwd()) / "data" / "ecs"
        else:
            # Ensure data_dir is a Path object
            self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Load existing agents
        self._load_existing_agents()

    def create_agent(
        self,
        agent_id: str,
        spirit: str | None = None,
        style: str | None = None,
        name: str | None = None,
    ) -> Entity:
        """
        Create a new agent entity with comprehensive traits.

        Args:
            agent_id: Unique identifier for the agent
            spirit: Animal spirit (fox, wolf, otter, etc.)
            style: Naming style (foundation, exo, hybrid, etc.)
            name: Optional custom name

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

        name = name or self._generate_agent_name(spirit, style)

        # Create comprehensive traits
        traits_data = {
            "spirit": spirit,
            "style": style,
            "unique_id": agent_id,
        }

        # Add components
        entity.add_component(AgentComponent(name, spirit, style))
        entity.add_component(TraitComponent(traits_data))
        entity.add_component(LineageComponent())
        entity.add_component(LifecycleComponent())
        entity.add_component(ReproductionComponent())
        entity.add_component(SocialComponent())

        # Add position with random starting location
        start_x = random.uniform(100, 800)
        start_y = random.uniform(100, 600)
        entity.add_component(PositionComponent(start_x, start_y))

        logger.info(f"Created agent {agent_id} with name {name}")
        return entity

    def create_offspring(
        self, parent1_id: str, parent2_id: str, offspring_id: str
    ) -> Entity:
        """
        Create offspring from two parent agents.

        Args:
            parent1_id: ID of first parent
            parent2_id: ID of second parent
            offspring_id: ID for the offspring

        Returns:
            The created offspring entity
        """
        parent1 = self.get_entity(parent1_id)
        parent2 = self.get_entity(parent2_id)

        if not parent1 or not parent2:
            raise ValueError("Parent agents not found")

        # Create offspring entity
        offspring = self.create_entity(offspring_id)

        # Get parent components
        agent1 = parent1.get_component(AgentComponent)
        agent2 = parent2.get_component(AgentComponent)
        traits1 = parent1.get_component(TraitComponent)
        traits2 = parent2.get_component(TraitComponent)

        if not agent1 or not agent2 or not traits1 or not traits2:
            raise ValueError("Parent components not found")

        # Inherit traits from parents
        offspring_traits = self._inherit_traits(traits1, traits2)
        offspring_traits["spirit"] = agent1.spirit  # Inherit spirit from first parent
        offspring_traits["style"] = agent1.style  # Inherit style from first parent
        offspring_traits["unique_id"] = offspring_id

        # Generate offspring name
        offspring_name = self._generate_agent_name(agent1.spirit, agent1.style)

        # Add components
        offspring.add_component(
            AgentComponent(offspring_name, agent1.spirit, agent1.style)
        )
        offspring.add_component(TraitComponent(offspring_traits))
        offspring.add_component(LineageComponent([parent1_id, parent2_id]))
        offspring.add_component(LifecycleComponent())
        offspring.add_component(ReproductionComponent())

        # Add position with random starting location
        start_x = random.uniform(100, 800)
        start_y = random.uniform(100, 600)
        offspring.add_component(PositionComponent(start_x, start_y))

        # Update parent lineage
        self._update_parent_lineage(parent1, offspring_id)
        self._update_parent_lineage(parent2, offspring_id)

        logger.info(
            f"Created offspring {offspring_id} from parents {parent1_id} and {parent2_id}"
        )
        return offspring

    def get_agent_entities(self) -> list[Entity]:
        """
        Get all agent entities.

        Returns:
            List of entities with AgentComponent
        """
        return self.get_entities_with_components(AgentComponent)

    def get_mature_agents(self) -> list[Entity]:
        """
        Get agents that can reproduce.

        Returns:
            List of mature agent entities
        """
        entities = self.get_entities_with_components(
            AgentComponent, LifecycleComponent, ReproductionComponent
        )
        mature_agents = []
        for entity in entities:
            lifecycle = entity.get_component(LifecycleComponent)
            if lifecycle and lifecycle.is_mature():
                mature_agents.append(entity)
        return mature_agents

    def find_compatible_mates(self, agent_id: str, max_results: int = 5) -> list[str]:
        """
        Find compatible mates for an agent.

        Args:
            agent_id: ID of the agent to find mates for
            max_results: Maximum number of mates to return

        Returns:
            List of compatible agent IDs
        """
        entity = self.get_entity(agent_id)
        if not entity:
            return []

        entity_traits = entity.get_component(TraitComponent)
        if not entity_traits:
            return []

        compatible = []
        for other_entity in self.get_agent_entities():
            if other_entity.id == entity.id:
                continue

            other_traits = other_entity.get_component(TraitComponent)
            if other_traits:
                compatibility = entity_traits.calculate_compatibility(other_traits)
                if compatibility >= 0.6:  # Minimum compatibility threshold
                    compatible.append((other_entity.id, compatibility))

        # Sort by compatibility and return top results
        compatible.sort(key=lambda x: x[1], reverse=True)
        return [agent_id for agent_id, _ in compatible[:max_results]]

    def analyze_genetic_compatibility(
        self, agent1_id: str, agent2_id: str
    ) -> dict[str, Any]:
        """
        Analyze genetic compatibility between two agents.

        Args:
            agent1_id: ID of first agent
            agent2_id: ID of second agent

        Returns:
            Dictionary with compatibility analysis
        """
        entity1 = self.get_entity(agent1_id)
        entity2 = self.get_entity(agent2_id)

        if not entity1 or not entity2:
            return {"compatibility": 0.0, "analysis": "Agents not found"}

        traits1 = entity1.get_component(TraitComponent)
        traits2 = entity2.get_component(TraitComponent)

        if not traits1 or not traits2:
            return {"compatibility": 0.0, "analysis": "Traits not found"}

        compatibility = traits1.calculate_compatibility(traits2)

        return {
            "compatibility": compatibility,
            "analysis": f"Genetic compatibility: {compatibility:.2f}",
            "recommended": compatibility >= 0.7,
        }

    def get_agent_lineage(self, agent_id: str, depth: int = 3) -> dict[str, Any]:
        """
        Get agent family tree and lineage.

        Args:
            agent_id: ID of the agent
            depth: Depth of lineage to retrieve

        Returns:
            Dictionary with lineage information
        """
        entity = self.get_entity(agent_id)
        if not entity:
            return {}

        lineage = entity.get_component(LineageComponent)
        if not lineage:
            return {}

        return {
            "agent": {"agent_id": agent_id},
            "parents": lineage.parents,
            "children": lineage.children,
            "ancestors": lineage.ancestors,
            "descendants": lineage.descendants,
        }

    def enable_automatic_reproduction(self, enabled: bool = True) -> None:
        """
        Enable or disable automatic reproduction.

        Args:
            enabled: Whether to enable automatic reproduction
        """
        # This would be implemented with a reproduction system
        logger.info(f"Automatic reproduction {'enabled' if enabled else 'disabled'}")

    async def start_global_breeding(self) -> None:
        """Start the global breeding scheduler."""
        logger.info("🌱 Global breeding scheduler started")

    async def stop_global_breeding(self) -> None:
        """Stop the global breeding scheduler."""
        logger.info("🌱 Global breeding scheduler stopped")

    def get_breeding_stats(self) -> dict[str, Any]:
        """
        Get breeding statistics.

        Returns:
            Dictionary with breeding statistics
        """
        agents = self.get_agent_entities()
        mature_agents = self.get_mature_agents()

        total_offspring = 0
        for entity in agents:
            reproduction = entity.get_component(ReproductionComponent)
            if reproduction:
                total_offspring += reproduction.offspring_count

        return {
            "total_agents": len(agents),
            "mature_agents": len(mature_agents),
            "total_offspring": total_offspring,
            "average_offspring_per_agent": (
                total_offspring / len(agents) if agents else 0
            ),
        }

    def _generate_agent_name(self, spirit: str, style: str) -> str:
        """
        Generate an agent name based on spirit and style.

        Args:
            spirit: Animal spirit
            style: Naming style

        Returns:
            Generated agent name
        """
        try:
            # Import the proper naming system from the installed library
            from agent_naming import (
                AnimalSpirit,
                NamingConfig,
                NamingStyle,
                ReynardRobotNamer,
            )

            # Convert string parameters to proper enums
            spirit_enum = AnimalSpirit(spirit) if isinstance(spirit, str) else spirit
            style_enum = NamingStyle(style) if isinstance(style, str) else style

            # Use the proper name generator
            namer = ReynardRobotNamer()
            config = NamingConfig(spirit=spirit_enum, style=style_enum, count=1)
            names = namer.generate_batch(config)

            if names:
                return names[0].name
            # Fallback to simple name if generation fails
            return f"Agent-{random.randint(1, 999)}"

        except Exception as e:
            logger.warning("Failed to generate proper name: %s, using fallback", e)
            # Fallback to simple name if anything goes wrong
            return f"Agent-{random.randint(1, 999)}"

    def _inherit_traits(
        self, traits1: TraitComponent, traits2: TraitComponent
    ) -> dict[str, Any]:
        """
        Create offspring traits by inheriting from both parents.

        Args:
            traits1: First parent's traits
            traits2: Second parent's traits

        Returns:
            Dictionary of inherited traits
        """
        # Simple trait inheritance - average parent traits with some mutation
        inherited = {
            "personality": {},
            "physical": {},
            "abilities": {},
            "mutation_count": max(traits1.mutation_count, traits2.mutation_count) + 1,
        }

        # Inherit personality traits
        for trait in traits1.personality:
            if trait in traits2.personality:
                # Average the traits with some mutation
                avg_value = (
                    traits1.personality[trait] + traits2.personality[trait]
                ) / 2
                mutation = random.uniform(-0.1, 0.1)
                inherited["personality"][trait] = max(
                    0.0, min(1.0, avg_value + mutation)
                )

        # Inherit physical traits
        for trait in traits1.physical:
            if trait in traits2.physical:
                avg_value = (traits1.physical[trait] + traits2.physical[trait]) / 2
                mutation = random.uniform(-0.1, 0.1)
                inherited["physical"][trait] = max(0.0, min(1.0, avg_value + mutation))

        # Inherit abilities
        for ability in traits1.abilities:
            if ability in traits2.abilities:
                avg_value = (
                    traits1.abilities[ability] + traits2.abilities[ability]
                ) / 2
                mutation = random.uniform(-0.1, 0.1)
                inherited["abilities"][ability] = max(
                    0.0, min(1.0, avg_value + mutation)
                )

        return inherited

    def _update_parent_lineage(self, parent_entity: Entity, offspring_id: str) -> None:
        """
        Update parent entity's lineage to include offspring.

        Args:
            parent_entity: The parent entity
            offspring_id: ID of the offspring
        """
        lineage = parent_entity.get_component(LineageComponent)
        if lineage:
            lineage.add_child(offspring_id)

    def _load_existing_agents(self) -> None:
        """Load existing agents from persistent storage."""
        # This would load from persistent storage
        logger.info("Loading existing agents from storage")

    def get_agent_persona(self, agent_id: str) -> dict[str, Any]:
        """
        Get comprehensive agent persona from ECS system.

        Args:
            agent_id: The agent ID to get persona for

        Returns:
            Dictionary containing persona information
        """
        entity = self.get_entity(agent_id)
        if not entity:
            return {}

        agent_comp = entity.get_component(AgentComponent)
        trait_comp = entity.get_component(TraitComponent)

        if not agent_comp:
            return {}

        # Generate basic persona from available components
        persona = {
            "spirit": agent_comp.spirit,
            "style": agent_comp.style,
            "name": agent_comp.name,
            "dominant_traits": [],
            "personality_summary": f"A {agent_comp.spirit} with {agent_comp.style} style",
        }

        if trait_comp:
            # Get top 3 personality traits by value
            dominant_traits = trait_comp.get_dominant_traits(3)
            persona["dominant_traits"] = list(dominant_traits.keys())

        return persona

    def get_lora_config(self, agent_id: str) -> dict[str, Any]:
        """
        Get LoRA configuration for agent persona.

        Args:
            agent_id: The agent ID to get LoRA config for

        Returns:
            Dictionary containing LoRA configuration
        """
        entity = self.get_entity(agent_id)
        if not entity:
            return {}

        agent_comp = entity.get_component(AgentComponent)
        trait_comp = entity.get_component(TraitComponent)

        if not agent_comp:
            return {}

        # Generate basic LoRA config
        config = {
            "base_model": "reynard-agent-base",
            "lora_rank": 16,
            "lora_alpha": 32,
            "target_modules": ["q_proj", "v_proj", "k_proj", "o_proj"],
            "personality_weights": {},
            "physical_weights": {},
            "ability_weights": {},
        }

        if trait_comp:
            config["personality_weights"] = trait_comp.personality.copy()
            config["physical_weights"] = trait_comp.physical.copy()
            config["ability_weights"] = trait_comp.abilities.copy()

        return config
