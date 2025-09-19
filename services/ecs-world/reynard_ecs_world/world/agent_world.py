"""
Agent World

Specialized ECS world for agent management with breeding and trait inheritance.
"""

import logging
import os
import random
from pathlib import Path
from typing import Any, cast

from ..components import (
    AgentComponent,
    GenderComponent,
    GenderIdentity,
    GenderProfile,
    GroupType,
    InteractionComponent,
    InteractionType,
    KnowledgeComponent,
    KnowledgeType,
    LearningMethod,
    LifecycleComponent,
    LineageComponent,
    MemoryComponent,
    MemoryType,
    PositionComponent,
    ReproductionComponent,
    SocialComponent,
    TraitComponent,
)
from ..core.entity import Entity
from ..core.world import ECSWorld
from ..systems import GenderSystem, InteractionSystem, LearningSystem, MemorySystem, SocialSystem

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
            self.data_dir = Path(os.getcwd()) / "data" / "ecs"
        else:
            # Ensure data_dir is a Path object
            self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Add systems
        self.add_system(MemorySystem(self))
        self.add_system(InteractionSystem(self))
        self.add_system(SocialSystem(self))
        self.add_system(LearningSystem(self))
        self.add_system(GenderSystem(self))

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
        entity.add_component(MemoryComponent())
        entity.add_component(InteractionComponent())
        entity.add_component(SocialComponent())
        entity.add_component(KnowledgeComponent())
        
        # Add gender component with default identity
        default_identity = GenderIdentity.NON_BINARY  # Default to inclusive identity
        entity.add_component(GenderComponent(
            profile=GenderProfile(primary_identity=default_identity)
        ))

        # Add position with random starting location
        start_x = random.uniform(100, 800)
        start_y = random.uniform(100, 600)
        entity.add_component(PositionComponent(start_x, start_y))

        logger.info("Created agent %s with name %s", agent_id, name)
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
        offspring.add_component(MemoryComponent())
        offspring.add_component(InteractionComponent())
        offspring.add_component(SocialComponent())
        offspring.add_component(KnowledgeComponent())
        
        # Add gender component with default identity
        default_identity = GenderIdentity.NON_BINARY  # Default to inclusive identity
        offspring.add_component(GenderComponent(
            profile=GenderProfile(primary_identity=default_identity)
        ))

        # Add position with random starting location
        start_x = random.uniform(100, 800)
        start_y = random.uniform(100, 600)
        offspring.add_component(PositionComponent(start_x, start_y))

        # Update parent lineage
        self._update_parent_lineage(parent1, offspring_id)
        self._update_parent_lineage(parent2, offspring_id)

        logger.info(
            "Created offspring %s from parents %s and %s", offspring_id, parent1_id, parent2_id
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
            depth: Depth of lineage to retrieve (currently not implemented)

        Returns:
            Dictionary with lineage information
        """
        entity = self.get_entity(agent_id)
        if not entity:
            return {}

        lineage = entity.get_component(LineageComponent)
        if not lineage:
            return {}

        # TODO: Implement depth-based lineage retrieval
        # For now, return all lineage data regardless of depth
        return {
            "agent": {"agent_id": agent_id},
            "parents": lineage.parents,
            "children": lineage.children,
            "ancestors": lineage.ancestors,
            "descendants": lineage.descendants,
            "depth_requested": depth,  # Include the requested depth for future implementation
        }

    def enable_automatic_reproduction(self, enabled: bool = True) -> None:
        """
        Enable or disable automatic reproduction.

        Args:
            enabled: Whether to enable automatic reproduction
        """
        # This would be implemented with a reproduction system
        logger.info("Automatic reproduction %s", "enabled" if enabled else "disabled")

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
            # Use the backend data service for name generation
            import asyncio
            import httpx
            
            async def _fetch_name_data() -> str:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    try:
                        # Get spirit names
                        response = await client.get(f"http://localhost:8000/api/ecs/naming/animal-spirits/{spirit}")
                        if response.status_code == 200:
                            spirit_data = response.json()
                            spirit_names = spirit_data.get("names", [])
                        else:
                            spirit_names = [spirit.title()]
                        
                        # Get naming components
                        response = await client.get("http://localhost:8000/api/ecs/naming/components")
                        if response.status_code == 200:
                            components = response.json()
                        else:
                            components = {}
                        
                        # Get generation numbers
                        response = await client.get(f"http://localhost:8000/api/ecs/naming/generation-numbers/{spirit}")
                        if response.status_code == 200:
                            gen_data = response.json()
                            generation_numbers = gen_data.get("numbers", [])
                        else:
                            generation_numbers = [random.randint(1, 100)]
                        
                        # Generate name based on style
                        if not spirit_names:
                            spirit_names = [spirit.title()]
                        
                        spirit_name = random.choice(spirit_names)
                        generation = random.choice(generation_numbers)
                        
                        if style == "foundation":
                            suffixes = components.get("foundation_suffixes", ["Prime", "Sage", "Oracle"])
                            suffix = random.choice(suffixes)
                            return f"{spirit_name}-{suffix}-{generation}"
                        elif style == "exo":
                            suffixes = components.get("exo_suffixes", ["Strike", "Guard", "Sentinel"])
                            suffix = random.choice(suffixes)
                            return f"{spirit_name}-{suffix}-{generation}"
                        elif style == "cyberpunk":
                            prefixes = components.get("cyberpunk_prefixes", ["Cyber", "Neo", "Mega"])
                            suffixes = components.get("cyberpunk_suffixes", ["Nexus", "Grid", "Web"])
                            prefix = random.choice(prefixes)
                            suffix = random.choice(suffixes)
                            return f"{prefix}-{spirit_name}-{suffix}"
                        else:
                            # Default foundation style
                            suffixes = components.get("foundation_suffixes", ["Prime", "Sage", "Oracle"])
                            suffix = random.choice(suffixes)
                            return f"{spirit_name}-{suffix}-{generation}"
                            
                    except (httpx.RequestError, httpx.TimeoutException, httpx.HTTPStatusError) as e:
                        logger.warning("Failed to fetch name data from backend: %s", e)
                        return f"{spirit.title()}-{style.title()}-{random.randint(1, 100)}"
            
            # Run the async function
            return asyncio.run(_fetch_name_data())

        except (asyncio.TimeoutError, RuntimeError, ImportError) as e:
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

        # Generate rich persona from available components
        persona = {
            "spirit": agent_comp.spirit,
            "style": agent_comp.style,
            "name": agent_comp.name,
            "dominant_traits": [],
            "personality_summary": self._generate_personality_summary(agent_comp.spirit, trait_comp),
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

    def _generate_personality_summary(self, spirit: str, trait_comp: TraitComponent | None) -> str:
        """
        Generate a rich personality summary based on spirit and traits.

        Args:
            spirit: The animal spirit type
            trait_comp: The trait component with personality data

        Returns:
            Rich personality description
        """
        if not trait_comp:
            return f"A {spirit} with a balanced, adaptable nature"

        # Get dominant traits
        dominant_traits = trait_comp.get_dominant_traits(3)
        if not dominant_traits:
            return self._get_default_personality(spirit)

        # Get personality based on traits
        return self._determine_personality_type(spirit, dominant_traits)

    def _get_default_personality(self, spirit: str) -> str:
        """Get default personality for a spirit type."""
        defaults = {
            "fox": "A sly fox with natural cunning and adaptability",
            "wolf": "A powerful wolf with pack instincts and protective nature",
            "otter": "A playful otter with natural curiosity and enthusiasm",
            "eagle": "A majestic eagle with keen vision and noble bearing",
            "lion": "A regal lion with natural authority and pride",
            "tiger": "A powerful tiger with fierce independence and strength",
            "dragon": "An ancient dragon with wisdom and powerful presence"
        }
        return defaults.get(spirit, defaults["fox"])

    def _determine_personality_type(self, spirit: str, dominant_traits: dict[str, float]) -> str:
        """Determine personality type based on dominant traits."""
        trait_names = list(dominant_traits.keys())
        trait_values = list(dominant_traits.values())
        top_trait = trait_names[0]
        top_value = trait_values[0]

        # Check for high-value traits
        if top_value > 0.8:
            return self._get_high_trait_personality(spirit, top_trait)

        # Check for balanced personality
        if len(trait_values) >= 2 and max(trait_values) - min(trait_values) < 0.3:
            return self._get_balanced_personality(spirit)

        # Default personality
        return self._get_default_personality(spirit)

    def _get_high_trait_personality(self, spirit: str, trait: str) -> str:
        """Get personality for high-value traits."""
        personalities = {
            "fox": {
                "cunning": "A cunning fox with sharp wit and strategic thinking",
                "intelligence": "An intelligent fox with keen problem-solving abilities",
                "creativity": "A creative fox with innovative approaches to challenges"
            },
            "wolf": {
                "dominance": "A dominant wolf with strong leadership and pack coordination",
                "loyalty": "A loyal wolf with unwavering commitment to the pack",
                "aggression": "An aggressive wolf with fierce determination and drive"
            },
            "otter": {
                "creativity": "A playful otter with boundless creativity and joy",
                "intelligence": "An intelligent otter with curious and analytical mind"
            },
            "eagle": {
                "dominance": "A majestic eagle with commanding presence and vision",
                "intelligence": "A wise eagle with keen insight and strategic thinking"
            },
            "lion": {
                "dominance": "A regal lion with natural authority and commanding presence",
                "aggression": "A fierce lion with powerful determination and strength"
            },
            "tiger": {
                "aggression": "A fierce tiger with intense focus and powerful determination",
                "dominance": "A powerful tiger with commanding presence and strength"
            },
            "dragon": {
                "intelligence": "An ancient dragon with vast wisdom and knowledge",
                "dominance": "A powerful dragon with commanding presence and authority"
            }
        }
        spirit_personalities = personalities.get(spirit, personalities["fox"])
        return spirit_personalities.get(trait, self._get_default_personality(spirit))

    def _get_balanced_personality(self, spirit: str) -> str:
        """Get balanced personality for a spirit type."""
        balanced = {
            "fox": "A clever fox with balanced cunning and wisdom",
            "wolf": "A strong wolf with natural leadership and loyalty",
            "otter": "A joyful otter with playful spirit and sharp intelligence",
            "eagle": "A noble eagle with soaring vision and sharp intellect",
            "lion": "A noble lion with royal bearing and strong leadership",
            "tiger": "A strong tiger with fierce independence and power",
            "dragon": "A wise dragon with ancient knowledge and powerful presence"
        }
        return balanced.get(spirit, self._get_default_personality(spirit))

    # Memory management methods
    def store_memory(
        self,
        agent_id: str,
        memory_type: MemoryType,
        content: str,
        importance: float = 0.5,
        emotional_weight: float = 0.0,
        associated_agents: list[str] | None = None
    ) -> bool:
        """
        Store a memory for an agent.
        
        Args:
            agent_id: ID of the agent to store memory for
            memory_type: Type of memory to store
            content: Memory content/description
            importance: Importance level (0.0 to 1.0)
            emotional_weight: Emotional significance (-1.0 to 1.0)
            associated_agents: List of agent IDs associated with this memory
            
        Returns:
            True if memory was stored successfully, False otherwise
        """
        memory_system = cast(MemorySystem, self.get_system(MemorySystem))
        if not memory_system:
            logger.warning("Memory system not found")
            return False

        memory_id = memory_system.store_memory_for_agent(
            agent_id=agent_id,
            memory_type=memory_type,
            content=content,
            importance=importance,
            emotional_weight=emotional_weight,
            associated_agents=associated_agents
        )

        return bool(memory_id)

    def retrieve_memories(
        self,
        agent_id: str,
        query: str = "",
        memory_type: MemoryType | None = None,
        limit: int = 10,
        min_importance: float = 0.0
    ) -> list[Any]:
        """
        Retrieve memories for an agent based on query and type.
        
        Args:
            agent_id: ID of the agent to retrieve memories for
            query: Text query to search for in memory content
            memory_type: Filter by specific memory type
            limit: Maximum number of memories to return
            min_importance: Minimum importance threshold
            
        Returns:
            List of matching memories
        """
        memory_system = cast(MemorySystem, self.get_system(MemorySystem))
        if not memory_system:
            logger.warning("Memory system not found")
            return []

        return memory_system.retrieve_memories_for_agent(
            agent_id=agent_id,
            query=query,
            memory_type=memory_type,
            limit=limit,
            min_importance=min_importance
        )

    def get_memory_stats(self, agent_id: str) -> dict[str, Any]:
        """
        Get memory statistics for an agent.
        
        Args:
            agent_id: ID of the agent to get stats for
            
        Returns:
            Dictionary with memory statistics
        """
        memory_system = cast(MemorySystem, self.get_system(MemorySystem))
        if not memory_system:
            return {}

        return memory_system.get_memory_stats_for_agent(agent_id)

    def get_memory_system_stats(self) -> dict[str, Any]:
        """
        Get comprehensive memory system statistics.
        
        Returns:
            Dictionary with system-wide memory statistics
        """
        memory_system = cast(MemorySystem, self.get_system(MemorySystem))
        if not memory_system:
            return {}

        return memory_system.get_system_stats()

    # Interaction management methods
    def initiate_interaction(self, agent1_id: str, agent2_id: str, interaction_type: InteractionType) -> bool:
        """
        Initiate an interaction between two agents.
        
        Args:
            agent1_id: ID of first agent
            agent2_id: ID of second agent
            interaction_type: Type of interaction to initiate
            
        Returns:
            True if interaction was initiated successfully
        """
        interaction_system = cast(InteractionSystem, self.get_system(InteractionSystem))
        if not interaction_system:
            logger.warning("Interaction system not found")
            return False

        return interaction_system.initiate_interaction(agent1_id, agent2_id, interaction_type)

    def get_relationship_status(self, agent1_id: str, agent2_id: str) -> dict[str, Any]:
        """
        Get relationship status between two agents.
        
        Args:
            agent1_id: ID of first agent
            agent2_id: ID of second agent
            
        Returns:
            Dictionary with relationship information
        """
        interaction_system = cast(InteractionSystem, self.get_system(InteractionSystem))
        if not interaction_system:
            return {"error": "Interaction system not found"}

        return interaction_system.get_relationship_status(agent1_id, agent2_id)

    def get_interaction_stats(self, agent_id: str) -> dict[str, Any]:
        """
        Get interaction statistics for an agent.
        
        Args:
            agent_id: ID of the agent to get stats for
            
        Returns:
            Dictionary with interaction statistics
        """
        entity = self.get_entity(agent_id)
        if not entity:
            return {}

        interaction_comp = entity.get_component(InteractionComponent)
        if not interaction_comp:
            return {}

        return interaction_comp.get_interaction_stats()

    def get_interaction_system_stats(self) -> dict[str, Any]:
        """
        Get comprehensive interaction system statistics.
        
        Returns:
            Dictionary with system-wide interaction statistics
        """
        interaction_system = cast(InteractionSystem, self.get_system(InteractionSystem))
        if not interaction_system:
            return {}

        return interaction_system.get_system_stats()

    # Social management methods
    def create_social_group(
        self, 
        creator_id: str, 
        group_name: str, 
        group_type: GroupType,
        member_ids: list[str]
    ) -> str:
        """
        Create a social group.
        
        Args:
            creator_id: ID of the agent creating the group
            group_name: Name of the group
            group_type: Type of group to create
            member_ids: List of agent IDs to include in the group
            
        Returns:
            Group ID if successful, empty string if failed
        """
        social_system = cast(SocialSystem, self.get_system(SocialSystem))
        if not social_system:
            logger.warning("Social system not found")
            return ""

        return social_system.create_social_group(creator_id, group_name, group_type, member_ids)

    def get_social_network(self, agent_id: str) -> dict[str, Any]:
        """
        Get social network information for an agent.
        
        Args:
            agent_id: ID of the agent to get network for
            
        Returns:
            Dictionary with network information
        """
        social_system = cast(SocialSystem, self.get_system(SocialSystem))
        if not social_system:
            return {"error": "Social system not found"}

        return social_system.get_social_network(agent_id)

    def get_group_info(self, group_id: str) -> dict[str, Any]:
        """
        Get information about a social group.
        
        Args:
            group_id: ID of the group to get info for
            
        Returns:
            Dictionary with group information
        """
        social_system = cast(SocialSystem, self.get_system(SocialSystem))
        if not social_system:
            return {"error": "Social system not found"}

        return social_system.get_group_info(group_id)

    def get_social_stats(self, agent_id: str) -> dict[str, Any]:
        """
        Get social statistics for an agent.
        
        Args:
            agent_id: ID of the agent to get stats for
            
        Returns:
            Dictionary with social statistics
        """
        entity = self.get_entity(agent_id)
        if not entity:
            return {}

        social_comp = entity.get_component(SocialComponent)
        if not social_comp:
            return {}

        return social_comp.get_social_stats()

    def get_social_system_stats(self) -> dict[str, Any]:
        """
        Get comprehensive social system statistics.
        
        Returns:
            Dictionary with system-wide social statistics
        """
        social_system = cast(SocialSystem, self.get_system(SocialSystem))
        if not social_system:
            return {}

        return social_system.get_system_stats()

    # Knowledge management methods
    def add_knowledge(
        self,
        agent_id: str,
        title: str,
        knowledge_type: KnowledgeType,
        description: str,
        proficiency: float = 0.1,
        confidence: float = 0.5,
        learning_method: LearningMethod = LearningMethod.EXPERIENCE,
        source_agent: str | None = None,
        tags: list[str] | None = None,
        difficulty: float = 0.5,
        importance: float = 0.5,
        transferability: float = 0.5
    ) -> str:
        """
        Add knowledge to an agent's knowledge base.
        
        Args:
            agent_id: ID of the agent to add knowledge to
            title: Title of the knowledge
            knowledge_type: Type of knowledge
            description: Description of the knowledge
            proficiency: Initial proficiency level (0.0 to 1.0)
            confidence: Confidence in the knowledge (0.0 to 1.0)
            learning_method: How the knowledge was acquired
            source_agent: Agent who taught this knowledge
            tags: Tags for categorization
            difficulty: Difficulty of the knowledge
            importance: Importance of the knowledge
            transferability: How easy it is to teach this knowledge
            
        Returns:
            Knowledge ID if successful, empty string if failed
        """
        entity = self.get_entity(agent_id)
        if not entity:
            logger.warning("Agent %s not found", agent_id)
            return ""

        knowledge_comp = entity.get_component(KnowledgeComponent)
        if not knowledge_comp:
            logger.warning("Agent %s has no knowledge component", agent_id)
            return ""

        return knowledge_comp.add_knowledge(
            title=title,
            knowledge_type=knowledge_type,
            description=description,
            proficiency=proficiency,
            confidence=confidence,
            learning_method=learning_method,
            source_agent=source_agent,
            tags=tags,
            difficulty=difficulty,
            importance=importance,
            transferability=transferability
        )

    def transfer_knowledge(
        self,
        teacher_id: str,
        student_id: str,
        knowledge_id: str,
        learning_method: LearningMethod = LearningMethod.TEACHING
    ) -> bool:
        """
        Transfer knowledge between agents.
        
        Args:
            teacher_id: ID of the agent teaching the knowledge
            student_id: ID of the agent learning the knowledge
            knowledge_id: ID of the knowledge to transfer
            learning_method: Method of learning
            
        Returns:
            True if transfer was successful
        """
        learning_system = cast(LearningSystem, self.get_system(LearningSystem))
        if not learning_system:
            logger.warning("Learning system not found")
            return False

        return learning_system.transfer_knowledge(teacher_id, student_id, knowledge_id, learning_method)

    def get_knowledge_stats(self, agent_id: str) -> dict[str, Any]:
        """
        Get knowledge statistics for an agent.
        
        Args:
            agent_id: ID of the agent to get stats for
            
        Returns:
            Dictionary with knowledge statistics
        """
        entity = self.get_entity(agent_id)
        if not entity:
            return {}

        knowledge_comp = entity.get_component(KnowledgeComponent)
        if not knowledge_comp:
            return {}

        return knowledge_comp.get_knowledge_stats()

    def get_knowledge_transfer_stats(self, agent_id: str) -> dict[str, Any]:
        """
        Get knowledge transfer statistics for an agent.
        
        Args:
            agent_id: ID of the agent to get stats for
            
        Returns:
            Dictionary with transfer statistics
        """
        learning_system = cast(LearningSystem, self.get_system(LearningSystem))
        if not learning_system:
            return {"error": "Learning system not found"}

        return learning_system.get_knowledge_transfer_stats(agent_id)

    def get_learning_system_stats(self) -> dict[str, Any]:
        """
        Get comprehensive learning system statistics.
        
        Returns:
            Dictionary with system-wide learning statistics
        """
        learning_system = cast(LearningSystem, self.get_system(LearningSystem))
        if not learning_system:
            return {}

        return learning_system.get_system_stats()

    # Gender Management Methods

    def update_gender_identity(self, agent_id: str, new_identity: GenderIdentity) -> bool:
        """
        Update an agent's gender identity.
        
        Args:
            agent_id: ID of the agent to update
            new_identity: New gender identity
            
        Returns:
            True if successful, False otherwise
        """
        gender_system = cast(GenderSystem, self.get_system(GenderSystem))
        if not gender_system:
            return False

        return gender_system.update_gender_identity(agent_id, new_identity)

    def add_support_agent(self, agent_id: str, support_agent_id: str) -> bool:
        """
        Add a support agent to an agent's support network.
        
        Args:
            agent_id: ID of the agent to add support to
            support_agent_id: ID of the supportive agent
            
        Returns:
            True if successful, False otherwise
        """
        gender_system = cast(GenderSystem, self.get_system(GenderSystem))
        if not gender_system:
            return False

        return gender_system.add_support_agent(agent_id, support_agent_id)

    def remove_support_agent(self, agent_id: str, support_agent_id: str) -> bool:
        """
        Remove a support agent from an agent's support network.
        
        Args:
            agent_id: ID of the agent to remove support from
            support_agent_id: ID of the supportive agent to remove
            
        Returns:
            True if successful, False otherwise
        """
        gender_system = cast(GenderSystem, self.get_system(GenderSystem))
        if not gender_system:
            return False

        return gender_system.remove_support_agent(agent_id, support_agent_id)

    def update_coming_out_status(self, agent_id: str, other_agent_id: str, knows: bool) -> bool:
        """
        Update who knows about an agent's gender identity.
        
        Args:
            agent_id: ID of the agent whose identity is being shared
            other_agent_id: ID of the agent who now knows/doesn't know
            knows: Whether the other agent knows about the identity
            
        Returns:
            True if successful, False otherwise
        """
        gender_system = cast(GenderSystem, self.get_system(GenderSystem))
        if not gender_system:
            return False

        return gender_system.update_coming_out_status(agent_id, other_agent_id, knows)

    def get_gender_stats(self, agent_id: str) -> dict[str, Any]:
        """
        Get gender statistics for a specific agent.
        
        Args:
            agent_id: ID of the agent to get stats for
            
        Returns:
            Dictionary with gender statistics
        """
        gender_system = self.get_system(GenderSystem)
        if not gender_system:
            return {}

        return gender_system.get_agent_gender_info(agent_id) or {}

    def get_gender_system_stats(self) -> dict[str, Any]:
        """
        Get comprehensive gender system statistics.
        
        Returns:
            Dictionary with system-wide gender statistics
        """
        gender_system = cast(GenderSystem, self.get_system(GenderSystem))
        if not gender_system:
            return {}

        return gender_system.get_gender_statistics()

