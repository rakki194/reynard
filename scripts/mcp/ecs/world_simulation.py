#!/usr/bin/env python3
"""
ECS World Simulation
====================

Comprehensive world simulation system with time acceleration, trait inheritance,
and agent persona management. Integrates with existing Reynard systems.

Follows the 140-line axiom and modular architecture principles.
"""

import json
import logging
import time
from pathlib import Path
from typing import Any, Dict

from .components import (
    AgentComponent,
    BehaviorComponent,
    EvolutionComponent,
    LifecycleComponent,
    LineageComponent,
    MemoryComponent,
    ReproductionComponent,
    StatusComponent,
    TraitComponent,
)
from .core import ECSWorld, Entity
from .event_system import ECSEvent, ECSEventSystem, ECSEventType
from .systems import LifecycleSystem, ReproductionSystem
from .traits import AgentTraits

logger = logging.getLogger(__name__)


class WorldSimulation:
    """Comprehensive world simulation with time acceleration and trait inheritance."""

    def __init__(self, data_dir: Path | None = None):
        self.data_dir = data_dir or Path(__file__).parent.parent
        self.world = ECSWorld()
        self.simulation_time = 0.0
        self.real_time_start = time.time()
        self.time_acceleration = 10.0  # 10x faster than real time
        self.last_update = time.time()

        # Agent persona and LoRA system
        self.agent_personas: Dict[str, Dict[str, Any]] = {}
        self.lora_configs: Dict[str, Dict[str, Any]] = {}

        # Event system
        self.event_system = ECSEventSystem(self.data_dir)

        # Initialize systems
        self._setup_systems()

        # Load existing data
        self._load_simulation_data()

    def _setup_systems(self) -> None:
        """Setup ECS systems for world simulation."""
        self.world.add_system(LifecycleSystem(self.world))
        self.world.add_system(ReproductionSystem(self.world))

    def _load_simulation_data(self) -> None:
        """Load existing simulation data from persistent storage."""
        # Load agent personas
        personas_file = self.data_dir / "agent-personas.json"
        if personas_file.exists():
            try:
                with personas_file.open(encoding="utf-8") as f:
                    self.agent_personas = json.load(f)
            except Exception as e:
                logger.warning(f"Could not load agent personas: {e}")

        # Load LoRA configs
        lora_file = self.data_dir / "lora-configs.json"
        if lora_file.exists():
            try:
                with lora_file.open(encoding="utf-8") as f:
                    self.lora_configs = json.load(f)
            except Exception as e:
                logger.warning(f"Could not load LoRA configs: {e}")

    def _save_simulation_data(self) -> None:
        """Save simulation data to persistent storage."""
        # Save agent personas
        personas_file = self.data_dir / "agent-personas.json"
        try:
            with personas_file.open("w", encoding="utf-8") as f:
                json.dump(self.agent_personas, f, indent=2)
        except Exception as e:
            logger.warning(f"Could not save agent personas: {e}")

        # Save LoRA configs
        lora_file = self.data_dir / "lora-configs.json"
        try:
            with lora_file.open("w", encoding="utf-8") as f:
                json.dump(self.lora_configs, f, indent=2)
        except Exception as e:
            logger.warning(f"Could not save LoRA configs: {e}")

    def create_agent_with_inheritance(
        self,
        agent_id: str,
        spirit: str | None = None,
        style: str | None = None,
        name: str | None = None,
        parent1_id: str | None = None,
        parent2_id: str | None = None,
    ) -> Entity:
        """Create agent with comprehensive trait inheritance and persona system."""
        entity = self.world.create_entity(agent_id)

        # Set defaults
        spirit = spirit or "fox"
        style = style or "foundation"

        # Always generate a proper name - never use generic names
        if not name or name.startswith("Agent-"):
            # Import the naming system
            try:
                import sys
                from pathlib import Path

                sys.path.append(
                    str(Path(__file__).parent.parent.parent / "utils" / "agent-naming")
                )
                from robot_name_generator import ReynardRobotNamer

                namer = ReynardRobotNamer()
                names = namer.generate_batch(1, spirit, style)
                name = names[0] if names else "Unknown-Unit-1"
            except Exception as e:
                logger.warning(f"Failed to generate name: {e}")
                name = "Unknown-Unit-1"

        # Create comprehensive traits
        if parent1_id and parent2_id:
            # Create offspring with inheritance
            agent_traits = self._create_offspring_traits(
                parent1_id, parent2_id, spirit, style
            )
        else:
            # Create new agent with random traits
            agent_traits = AgentTraits(spirit=spirit, style=style)

        # Add all components
        entity.add_component(AgentComponent(name, spirit, style))
        entity.add_component(TraitComponent(agent_traits))
        entity.add_component(
            LineageComponent(
                [parent1_id, parent2_id] if parent1_id and parent2_id else []
            )
        )
        entity.add_component(LifecycleComponent())
        entity.add_component(ReproductionComponent())
        entity.add_component(BehaviorComponent())
        entity.add_component(StatusComponent())
        entity.add_component(MemoryComponent())
        entity.add_component(EvolutionComponent())

        # Create agent persona and LoRA config
        self._create_agent_persona(agent_id, agent_traits)
        self._create_lora_config(agent_id, agent_traits)

        logger.info(f"Created agent {agent_id} with comprehensive traits and persona")

        # Emit agent created event
        event = ECSEvent(
            event_type=ECSEventType.AGENT_CREATED,
            timestamp=time.time(),
            agent_id=agent_id,
            parent1_id=parent1_id,
            parent2_id=parent2_id,
            data={
                "spirit": spirit,
                "style": style,
                "name": name,
                "is_offspring": parent1_id is not None and parent2_id is not None,
            },
        )
        self.event_system.emit_event(event)

        return entity

    def _create_offspring_traits(
        self, parent1_id: str, parent2_id: str, spirit: str, style: str
    ) -> AgentTraits:
        """Create offspring traits with inheritance from parents."""
        parent1 = self.world.get_entity(parent1_id)
        parent2 = self.world.get_entity(parent2_id)

        if parent1 and parent2:
            parent1_traits = parent1.get_component(TraitComponent)
            parent2_traits = parent2.get_component(TraitComponent)

            if parent1_traits and parent2_traits:
                # Use existing inheritance system
                return AgentTraits.create_offspring(
                    parent1_traits.agent_traits, parent2_traits.agent_traits
                )

        # Fallback to random traits
        return AgentTraits(spirit=spirit, style=style)

    def _create_agent_persona(self, agent_id: str, agent_traits: AgentTraits) -> None:
        """Create comprehensive agent persona from traits."""
        persona = {
            "agent_id": agent_id,
            "spirit": agent_traits.spirit,
            "style": agent_traits.style,
            "dominant_traits": agent_traits._get_dominant_traits(),
            "personality_summary": self._generate_personality_summary(agent_traits),
            "behavioral_patterns": self._generate_behavioral_patterns(agent_traits),
            "communication_style": self._generate_communication_style(agent_traits),
            "specializations": agent_traits.abilities,
            "created_at": time.time(),
            "last_updated": time.time(),
        }

        self.agent_personas[agent_id] = persona
        self._save_simulation_data()

    def _create_lora_config(self, agent_id: str, agent_traits: AgentTraits) -> None:
        """Create LoRA configuration for agent persona."""
        lora_config = {
            "agent_id": agent_id,
            "base_model": "reynard-agent-base",
            "lora_rank": 16,
            "lora_alpha": 32,
            "target_modules": ["q_proj", "v_proj", "k_proj", "o_proj"],
            "personality_weights": {
                trait: float(value) for trait, value in agent_traits.personality.items()
            },
            "physical_weights": {
                trait: float(value) for trait, value in agent_traits.physical.items()
            },
            "ability_weights": dict.fromkeys(agent_traits.abilities, 1.0),
            "created_at": time.time(),
            "last_updated": time.time(),
        }

        self.lora_configs[agent_id] = lora_config
        self._save_simulation_data()

    def _generate_personality_summary(self, agent_traits: AgentTraits) -> str:
        """Generate personality summary from traits."""
        dominant = agent_traits._get_dominant_traits()
        spirit = agent_traits.spirit

        summaries = {
            "fox": "Strategic and cunning, with a focus on elegant solutions and clever problem-solving.",
            "otter": "Playful and thorough, bringing joy to quality assurance and comprehensive testing.",
            "wolf": "Relentless and protective, with strong pack instincts and adversarial thinking.",
        }

        base_summary = summaries.get(
            spirit, "A unique individual with distinct characteristics."
        )

        if dominant:
            trait_descriptions = {
                "dominance": "natural leadership qualities",
                "intelligence": "exceptional problem-solving abilities",
                "creativity": "innovative thinking and artistic flair",
                "empathy": "deep understanding of others",
                "cunning": "strategic thinking and cleverness",
            }

            dominant_desc = trait_descriptions.get(
                dominant[0], "unique personality traits"
            )
            return f"{base_summary} Shows {dominant_desc}."

        return base_summary

    def _generate_behavioral_patterns(
        self, agent_traits: AgentTraits
    ) -> Dict[str, Any]:
        """Generate behavioral patterns from traits."""
        return {
            "activity_level": agent_traits.personality.get("dominance", 0.5),
            "social_tendency": agent_traits.personality.get("empathy", 0.5),
            "learning_rate": agent_traits.personality.get("intelligence", 0.5),
            "creativity_index": agent_traits.personality.get("creativity", 0.5),
            "aggression_level": agent_traits.personality.get("aggression", 0.5),
            "cooperation_tendency": agent_traits.personality.get("cooperation", 0.5),
        }

    def _generate_communication_style(
        self, agent_traits: AgentTraits
    ) -> Dict[str, Any]:
        """Generate communication style from traits."""
        spirit = agent_traits.spirit
        charisma = agent_traits.personality.get("charisma", 0.5)

        styles = {
            "fox": {
                "tone": "strategic and cunning",
                "approach": "calculated and precise",
                "emphasis": "elegant solutions and clever insights",
            },
            "otter": {
                "tone": "playful and enthusiastic",
                "approach": "thorough and joyful",
                "emphasis": "quality and comprehensive coverage",
            },
            "wolf": {
                "tone": "direct and determined",
                "approach": "relentless and protective",
                "emphasis": "security and pack coordination",
            },
        }

        base_style = styles.get(
            spirit,
            {
                "tone": "professional and clear",
                "approach": "methodical and thoughtful",
                "emphasis": "effective communication",
            },
        )

        return {
            **base_style,
            "charisma_level": charisma,
            "formality": 0.7 if charisma > 0.7 else 0.5,
            "directness": agent_traits.personality.get("dominance", 0.5),
        }

    def update_simulation(self, delta_time: float | None = None) -> None:
        """Update world simulation with time acceleration."""
        current_time = time.time()

        if delta_time is None:
            # Calculate delta time based on real time and acceleration
            real_delta = current_time - self.last_update
            delta_time = real_delta * self.time_acceleration

        self.simulation_time += delta_time
        self.last_update = current_time

        # Update ECS world
        self.world.update(delta_time)
        self.world.cleanup_destroyed_entities()

        # Update agent personas and LoRA configs
        self._update_agent_evolution(delta_time)

        # Emit simulation updated event
        event = ECSEvent(
            event_type=ECSEventType.SIMULATION_UPDATED,
            timestamp=time.time(),
            data={
                "delta_time": delta_time,
                "simulation_time": self.simulation_time,
                "time_acceleration": self.time_acceleration,
            },
        )
        self.event_system.emit_event(event)

        logger.debug(
            f"Simulation updated: time={self.simulation_time:.2f}, delta={delta_time:.2f}"
        )

    def _update_agent_evolution(self, delta_time: float) -> None:
        """Update agent evolution and persona development."""
        for entity in self.world.get_entities_with_components(
            AgentComponent, EvolutionComponent
        ):
            evolution = entity.get_component(EvolutionComponent)
            agent = entity.get_component(AgentComponent)

            if evolution and agent:
                # Award evolution points based on activity
                evolution.evolution_points += int(delta_time * 0.1)

                # Update persona if significant evolution occurred
                if evolution.evolution_points > 10:
                    self._update_agent_persona(agent.name, evolution)
                    evolution.evolution_points = 0

    def _update_agent_persona(
        self, agent_id: str, evolution: EvolutionComponent
    ) -> None:
        """Update agent persona based on evolution."""
        if agent_id in self.agent_personas:
            self.agent_personas[agent_id]["last_updated"] = time.time()
            self.agent_personas[agent_id]["evolution_points"] = (
                evolution.evolution_points
            )
            self.agent_personas[agent_id]["adaptations"] = evolution.adaptations.copy()
            self._save_simulation_data()

    def get_agent_persona(self, agent_id: str) -> Dict[str, Any] | None:
        """Get comprehensive agent persona."""
        return self.agent_personas.get(agent_id)

    def get_lora_config(self, agent_id: str) -> Dict[str, Any] | None:
        """Get LoRA configuration for agent."""
        return self.lora_configs.get(agent_id)

    def get_simulation_status(self) -> Dict[str, Any]:
        """Get comprehensive simulation status."""
        # Update simulation time before returning status
        self.update_simulation()

        agents = self.world.get_entities_with_components(AgentComponent)
        mature_agents = []
        for e in agents:
            lifecycle = e.get_component(LifecycleComponent)
            if lifecycle and lifecycle.age >= lifecycle.maturity_age:
                mature_agents.append(e)

        return {
            "simulation_time": self.simulation_time,
            "time_acceleration": self.time_acceleration,
            "total_agents": len(agents),
            "mature_agents": len(mature_agents),
            "agent_personas": len(self.agent_personas),
            "lora_configs": len(self.lora_configs),
            "real_time_elapsed": time.time() - self.real_time_start,
        }

    def accelerate_time(self, factor: float) -> None:
        """Adjust time acceleration factor."""
        old_factor = self.time_acceleration
        self.time_acceleration = max(0.1, min(100.0, factor))
        logger.info(f"Time acceleration set to {self.time_acceleration}x")

        # Emit time acceleration event
        event = ECSEvent(
            event_type=ECSEventType.TIME_ACCELERATED,
            timestamp=time.time(),
            data={
                "old_factor": old_factor,
                "new_factor": self.time_acceleration,
                "change": self.time_acceleration - old_factor,
            },
        )
        self.event_system.emit_event(event)

    def nudge_time(self, amount: float = 0.1) -> None:
        """Gently nudge simulation time forward (for MCP actions)."""
        self.update_simulation(amount)
        logger.debug(f"Time nudged forward by {amount}")

    def analyze_genetic_compatibility(
        self, agent1_id: str, agent2_id: str
    ) -> Dict[str, Any]:
        """Analyze genetic compatibility between two agents."""
        entity1 = self.world.get_entity(agent1_id)
        entity2 = self.world.get_entity(agent2_id)

        if not entity1 or not entity2:
            return {
                "compatibility": 0.0,
                "analysis": "One or both agents not found",
                "recommended": False,
            }

        traits1 = entity1.get_component(TraitComponent)
        traits2 = entity2.get_component(TraitComponent)

        if not traits1 or not traits2:
            return {
                "compatibility": 0.0,
                "analysis": "Missing trait data",
                "recommended": False,
            }

        # Calculate compatibility based on trait similarity
        compatibility = self._calculate_trait_compatibility(traits1, traits2)

        # Generate analysis
        if compatibility >= 0.8:
            analysis = (
                "Excellent genetic compatibility - highly recommended for breeding"
            )
            recommended = True
        elif compatibility >= 0.6:
            analysis = "Good genetic compatibility - suitable for breeding"
            recommended = True
        elif compatibility >= 0.4:
            analysis = (
                "Moderate genetic compatibility - breeding possible but not ideal"
            )
            recommended = False
        else:
            analysis = "Poor genetic compatibility - not recommended for breeding"
            recommended = False

        return {
            "compatibility": compatibility,
            "analysis": analysis,
            "recommended": recommended,
        }

    def find_compatible_mates(
        self, agent_id: str, max_results: int = 5
    ) -> list[Dict[str, Any]]:
        """Find compatible mates for an agent."""
        entity = self.world.get_entity(agent_id)
        if not entity:
            return []

        agent_traits = entity.get_component(TraitComponent)
        if not agent_traits:
            return []

        # Get all other agents
        all_entities = self.world.get_entities_with_components(
            AgentComponent, TraitComponent
        )
        compatible_mates = []

        for other_entity in all_entities:
            if other_entity.id == agent_id:
                continue

            other_traits = other_entity.get_component(TraitComponent)
            if not other_traits:
                continue

            compatibility = self._calculate_trait_compatibility(
                agent_traits, other_traits
            )

            if compatibility >= 0.4:  # Minimum compatibility threshold
                agent_comp = other_entity.get_component(AgentComponent)
                compatible_mates.append(
                    {
                        "agent_id": other_entity.id,
                        "name": agent_comp.name if agent_comp else other_entity.id,
                        "compatibility": compatibility,
                    }
                )

        # Sort by compatibility and return top results
        compatible_mates.sort(key=lambda x: x["compatibility"], reverse=True)
        return compatible_mates[:max_results]

    def get_agent_lineage(self, agent_id: str, depth: int = 3) -> Dict[str, Any]:
        """Get agent lineage information."""
        entity = self.world.get_entity(agent_id)
        if not entity:
            return {}

        lineage_comp = entity.get_component(LineageComponent)
        if not lineage_comp:
            return {"generation": 1, "ancestors": [], "descendants": []}

        return {
            "generation": lineage_comp.generation,
            "ancestors": lineage_comp.ancestors[:depth],
            "descendants": lineage_comp.descendants[:depth],
        }

    def _calculate_trait_compatibility(
        self, traits1: TraitComponent, traits2: TraitComponent
    ) -> float:
        """Calculate compatibility score between two trait sets."""
        # Simple compatibility calculation based on trait similarity
        # In a real system, this would be more sophisticated

        # Get personality traits
        personality1 = traits1.personality
        personality2 = traits2.personality

        if not personality1 or not personality2:
            return 0.0

        # Calculate average similarity
        total_similarity = 0.0
        trait_count = 0

        for trait_name in personality1:
            if trait_name in personality2:
                # Calculate similarity (1.0 - absolute difference)
                diff = abs(personality1[trait_name] - personality2[trait_name])
                similarity = max(0.0, 1.0 - diff)
                total_similarity += similarity
                trait_count += 1

        return total_similarity / trait_count if trait_count > 0 else 0.0
