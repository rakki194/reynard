#!/usr/bin/env python3
"""
ECS Components
==============

Component definitions for the Reynard agent system.
Each component represents a specific aspect of agent data.

Follows the 140-line axiom and modular architecture principles.
"""

import logging
from typing import Any, Dict, List

from .core import Component
from .traits import AgentTraits

logger = logging.getLogger(__name__)


class AgentComponent(Component):
    """Core agent identity and basic information."""

    def __init__(self, name: str, spirit: str, style: str) -> None:
        super().__init__()
        self.name = name
        self.spirit = spirit
        self.style = style
        self.generation = 1
        self.active = True


class TraitComponent(Component):
    """Agent comprehensive traits including personality, physical, and abilities."""

    def __init__(self, agent_traits: AgentTraits | None = None) -> None:
        super().__init__()
        if agent_traits is None:
            # Generate random traits if none provided
            agent_traits = AgentTraits()

        self.agent_traits = agent_traits
        self.personality = agent_traits.personality
        self.physical = agent_traits.physical
        self.abilities = agent_traits.abilities
        self.unique_id = agent_traits.unique_id
        self.dominant_traits = agent_traits._get_dominant_traits()
        self.spirit = agent_traits.spirit
        self.mutation_count = 0


class LineageComponent(Component):
    """Agent family relationships and ancestry."""

    def __init__(self, parents: List[str] | None = None) -> None:
        super().__init__()
        self.parents = parents or []
        self.children: List[str] = []
        self.ancestors: List[str] = []
        self.descendants: List[str] = []
        self.generation = 1


class LifecycleComponent(Component):
    """Agent lifecycle and aging information."""

    def __init__(self, birth_time: float | None = None) -> None:
        super().__init__()
        self.birth_time = birth_time or self.created_at
        self.age = 0.0
        self.life_stage = "infant"  # infant, juvenile, adult, elder
        self.max_age = 100.0  # Maximum age in time units
        self.maturity_age = 18.0  # Age when can reproduce


class ReproductionComponent(Component):
    """Agent reproduction capabilities and preferences."""

    def __init__(self) -> None:
        super().__init__()
        self.can_reproduce = False
        self.reproduction_cooldown = 0.0
        self.max_cooldown = 30.0  # Time between reproductions
        self.offspring_count = 0
        self.max_offspring = 5
        self.preferred_mates: List[str] = []
        self.compatibility_threshold = 0.6


class BehaviorComponent(Component):
    """Agent behavioral patterns and preferences."""

    def __init__(self) -> None:
        super().__init__()
        self.activity_level = 0.5  # 0.0 = passive, 1.0 = very active
        self.social_tendency = 0.5  # 0.0 = solitary, 1.0 = very social
        self.learning_rate = 0.5  # How quickly agent adapts
        self.memory_capacity = 100  # Number of memories to retain


class StatusComponent(Component):
    """Agent current status and state."""

    def __init__(self) -> None:
        super().__init__()
        self.health = 1.0  # 0.0 = dead, 1.0 = perfect health
        self.energy = 1.0  # Current energy level
        self.happiness = 0.5  # Current happiness level
        self.stress = 0.0  # Current stress level
        self.last_activity = self.created_at


class MemoryComponent(Component):
    """Agent memory and experience storage."""

    def __init__(self) -> None:
        super().__init__()
        self.memories: List[Dict[str, Any]] = []
        self.important_events: List[Dict[str, Any]] = []
        self.learned_behaviors: Dict[str, float] = {}
        self.relationships: Dict[str, float] = {}  # agent_id -> relationship_strength


class EvolutionComponent(Component):
    """Agent evolution and adaptation tracking."""

    def __init__(self) -> None:
        super().__init__()
        self.evolution_points = 0.0
        self.adaptations: List[str] = []
        self.survival_instincts: Dict[str, float] = {}
        self.learned_skills: Dict[str, float] = {}
        self.generation_improvements: Dict[str, float] = {}
