"""
Interaction System

Handles agent-to-agent interactions, proximity detection, social energy management,
and relationship building in the ECS world.
"""

import logging
import math
import random
from typing import Any, Dict, List, Tuple

from ..components.interaction import (
    Interaction,
    InteractionComponent,
    InteractionOutcome,
    InteractionType,
)
from ..components.position import PositionComponent
from ..components.traits import TraitComponent
from ..core.system import System

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
            for agent2 in entities[i + 1 :]:
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

    def _evaluate_interaction_opportunity(
        self, agent1: Any, agent2: Any, delta_time: float
    ) -> None:
        """Evaluate and potentially initiate interaction between agents."""
        interaction_comp1 = agent1.get_component(InteractionComponent)
        interaction_comp2 = agent2.get_component(InteractionComponent)

        if not interaction_comp1 or not interaction_comp2:
            return

        # Check if both agents have enough social energy
        if not interaction_comp1.can_interact() or not interaction_comp2.can_interact():
            return

        # Calculate interaction probability
        probability = self._calculate_interaction_probability(
            agent1, agent2, delta_time
        )

        # Roll for interaction
        if random.random() < probability:
            self._initiate_interaction(agent1, agent2)

    def _calculate_interaction_probability(
        self, agent1: Any, agent2: Any, delta_time: float
    ) -> float:
        """Calculate the probability of interaction between two agents."""
        base_probability = self.interaction_probability_base * delta_time

        # Get trait components for personality factors
        traits1 = agent1.get_component(TraitComponent)
        traits2 = agent2.get_component(TraitComponent)

        if not traits1 or not traits2:
            return base_probability

        # Factor in personality traits
        charisma_factor = (traits1.charisma + traits2.charisma) / 2.0
        social_factor = (traits1.social_energy + traits2.social_energy) / 2.0

        # Factor in existing relationship
        interaction_comp1 = agent1.get_component(InteractionComponent)
        relationship = (
            interaction_comp1.get_relationship(agent2.id) if interaction_comp1 else None
        )

        relationship_factor = 1.0
        if relationship:
            # Higher probability for positive relationships
            relationship_factor = 1.0 + relationship.strength * 0.5

        # Calculate final probability
        final_probability = (
            base_probability * charisma_factor * social_factor * relationship_factor
        )

        return min(1.0, final_probability)

    def _initiate_interaction(self, agent1: Any, agent2: Any) -> None:
        """Initiate an interaction between two agents."""
        interaction_comp1 = agent1.get_component(InteractionComponent)
        interaction_comp2 = agent2.get_component(InteractionComponent)

        if not interaction_comp1 or not interaction_comp2:
            return

        # Determine interaction type
        interaction_type = self._determine_interaction_type(agent1, agent2)

        # Create interaction content
        content = self._generate_interaction_content(agent1, agent2, interaction_type)

        # Calculate interaction outcome
        outcome = self._calculate_interaction_outcome(agent1, agent2, interaction_type)

        # Calculate relationship impact
        relationship_impact = self._calculate_relationship_impact(
            agent1, agent2, outcome
        )

        # Create interaction record
        interaction = Interaction(
            id=f"interaction_{self.total_interactions_processed}_{agent1.id}_{agent2.id}",
            participants=[agent1.id, agent2.id],
            interaction_type=interaction_type,
            content=content,
            outcome=outcome,
            relationship_impact=relationship_impact,
            duration=random.uniform(5.0, 30.0),  # Random duration
            energy_cost=0.1,
        )

        # Record interaction for both agents
        interaction_comp1.interactions.append(interaction)
        interaction_comp2.interactions.append(interaction)

        # Update relationships
        self._update_relationships_from_interaction(agent1, agent2, interaction)

        # Update statistics
        self.total_interactions_processed += 1
        if outcome in [InteractionOutcome.SUCCESS, InteractionOutcome.PARTIAL_SUCCESS]:
            self.total_relationships_formed += 1

        logger.debug(
            f"Interaction initiated between {agent1.id} and {agent2.id}: {interaction_type.value}"
        )

    def _determine_interaction_type(self, agent1: Any, agent2: Any) -> InteractionType:
        """Determine the type of interaction between two agents."""
        # Get trait components
        traits1 = agent1.get_component(TraitComponent)
        traits2 = agent2.get_component(TraitComponent)

        if not traits1 or not traits2:
            return InteractionType.SOCIAL

        # Check existing relationship
        interaction_comp1 = agent1.get_component(InteractionComponent)
        relationship = (
            interaction_comp1.get_relationship(agent2.id) if interaction_comp1 else None
        )

        # Determine interaction type based on traits and relationship
        if relationship and relationship.relationship_type == "romantic":
            return InteractionType.ROMANTIC
        elif traits1.teacher > 0.7 or traits2.teacher > 0.7:
            return InteractionType.TEACHING
        elif traits1.leader > 0.7 or traits2.leader > 0.7:
            return InteractionType.COLLABORATION
        elif traits1.aggression > 0.6 or traits2.aggression > 0.6:
            return InteractionType.COMPETITIVE
        else:
            return InteractionType.SOCIAL

    def _generate_interaction_content(
        self, agent1: Any, agent2: Any, interaction_type: InteractionType
    ) -> str:
        """Generate content for an interaction."""
        # This would typically use AI or templates to generate realistic content
        # For now, return a simple description
        return (
            f"{interaction_type.value} interaction between {agent1.id} and {agent2.id}"
        )

    def _calculate_interaction_outcome(
        self, agent1: Any, agent2: Any, interaction_type: InteractionType
    ) -> InteractionOutcome:
        """Calculate the outcome of an interaction."""
        # Get trait components
        traits1 = agent1.get_component(TraitComponent)
        traits2 = agent2.get_component(TraitComponent)

        if not traits1 or not traits2:
            return InteractionOutcome.NEUTRAL

        # Calculate compatibility
        compatibility = self._calculate_trait_compatibility(traits1, traits2)

        # Factor in interaction type
        type_modifier = 1.0
        if interaction_type == InteractionType.TEACHING:
            type_modifier = (
                1.2 if traits1.teacher > 0.5 or traits2.teacher > 0.5 else 0.8
            )
        elif interaction_type == InteractionType.COLLABORATION:
            type_modifier = 1.1 if traits1.leader > 0.5 or traits2.leader > 0.5 else 0.9

        # Calculate success probability
        success_probability = compatibility * type_modifier

        # Determine outcome
        if success_probability > 0.7:
            return InteractionOutcome.SUCCESS
        elif success_probability > 0.4:
            return InteractionOutcome.PARTIAL_SUCCESS
        elif success_probability > 0.2:
            return InteractionOutcome.NEUTRAL
        else:
            return InteractionOutcome.FAILURE

    def _calculate_trait_compatibility(
        self, traits1: TraitComponent, traits2: TraitComponent
    ) -> float:
        """Calculate compatibility between two agents based on traits."""
        # Calculate compatibility for key traits
        charisma_compat = 1.0 - abs(traits1.charisma - traits2.charisma)
        intelligence_compat = 1.0 - abs(traits1.intelligence - traits2.intelligence)
        social_compat = 1.0 - abs(traits1.social_energy - traits2.social_energy)

        # Weight the traits
        total_compatibility = (
            charisma_compat * 0.3 + intelligence_compat * 0.3 + social_compat * 0.4
        )

        return total_compatibility

    def _calculate_relationship_impact(
        self, agent1: Any, agent2: Any, outcome: InteractionOutcome
    ) -> float:
        """Calculate the impact of an interaction on the relationship."""
        base_impact = 0.0

        if outcome == InteractionOutcome.SUCCESS:
            base_impact = 0.1
        elif outcome == InteractionOutcome.PARTIAL_SUCCESS:
            base_impact = 0.05
        elif outcome == InteractionOutcome.NEUTRAL:
            base_impact = 0.0
        else:  # FAILURE
            base_impact = -0.1

        # Factor in existing relationship
        interaction_comp1 = agent1.get_component(InteractionComponent)
        relationship = (
            interaction_comp1.get_relationship(agent2.id) if interaction_comp1 else None
        )

        if relationship:
            # Amplify impact for close relationships
            if relationship.is_close_relationship():
                base_impact *= 1.5

        return base_impact

    def _update_relationships_from_interaction(
        self, agent1: Any, agent2: Any, interaction: Interaction
    ) -> None:
        """Update relationships based on interaction outcome."""
        interaction_comp1 = agent1.get_component(InteractionComponent)
        interaction_comp2 = agent2.get_component(InteractionComponent)

        if not interaction_comp1 or not interaction_comp2:
            return

        # Update relationship for both agents
        relationship1 = interaction_comp1.get_relationship(agent2.id)
        relationship2 = interaction_comp2.get_relationship(agent1.id)

        if relationship1:
            relationship1.update_from_interaction(interaction)
        if relationship2:
            relationship2.update_from_interaction(interaction)

    def _update_social_energy_recovery(self, delta_time: float) -> None:
        """Update social energy recovery for all agents."""
        entities = self.get_entities_with_components(InteractionComponent)

        for entity in entities:
            interaction_comp = entity.get_component(InteractionComponent)
            if interaction_comp:
                interaction_comp.recover_social_energy(delta_time)

    def get_system_stats(self) -> Dict[str, Any]:
        """Get comprehensive system statistics."""
        total_agents = len(self.get_entities_with_components(InteractionComponent))

        return {
            "total_agents_with_interactions": total_agents,
            "total_interactions_processed": self.total_interactions_processed,
            "total_relationships_formed": self.total_relationships_formed,
            "interaction_range": self.interaction_range,
            "interaction_probability_base": self.interaction_probability_base,
            "processing_interval": self.processing_interval,
        }

    def force_interaction(
        self,
        agent1_id: str,
        agent2_id: str,
        interaction_type: InteractionType,
        content: str = "",
    ) -> bool:
        """
        Force an interaction between two agents.

        Args:
            agent1_id: ID of first agent
            agent2_id: ID of second agent
            interaction_type: Type of interaction
            content: Interaction content

        Returns:
            True if interaction was successful
        """
        agent1 = self.world.get_entity(agent1_id)
        agent2 = self.world.get_entity(agent2_id)

        if not agent1 or not agent2:
            return False

        # Check if both agents have interaction components
        interaction_comp1 = agent1.get_component(InteractionComponent)
        interaction_comp2 = agent2.get_component(InteractionComponent)

        if not interaction_comp1 or not interaction_comp2:
            return False

        # Check social energy
        if not interaction_comp1.can_interact() or not interaction_comp2.can_interact():
            return False

        # Initiate interaction
        self._initiate_interaction(agent1, agent2)
        return True

    def get_agent_interactions(
        self, agent_id: str, limit: int = 10
    ) -> List[Interaction]:
        """Get recent interactions for a specific agent."""
        entity = self.world.get_entity(agent_id)
        if not entity:
            return []

        interaction_comp = entity.get_component(InteractionComponent)
        if not interaction_comp:
            return []

        return interaction_comp.get_recent_interactions(limit)

    def get_agent_relationships(self, agent_id: str) -> Dict[str, Any]:
        """Get relationships for a specific agent."""
        entity = self.world.get_entity(agent_id)
        if not entity:
            return {}

        interaction_comp = entity.get_component(InteractionComponent)
        if not interaction_comp:
            return {}

        return interaction_comp.get_relationship_stats()
