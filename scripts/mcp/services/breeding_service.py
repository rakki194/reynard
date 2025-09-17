#!/usr/bin/env python3
"""
Breeding Service
===============

Modular service for handling breeding operations across the ECS system.
Provides reusable breeding logic and utilities.

Follows the 140-line axiom and modular architecture principles.
"""

import logging
import random
import time
from typing import Any, Dict

from reynard_ecs_world import (
    AgentComponent,
    Entity,
    LifecycleComponent,
    LineageComponent,
    ReproductionComponent,
    TraitComponent,
)

logger = logging.getLogger(__name__)


class BreedingService:
    """Service for handling breeding operations."""

    def __init__(self, world):
        self.world = world
        self.breeding_history: list[Dict] = []

    def find_compatible_mates(
        self, agent_id: str, max_results: int = 5
    ) -> list[dict[str, Any]]:
        """Find compatible mates for an agent."""
        agent_entity = self.world.get_entity(agent_id)
        if not agent_entity:
            return []

        # Get all mature agents
        mature_agents = self._get_mature_agents()
        compatible_mates = []

        for mate in mature_agents:
            if mate.id == agent_id:
                continue

            compatibility = self._calculate_compatibility(agent_entity, mate)
            if compatibility >= 0.6:  # Minimum compatibility threshold
                mate_info = {
                    "id": mate.id,
                    "name": mate.get_component(AgentComponent).name,
                    "spirit": mate.get_component(AgentComponent).spirit,
                    "compatibility": compatibility,
                    "age": mate.get_component(LifecycleComponent).age,
                }
                compatible_mates.append(mate_info)

        # Sort by compatibility
        compatible_mates.sort(key=lambda x: x["compatibility"], reverse=True)
        return compatible_mates[:max_results]

    def analyze_genetic_compatibility(
        self, agent1_id: str, agent2_id: str
    ) -> dict[str, Any]:
        """Analyze genetic compatibility between two agents."""
        agent1 = self.world.get_entity(agent1_id)
        agent2 = self.world.get_entity(agent2_id)

        if not agent1 or not agent2:
            return {"error": "One or both agents not found"}

        compatibility = self._calculate_compatibility(agent1, agent2)

        # Determine compatibility level
        if compatibility >= 0.8:
            level = "excellent"
            recommendation = (
                "Excellent genetic compatibility - highly recommended for breeding"
            )
        elif compatibility >= 0.6:
            level = "good"
            recommendation = "Good genetic compatibility - suitable for breeding"
        elif compatibility >= 0.4:
            level = "moderate"
            recommendation = (
                "Moderate genetic compatibility - breeding possible but not ideal"
            )
        else:
            level = "poor"
            recommendation = "Poor genetic compatibility - not recommended for breeding"

        return {
            "compatibility_score": compatibility,
            "compatibility_level": level,
            "recommendation": recommendation,
            "agent1": {
                "id": agent1_id,
                "name": agent1.get_component(AgentComponent).name,
                "spirit": agent1.get_component(AgentComponent).spirit,
            },
            "agent2": {
                "id": agent2_id,
                "name": agent2.get_component(AgentComponent).name,
                "spirit": agent2.get_component(AgentComponent).spirit,
            },
        }

    def create_offspring(
        self, parent1_id: str, parent2_id: str, offspring_id: str
    ) -> dict[str, Any]:
        """Create offspring from two parents."""
        try:
            # Check if parents exist and are compatible
            agent1 = self.world.get_entity(parent1_id)
            agent2 = self.world.get_entity(parent2_id)

            if not agent1 or not agent2:
                return {"success": False, "error": "One or both parents not found"}

            # Check compatibility
            compatibility = self._calculate_compatibility(agent1, agent2)
            if compatibility < 0.4:
                return {
                    "success": False,
                    "error": "Parents are not compatible for breeding",
                }

            # Create offspring using world method
            offspring = self.world.create_offspring(
                parent1_id, parent2_id, offspring_id
            )

            if offspring:
                # Record breeding event
                breeding_event = {
                    "timestamp": time.time(),
                    "parent1_id": parent1_id,
                    "parent2_id": parent2_id,
                    "offspring_id": offspring_id,
                    "compatibility": compatibility,
                    "success": True,
                }
                self.breeding_history.append(breeding_event)

                # Keep only last 100 events
                if len(self.breeding_history) > 100:
                    self.breeding_history = self.breeding_history[-100:]

                return {
                    "success": True,
                    "offspring_id": offspring_id,
                    "compatibility": compatibility,
                    "message": f"Successfully created offspring {offspring_id}",
                }
            else:
                return {"success": False, "error": "Failed to create offspring"}

        except Exception as e:
            logger.error(f"Error creating offspring: {e}")
            return {"success": False, "error": str(e)}

    def get_breeding_statistics(self) -> dict[str, Any]:
        """Get breeding statistics."""
        recent_events = [
            e for e in self.breeding_history if time.time() - e["timestamp"] < 3600
        ]

        return {
            "total_breeding_events": len(self.breeding_history),
            "recent_breeding_events": len(recent_events),
            "successful_breedings": len(
                [e for e in self.breeding_history if e["success"]]
            ),
            "average_compatibility": (
                sum(e["compatibility"] for e in self.breeding_history)
                / len(self.breeding_history)
                if self.breeding_history
                else 0
            ),
            "mature_agents": len(self._get_mature_agents()),
            "breeding_history": self.breeding_history[-10:],  # Last 10 events
        }

    def _get_mature_agents(self) -> list[Entity]:
        """Get all mature agents."""
        entities = self.world.get_entities_with_components(
            AgentComponent, LifecycleComponent, ReproductionComponent
        )

        mature_agents = []
        for entity in entities:
            lifecycle = entity.get_component(LifecycleComponent)
            if lifecycle and lifecycle.age >= lifecycle.maturity_age:
                mature_agents.append(entity)

        return mature_agents

    def _calculate_compatibility(self, agent1: Entity, agent2: Entity) -> float:
        """Calculate compatibility between two agents."""
        traits1 = agent1.get_component(TraitComponent)
        traits2 = agent2.get_component(TraitComponent)

        if not traits1 or not traits2:
            return 0.0

        # Check lineage (no inbreeding)
        lineage1 = agent1.get_component(LineageComponent)
        lineage2 = agent2.get_component(LineageComponent)

        if lineage1 and lineage2:
            if (
                agent2.id in lineage1.ancestors
                or agent2.id in lineage1.descendants
                or agent1.id in lineage2.ancestors
                or agent1.id in lineage2.descendants
            ):
                return 0.0  # Inbreeding = no compatibility

        # Calculate compatibility based on traits
        spirit_compatibility = (
            0.8 if traits1.traits.spirit == traits2.traits.spirit else 0.5
        )
        style_compatibility = (
            0.7 if traits1.traits.style == traits2.traits.style else 0.4
        )

        # Combine compatibility factors
        total_compatibility = spirit_compatibility * 0.6 + style_compatibility * 0.4

        # Add some randomness
        total_compatibility += random.uniform(-0.1, 0.1)

        return max(0.0, min(1.0, total_compatibility))
