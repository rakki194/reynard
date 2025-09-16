#!/usr/bin/env python3
"""
ECS Agent World
===============

Main world class that integrates ECS with the existing Reynard agent system.
Provides high-level interface for agent management and automation.

Follows the 140-line axiom and modular architecture principles.
"""

import logging

# Import existing systems
import sys
from pathlib import Path
from typing import Any, Dict, List

from .components import (
    AgentComponent,
    LifecycleComponent,
    LineageComponent,
    ReproductionComponent,
    TraitComponent,
)
from .core import ECSWorld, Entity
from .systems import LifecycleSystem, ReproductionSystem
from .traits import AgentTraits

sys.path.append(str(Path(__file__).parent.parent.parent / "utils" / "agent-naming"))

# Import the naming system
try:
    from robot_name_generator import ReynardRobotNamer
except ImportError:
    # Try importing from the utils/agent-naming directory
    import importlib.util

    spec = importlib.util.spec_from_file_location(
        "robot_name_generator",
        str(
            Path(__file__).parent.parent.parent
            / "utils"
            / "agent-naming"
            / "robot_name_generator.py"
        ),
    )
    if spec is None or spec.loader is None:
        raise ImportError("Could not load robot name generator module")

    robot_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(robot_module)
    ReynardRobotNamer = robot_module.ReynardRobotNamer

# Enhanced agent manager removed - using ECS system only

logger = logging.getLogger(__name__)


