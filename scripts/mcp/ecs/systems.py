#!/usr/bin/env python3
"""
ECS Systems
============

System implementations for the Reynard agent system.
Each system handles specific behaviors and interactions.

Follows the 140-line axiom and modular architecture principles.
"""

import logging
import random
from typing import List

from .components import (
    AgentComponent,
    BehaviorComponent,
    LifecycleComponent,
    LineageComponent,
    ReproductionComponent,
    TraitComponent,
)
from .core import Entity, System

logger = logging.getLogger(__name__)


class LifecycleSystem(System):
    """Manages agent aging and lifecycle progression."""

    def update(self, delta_time: float) -> None:
        """Update agent lifecycles."""
        entities = self.get_entities_with_components(LifecycleComponent, AgentComponent)

        for entity in entities:
            lifecycle = entity.get_component(LifecycleComponent)
            agent = entity.get_component(AgentComponent)

            if not lifecycle or not agent:
                continue

            # Update age
            lifecycle.age += delta_time

            # Update life stage
            old_stage = lifecycle.life_stage
            if lifecycle.age < 5.0:
                lifecycle.life_stage = "infant"
            elif lifecycle.age < 18.0:
                lifecycle.life_stage = "juvenile"
            elif lifecycle.age < 80.0:
                lifecycle.life_stage = "adult"
            else:
                lifecycle.life_stage = "elder"

            if old_stage != lifecycle.life_stage:
                logger.info(
                    f"Agent {agent.name} transitioned to {lifecycle.life_stage}"
                )

            # Check for death
            if lifecycle.age >= lifecycle.max_age:
                self._handle_death(entity)

    def _handle_death(self, entity: Entity) -> None:
        """Handle agent death."""
        agent = entity.get_component(AgentComponent)
        if agent:
            logger.info(f"Agent {agent.name} has died of old age")
        entity.destroy()


class ReproductionSystem(System):
    """Manages agent reproduction and offspring creation."""

    def __init__(self, world):
        super().__init__(world)
        self.reproduction_chance = 0.01  # 1% chance per update cycle

    def update(self, delta_time: float) -> None:
        """Update reproduction system."""
        # Get all potential parents
        entities = self.get_entities_with_components(
            AgentComponent,
            TraitComponent,
            LineageComponent,
            LifecycleComponent,
            ReproductionComponent,
        )

        # Filter for mature agents
        mature_entities = [
            e
            for e in entities
            if e.get_component(LifecycleComponent).age
            >= e.get_component(LifecycleComponent).maturity_age
        ]

        # Check for reproduction opportunities
        for entity in mature_entities:
            if self._should_attempt_reproduction(entity):
                self._attempt_reproduction(entity, mature_entities)

    def _should_attempt_reproduction(self, entity: Entity) -> bool:
        """Check if agent should attempt reproduction."""
        reproduction = entity.get_component(ReproductionComponent)
        lifecycle = entity.get_component(LifecycleComponent)

        if not reproduction or not lifecycle:
            return False

        # Must be mature and not on cooldown
        if (
            lifecycle.age < lifecycle.maturity_age
            or reproduction.reproduction_cooldown > 0
            or reproduction.offspring_count >= reproduction.max_offspring
        ):
            return False

        # Random chance based on activity level
        behavior = entity.get_component(BehaviorComponent)
        if behavior:
            activity_factor = behavior.activity_level
        else:
            activity_factor = 0.5

        return random.random() < (self.reproduction_chance * activity_factor)

    def _attempt_reproduction(
        self, entity: Entity, potential_mates: List[Entity]
    ) -> None:
        """Attempt to find a mate and reproduce."""
        # Find compatible mates
        compatible_mates = self._find_compatible_mates(entity, potential_mates)

        if compatible_mates:
            mate = random.choice(compatible_mates)
            self._create_offspring(entity, mate)

    def _find_compatible_mates(
        self, entity: Entity, potential_mates: List[Entity]
    ) -> List[Entity]:
        """Find compatible mates for reproduction."""
        compatible = []
        entity_traits = entity.get_component(TraitComponent)
        entity_lineage = entity.get_component(LineageComponent)

        if not entity_traits or not entity_lineage:
            return compatible

        for mate in potential_mates:
            if mate.id == entity.id:
                continue

            # Check if not related
            if (
                mate.id in entity_lineage.ancestors
                or mate.id in entity_lineage.descendants
            ):
                continue

            # Check compatibility
            compatibility = self._calculate_compatibility(entity, mate)
            reproduction = entity.get_component(ReproductionComponent)

            if reproduction and compatibility >= reproduction.compatibility_threshold:
                compatible.append(mate)

        return compatible

    def _calculate_compatibility(self, entity1: Entity, entity2: Entity) -> float:
        """Calculate compatibility between two agents."""
        traits1_comp = entity1.get_component(TraitComponent)
        traits2_comp = entity2.get_component(TraitComponent)

        if not traits1_comp or not traits2_comp:
            return 0.0

        traits1 = traits1_comp.personality
        traits2 = traits2_comp.personality

        # Simple compatibility based on trait similarity
        similarity = 0.0
        for trait in traits1:
            if trait in traits2:
                similarity += 1.0 - abs(traits1[trait] - traits2[trait])

        return similarity / len(traits1) if traits1 else 0.0

    def _create_offspring(self, parent1: Entity, parent2: Entity) -> None:
        """Create offspring from two parents."""
        # Generate offspring ID
        offspring_id = f"offspring_{len(self.world.entities) + 1}"

        # Create offspring entity
        offspring = self.world.create_entity(offspring_id)

        # Add components with inherited traits
        self._setup_offspring_components(offspring, parent1, parent2)

        # Update parent reproduction cooldowns
        parent1_repro = parent1.get_component(ReproductionComponent)
        parent2_repro = parent2.get_component(ReproductionComponent)

        if parent1_repro:
            parent1_repro.reproduction_cooldown = parent1_repro.max_cooldown
            parent1_repro.offspring_count += 1

        if parent2_repro:
            parent2_repro.reproduction_cooldown = parent2_repro.max_cooldown
            parent2_repro.offspring_count += 1

        logger.info(
            f"Created offspring {offspring_id} from {parent1.id} and {parent2.id}"
        )

    def _setup_offspring_components(
        self, offspring: Entity, parent1: Entity, parent2: Entity
    ) -> None:
        """Setup offspring components with inherited traits."""
        # This would integrate with the existing inheritance system
        # For now, create basic components
        agent1 = parent1.get_component(AgentComponent)
        agent2 = parent2.get_component(AgentComponent)

        if agent1 and agent2:
            # Create basic agent component
            offspring_name = f"{agent1.name}-{agent2.name}-Spawn"
            offspring.add_component(
                AgentComponent(offspring_name, agent1.spirit, agent1.style)
            )

        # Add other components (would integrate with existing trait system)
        # This is a simplified version - the full implementation would use
        # the existing AgentTraits.crossover_traits() method
