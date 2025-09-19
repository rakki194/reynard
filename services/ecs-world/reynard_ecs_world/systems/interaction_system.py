"""
Interaction System

Handles agent-to-agent interactions, proximity detection, social energy management,
and relationship building in the ECS world.
"""

import logging
import math
import random
from typing import Any, Dict, List, Tuple

from reynard_ecs_world.components.interaction import (
    Interaction,
    InteractionComponent,
    InteractionOutcome,
    InteractionType,
)
from reynard_ecs_world.components.position import PositionComponent
from reynard_ecs_world.components.traits import TraitComponent
from reynard_ecs_world.core.system import System

logger = logging.getLogger(__name__)


class InteractionSystem(System):
    """
    System for managing agent-to-agent interactions and communication.
    
    Handles proximity detection, interaction probability calculation,
    social energy management, and relationship building.
    """

    def __init__(self, world: Any) -> None:
        """
        Initialize the interaction system.
        
        Args:
            world: The ECS world this system belongs to
        """
        super().__init__(world)
        self.interaction_range = 50.0  # Maximum distance for interactions
        self.interaction_probability_base = 0.1  # Base probability per second
        self.processing_interval = 1.0  # Process interactions every second
        self.last_processing_time = 0.0
        self.total_interactions_processed = 0
        self.total_relationships_formed = 0

    def update(self, delta_time: float) -> None:
        """
        Process interactions between agents.
        
        Args:
            delta_time: Time elapsed since last update
        """
        self.last_processing_time += delta_time

        # Process interactions at regular intervals
        if self.last_processing_time >= self.processing_interval:
            self._process_interactions(delta_time)
            self.last_processing_time = 0.0

        # Update social energy recovery for all agents
        self._update_social_energy_recovery(delta_time)

    def _process_interactions(self, delta_time: float) -> None:
        """Process potential interactions between agents."""
        entities = self.get_entities_with_components(
            InteractionComponent, PositionComponent
        )

        # Find agents in proximity
        proximity_pairs = self._find_proximity_pairs(entities)

        # Process potential interactions
        for agent1, agent2 in proximity_pairs:
            self._evaluate_interaction_opportunity(agent1, agent2, delta_time)

    def _find_proximity_pairs(self, entities: List[Any]) -> List[Tuple[Any, Any]]:
        """Find agent pairs within interaction range."""
        pairs = []
        for i, agent1 in enumerate(entities):
            for agent2 in entities[i + 1:]:
                if self._are_in_proximity(agent1, agent2):
                    pairs.append((agent1, agent2))
        return pairs

    def _are_in_proximity(self, agent1: Any, agent2: Any) -> bool:
        """Check if two agents are within interaction range."""
        pos1 = agent1.get_component(PositionComponent)
        pos2 = agent2.get_component(PositionComponent)

        if not pos1 or not pos2:
            return False

        distance = math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2)
        return distance <= self.interaction_range

    def _evaluate_interaction_opportunity(self, agent1: Any, agent2: Any, delta_time: float) -> None:
        """Evaluate and potentially initiate interaction between agents."""
        interaction_comp1 = agent1.get_component(InteractionComponent)
        interaction_comp2 = agent2.get_component(InteractionComponent)

        if not interaction_comp1 or not interaction_comp2:
            return

        # Check if both agents can interact
        if not (interaction_comp1.can_interact() and interaction_comp2.can_interact()):
            return

        # Calculate interaction probability based on traits and relationship
        interaction_probability = self._calculate_interaction_probability(agent1, agent2)

        # Scale probability by delta time
        if random.random() < interaction_probability * delta_time:
            self._initiate_interaction(agent1, agent2)

    def _calculate_interaction_probability(self, agent1: Any, agent2: Any) -> float:
        """Calculate probability of interaction based on traits and relationship."""
        traits1 = agent1.get_component(TraitComponent)
        traits2 = agent2.get_component(TraitComponent)
        interaction_comp1 = agent1.get_component(InteractionComponent)

        if not traits1 or not traits2 or not interaction_comp1:
            return 0.0

        # Base probability from charisma and social traits
        charisma1 = traits1.personality.get('charisma', 0.5)
        charisma2 = traits2.personality.get('charisma', 0.5)
        playfulness1 = traits1.personality.get('playfulness', 0.5)
        playfulness2 = traits2.personality.get('playfulness', 0.5)

        base_prob = (charisma1 + charisma2 + playfulness1 + playfulness2) / 4

        # Relationship modifier
        relationship = interaction_comp1.get_relationship(agent2.id)
        if relationship:
            # Higher probability for positive relationships
            relationship_modifier = 1.0 + relationship.strength * 0.5
            base_prob *= relationship_modifier
        else:
            # Lower probability for strangers
            base_prob *= 0.5

        # Personality compatibility
        compatibility = self._calculate_personality_compatibility(traits1, traits2)
        base_prob *= (1.0 + compatibility * 0.3)

        return min(1.0, base_prob * self.interaction_probability_base)

    def _calculate_personality_compatibility(self, traits1: TraitComponent, traits2: TraitComponent) -> float:
        """Calculate personality compatibility between two agents."""
        compatibility = 0.0
        trait_count = 0

        # Compare personality traits
        for trait_name in traits1.personality:
            if trait_name in traits2.personality:
                trait1_val = traits1.personality[trait_name]
                trait2_val = traits2.personality[trait_name]
                
                # Similar traits increase compatibility
                similarity = 1.0 - abs(trait1_val - trait2_val)
                compatibility += similarity
                trait_count += 1

        return compatibility / trait_count if trait_count > 0 else 0.5

    def _initiate_interaction(self, agent1: Any, agent2: Any) -> None:
        """Initiate an interaction between two agents."""
        interaction_comp1 = agent1.get_component(InteractionComponent)
        interaction_comp2 = agent2.get_component(InteractionComponent)

        if not interaction_comp1 or not interaction_comp2:
            return

        # Determine interaction type based on traits and relationship
        interaction_type = self._determine_interaction_type(agent1, agent2)

        # Create interaction
        interaction_id = f"interaction_{random.randint(10000, 99999)}"
        interaction = Interaction(
            id=interaction_id,
            participants=[agent1.id, agent2.id],
            interaction_type=interaction_type,
            content=f"{interaction_type.value} interaction between {agent1.id} and {agent2.id}",
            outcome=InteractionOutcome.NEUTRAL,  # Will be determined by interaction logic
            relationship_impact=0.0,  # Will be calculated based on outcome
            energy_cost=0.1
        )

        # Start interaction for both agents
        if interaction_comp1.start_interaction(interaction_id) and interaction_comp2.start_interaction(interaction_id):
            # Simulate interaction outcome
            self._simulate_interaction_outcome(interaction, agent1, agent2)

            # End interaction for both agents
            interaction_comp1.end_interaction(interaction)
            interaction_comp2.end_interaction(interaction)

            self.total_interactions_processed += 1
            logger.debug(f"Interaction {interaction_id} completed between {agent1.id} and {agent2.id}")

    def _determine_interaction_type(self, agent1: Any, agent2: Any) -> InteractionType:
        """Determine the type of interaction based on agent traits and relationship."""
        traits1 = agent1.get_component(TraitComponent)
        traits2 = agent2.get_component(TraitComponent)
        interaction_comp1 = agent1.get_component(InteractionComponent)

        if not traits1 or not traits2 or not interaction_comp1:
            return InteractionType.COMMUNICATION

        # Check relationship type
        relationship = interaction_comp1.get_relationship(agent2.id)
        if relationship:
            if relationship.relationship_type == "friend":
                return random.choice([InteractionType.SOCIAL, InteractionType.COMMUNICATION])
            elif relationship.relationship_type == "rival":
                return InteractionType.COMPETITIVE
            elif relationship.relationship_type == "mentor":
                return InteractionType.TEACHING

        # Determine based on personality traits
        playfulness1 = traits1.personality.get('playfulness', 0.5)
        playfulness2 = traits2.personality.get('playfulness', 0.5)
        avg_playfulness = (playfulness1 + playfulness2) / 2

        if avg_playfulness > 0.7:
            return random.choice([InteractionType.SOCIAL, InteractionType.COMMUNICATION])
        elif avg_playfulness < 0.3:
            return InteractionType.COMMUNICATION
        else:
            return random.choice([InteractionType.COMMUNICATION, InteractionType.COLLABORATION])

    def _simulate_interaction_outcome(self, interaction: Interaction, agent1: Any, agent2: Any) -> None:
        """Simulate the outcome of an interaction."""
        traits1 = agent1.get_component(TraitComponent)
        traits2 = agent2.get_component(TraitComponent)

        if not traits1 or not traits2:
            interaction.outcome = InteractionOutcome.NEUTRAL
            interaction.relationship_impact = 0.0
            return

        # Calculate success probability based on traits
        charisma1 = traits1.personality.get('charisma', 0.5)
        charisma2 = traits2.personality.get('charisma', 0.5)
        avg_charisma = (charisma1 + charisma2) / 2

        # Add some randomness
        success_probability = avg_charisma + random.uniform(-0.2, 0.2)
        success_probability = max(0.0, min(1.0, success_probability))

        # Determine outcome
        if success_probability > 0.7:
            interaction.outcome = InteractionOutcome.SUCCESS
            interaction.relationship_impact = random.uniform(0.1, 0.3)
        elif success_probability > 0.4:
            interaction.outcome = InteractionOutcome.PARTIAL_SUCCESS
            interaction.relationship_impact = random.uniform(0.0, 0.1)
        elif success_probability > 0.2:
            interaction.outcome = InteractionOutcome.NEUTRAL
            interaction.relationship_impact = 0.0
        else:
            interaction.outcome = InteractionOutcome.FAILURE
            interaction.relationship_impact = random.uniform(-0.2, -0.05)

        # Set interaction duration
        interaction.duration = random.uniform(1.0, 10.0)

        # Add success factors
        interaction.success_factors = {
            "charisma": avg_charisma,
            "compatibility": self._calculate_personality_compatibility(traits1, traits2),
            "random_factor": random.uniform(0.0, 1.0)
        }

    def _update_social_energy_recovery(self, delta_time: float) -> None:
        """Update social energy recovery for all agents."""
        entities = self.get_entities_with_components(InteractionComponent)
        
        for entity in entities:
            interaction_comp = entity.get_component(InteractionComponent)
            if interaction_comp:
                interaction_comp.recover_energy(delta_time)

    def initiate_interaction(
        self, agent1_id: str, agent2_id: str, interaction_type: InteractionType
    ) -> bool:
        """
        Manually initiate an interaction between two agents.
        
        Args:
            agent1_id: ID of first agent
            agent2_id: ID of second agent
            interaction_type: Type of interaction to initiate
            
        Returns:
            True if interaction was initiated successfully
        """
        agent1 = self.world.get_entity(agent1_id)
        agent2 = self.world.get_entity(agent2_id)

        if not agent1 or not agent2:
            logger.warning(f"Agents {agent1_id} or {agent2_id} not found")
            return False

        # Check proximity
        if not self._are_in_proximity(agent1, agent2):
            logger.warning(f"Agents {agent1_id} and {agent2_id} not in proximity")
            return False

        # Check if agents can interact
        interaction_comp1 = agent1.get_component(InteractionComponent)
        interaction_comp2 = agent2.get_component(InteractionComponent)

        if not interaction_comp1 or not interaction_comp2:
            logger.warning(f"Agents {agent1_id} or {agent2_id} missing interaction component")
            return False

        if not (interaction_comp1.can_interact() and interaction_comp2.can_interact()):
            logger.warning(f"Agents {agent1_id} or {agent2_id} cannot interact")
            return False

        # Create and execute interaction
        interaction_id = f"manual_interaction_{random.randint(10000, 99999)}"
        interaction = Interaction(
            id=interaction_id,
            participants=[agent1_id, agent2_id],
            interaction_type=interaction_type,
            content=f"Manual {interaction_type.value} interaction",
            outcome=InteractionOutcome.NEUTRAL,
            relationship_impact=0.0,
            energy_cost=0.1
        )

        # Start interaction
        if interaction_comp1.start_interaction(interaction_id) and interaction_comp2.start_interaction(interaction_id):
            # Simulate outcome
            self._simulate_interaction_outcome(interaction, agent1, agent2)

            # End interaction
            interaction_comp1.end_interaction(interaction)
            interaction_comp2.end_interaction(interaction)

            self.total_interactions_processed += 1
            logger.info(f"Manual interaction {interaction_id} completed between {agent1_id} and {agent2_id}")
            return True

        return False

    def get_relationship_status(self, agent1_id: str, agent2_id: str) -> Dict[str, Any]:
        """
        Get relationship status between two agents.
        
        Args:
            agent1_id: ID of first agent
            agent2_id: ID of second agent
            
        Returns:
            Dictionary with relationship information
        """
        agent1 = self.world.get_entity(agent1_id)
        if not agent1:
            return {"error": f"Agent {agent1_id} not found"}

        interaction_comp = agent1.get_component(InteractionComponent)
        if not interaction_comp:
            return {"error": f"Agent {agent1_id} has no interaction component"}

        relationship = interaction_comp.get_relationship(agent2_id)
        if not relationship:
            return {
                "relationship_type": "stranger",
                "strength": 0.0,
                "trust_level": 0.0,
                "familiarity": 0.0,
                "interaction_count": 0,
                "last_interaction": None
            }

        return {
            "relationship_type": relationship.relationship_type,
            "strength": relationship.strength,
            "trust_level": relationship.trust_level,
            "familiarity": relationship.familiarity,
            "interaction_count": relationship.interaction_count,
            "positive_interactions": relationship.positive_interactions,
            "negative_interactions": relationship.negative_interactions,
            "total_time_together": relationship.total_time_together,
            "last_interaction": relationship.last_interaction.isoformat(),
            "relationship_quality": relationship.get_relationship_quality()
        }

    def get_system_stats(self) -> Dict[str, Any]:
        """Get comprehensive system statistics."""
        entities = self.get_entities_with_components(InteractionComponent)
        total_agents = len(entities)
        
        total_relationships = 0
        total_interactions = 0
        for entity in entities:
            interaction_comp = entity.get_component(InteractionComponent)
            if interaction_comp:
                total_relationships += len(interaction_comp.relationship_map)
                total_interactions += interaction_comp.total_interactions

        return {
            "total_agents_with_interactions": total_agents,
            "total_relationships": total_relationships,
            "total_interactions": total_interactions,
            "interactions_processed": self.total_interactions_processed,
            "interaction_range": self.interaction_range,
            "processing_interval": self.processing_interval,
            "base_interaction_probability": self.interaction_probability_base
        }

    def __repr__(self) -> str:
        """String representation of the interaction system."""
        return f"InteractionSystem(enabled={self.enabled}, processed={self.total_interactions_processed})"