class AgentWorld(ECSWorld):
    """ECS world specialized for agent management."""

    def __init__(self, data_dir: Path | None = None):
        super().__init__()
        self.data_dir = data_dir or Path(__file__).parent.parent

        # Initialize ECS traits system
        self.traits_system = AgentTraits()

        # Initialize naming system
        self.namer = ReynardRobotNamer()

        # Add ECS systems
        self.add_system(LifecycleSystem(self))
        self.add_system(ReproductionSystem(self))

        # Load existing agents
        self._load_existing_agents()

    def _generate_proper_name(
        self, spirit: str | None = None, style: str | None = None
    ) -> str:
        """Generate a proper agent name using the naming system."""
        try:
            names = self.namer.generate_batch(1, spirit, style)
            return names[0] if names else "Unknown-Unit-1"
        except Exception as e:
            logger.warning(f"Failed to generate name: {e}")
            return "Unknown-Unit-1"

    def _validate_agent_id(self, agent_id: str) -> bool:
        """Validate that agent_id is not a generic placeholder."""
        generic_ids = {
            "current-session",
            "test-agent",
            "agent",
            "user",
            "default",
            "temp",
            "temporary",
            "placeholder",
            "unknown",
            "new-agent",
        }
        return agent_id.lower() not in generic_ids

    def create_agent(
        self,
        agent_id: str,
        spirit: str | None = None,
        style: str | None = None,
        name: str | None = None,
        is_offspring: bool = False,
    ) -> Entity:
        """Create a new agent entity with comprehensive traits."""
        # Create basic agent with comprehensive traits
        return self._create_basic_agent(agent_id, spirit, style, name)

    def create_offspring(
        self, parent1_id: str, parent2_id: str, offspring_id: str
    ) -> Entity:
        """Create offspring using existing inheritance system."""
        # Create offspring using ECS system
        return self._create_basic_offspring(parent1_id, parent2_id, offspring_id)

    def get_agent_entities(self) -> List[Entity]:
        """Get all agent entities."""
        return self.get_entities_with_components(AgentComponent)

    def get_mature_agents(self) -> List[Entity]:
        """Get agents that can reproduce."""
        entities = self.get_entities_with_components(
            AgentComponent, LifecycleComponent, ReproductionComponent
        )
        mature_agents = []
        for e in entities:
            lifecycle = e.get_component(LifecycleComponent)
            if lifecycle and lifecycle.age >= lifecycle.maturity_age:
                mature_agents.append(e)
        return mature_agents

    def find_compatible_mates(self, agent_id: str, max_results: int = 5) -> List[str]:
        """Find compatible mates for an agent."""
        entity = self.get_entity(agent_id)
        if not entity:
            return []

        return self._find_compatible_mates_ecs(entity, max_results)

    def analyze_genetic_compatibility(
        self, agent1_id: str, agent2_id: str
    ) -> Dict[str, Any]:
        """Analyze genetic compatibility between two agents."""
        return self._analyze_compatibility_ecs(agent1_id, agent2_id)

    def get_agent_lineage(self, agent_id: str, depth: int = 3) -> Dict[str, Any]:
        """Get agent family tree."""
        return self._get_lineage_ecs(agent_id, depth)

    def enable_automatic_reproduction(self, enabled: bool = True) -> None:
        """Enable or disable automatic reproduction."""
        reproduction_system = None
        for system in self.systems:
            if isinstance(system, ReproductionSystem):
                reproduction_system = system
                break

        if reproduction_system:
            reproduction_system.enabled = enabled
            logger.info(
                f"Automatic reproduction {'enabled' if enabled else 'disabled'}"
            )

    def _load_existing_agents(self) -> None:
        """Load existing agents from persistent storage."""
        # Load agents from persistent storage
        agents_file = self.data_dir / "agent-names.json"
        if agents_file.exists():
            import json

            try:
                with agents_file.open(encoding="utf-8") as f:
                    agents_data = json.load(f)

                for agent_id, agent_data in agents_data.items():
                    # Create basic agent entity from stored data
                    self._create_basic_agent(
                        agent_id, None, None, agent_data.get("name")
                    )

            except Exception as e:
                logger.warning(f"Could not load existing agents: {e}")

    def _create_entity_from_data(self, agent_data: Dict[str, Any]) -> Entity:
        """Create entity from existing agent data."""
        entity_id = agent_data.get("agent_id", "unknown")
        entity = self.create_entity(entity_id)

        # Add components based on data
        name = agent_data.get("name", "Unknown")
        spirit = agent_data.get("traits", {}).get("spirit", "fox")
        style = "foundation"  # Default style

        entity.add_component(AgentComponent(name, spirit, style))

        # Create comprehensive traits for existing agents
        agent_traits = AgentTraits(spirit=spirit, style=style)
        entity.add_component(TraitComponent(agent_traits))

        # Add lineage component
        lineage_data = agent_data.get("lineage", {})
        entity.add_component(LineageComponent(lineage_data.get("parents", [])))

        # Add lifecycle component
        entity.add_component(LifecycleComponent())

        # Add reproduction component
        entity.add_component(ReproductionComponent())

        return entity

    def _create_basic_agent(
        self, agent_id: str, spirit: str | None, style: str | None, name: str | None
    ) -> Entity:
        """Create basic agent without enhanced features."""
        entity = self.create_entity(agent_id)

        # Set defaults
        spirit = spirit or "fox"
        style = style or "foundation"

        # Always generate a proper name - never use generic names
        if (
            not name
            or name.startswith("Agent-")
            or not self._validate_agent_id(agent_id)
        ):
            name = self._generate_proper_name(spirit, style)

        # Create comprehensive traits
        agent_traits = AgentTraits(spirit=spirit, style=style)

        # Add components with comprehensive traits
        entity.add_component(AgentComponent(name, spirit, style))
        entity.add_component(TraitComponent(agent_traits))
        entity.add_component(LineageComponent())
        entity.add_component(LifecycleComponent())
        entity.add_component(ReproductionComponent())

        return entity

    def _create_basic_offspring(
        self, parent1_id: str, parent2_id: str, offspring_id: str
    ) -> Entity:
        """Create basic offspring without enhanced inheritance."""
        offspring = self.create_entity(offspring_id)

        # Get parent data
        parent1 = self.get_entity(parent1_id)
        parent2 = self.get_entity(parent2_id)

        if parent1 and parent2:
            agent1 = parent1.get_component(AgentComponent)
            agent2 = parent2.get_component(AgentComponent)

            # Generate proper name for offspring instead of generic combination
            offspring_name = self._generate_proper_name(agent1.spirit, agent1.style)
            offspring.add_component(
                AgentComponent(offspring_name, agent1.spirit, agent1.style)
            )

            # Create proper AgentTraits object for offspring
            offspring_traits = AgentTraits(spirit=agent1.spirit, style=agent1.style)
            offspring.add_component(TraitComponent(offspring_traits))
            offspring.add_component(LineageComponent([parent1_id, parent2_id]))
            offspring.add_component(LifecycleComponent())
            offspring.add_component(ReproductionComponent())

            # Update parent lineage components to include this offspring
            self._update_parent_lineage(parent1, offspring_id)
            self._update_parent_lineage(parent2, offspring_id)

        return offspring

    def _update_parent_lineage(self, parent_entity: Entity, offspring_id: str) -> None:
        """Update parent entity's lineage to include offspring."""
        lineage = parent_entity.get_component(LineageComponent)
        if lineage:
            if offspring_id not in lineage.children:
                lineage.children.append(offspring_id)
        else:
            # Create lineage component if it doesn't exist
            parent_entity.add_component(LineageComponent())
            lineage = parent_entity.get_component(LineageComponent)
            lineage.children.append(offspring_id)

    def _find_compatible_mates_ecs(self, entity: Entity, max_results: int) -> List[str]:
        """Find compatible mates using ECS approach."""
        # Simplified compatibility check
        compatible = []
        entity_traits = entity.get_component(TraitComponent)

        for other_entity in self.get_agent_entities():
            if other_entity.id == entity.id:
                continue

            other_traits = other_entity.get_component(TraitComponent)
            if other_traits and other_traits.spirit == entity_traits.spirit:
                compatible.append(other_entity.id)

        return compatible[:max_results]

    def _analyze_compatibility_ecs(
        self, agent1_id: str, agent2_id: str
    ) -> Dict[str, Any]:
        """Analyze compatibility using ECS approach."""
        entity1 = self.get_entity(agent1_id)
        entity2 = self.get_entity(agent2_id)

        if not entity1 or not entity2:
            return {"compatibility": 0.0, "analysis": "Agents not found"}

        traits1 = entity1.get_component(TraitComponent)
        traits2 = entity2.get_component(TraitComponent)

        if not traits1 or not traits2:
            return {"compatibility": 0.0, "analysis": "Traits not found"}

        # Simple compatibility based on spirit match
        compatibility = 1.0 if traits1.spirit == traits2.spirit else 0.5

        return {
            "compatibility": compatibility,
            "analysis": f"Spirit compatibility: {traits1.spirit} vs {traits2.spirit}",
            "recommended": compatibility > 0.7,
        }

    def _get_lineage_ecs(self, agent_id: str, depth: int) -> Dict[str, Any]:
        """Get lineage using ECS approach."""
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
