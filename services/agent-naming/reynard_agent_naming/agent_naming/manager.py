"""
Agent Name Manager
=================

Manages agent names and persistence for the MCP server with ECS integration.
Follows the 100-line axiom and modular architecture principles.
"""

import json
import logging
from pathlib import Path
from typing import Any

from .generator import ReynardRobotNamer
from .types import AnimalSpirit, NamingConfig, NamingStyle

logger = logging.getLogger(__name__)


class AgentNameManager:
    """Manages agent names and persistence with ECS integration."""

    def __init__(self, data_dir: str | None = None):
        """Initialize the agent name manager."""
        self.data_dir = Path(data_dir) if data_dir else Path(__file__).parent.parent
        self.agents_file = self.data_dir / "agent-names.json"
        self.namer = ReynardRobotNamer()

        # Initialize ECS world simulation
        self.ecs_available = False
        self.world_simulation = None

        try:
            from reynard_ecs_world import WorldSimulation  # type: ignore

            self.world_simulation = WorldSimulation(self.data_dir)
            self.ecs_available = True
        except ImportError as e:
            logger.warning("ECS world simulation not available: %s", e)
        except Exception as e:
            logger.warning("Failed to initialize ECS world simulation: %s", e)

        self._load_agents()

    def _load_agents(self) -> None:
        """Load agent names from persistent storage."""
        if self.agents_file.exists():
            try:
                with self.agents_file.open(encoding="utf-8") as f:
                    self.agents = json.load(f)
            except (OSError, json.JSONDecodeError) as e:
                logger.warning("Could not load agent names: %s", e)
                self.agents = {}
        else:
            self.agents = {}

    def _save_agents(self) -> None:
        """Save agent names to persistent storage."""
        try:
            with self.agents_file.open("w", encoding="utf-8") as f:
                json.dump(self.agents, f, indent=2)
        except OSError:
            logger.exception("Could not save agent names")

    def generate_name(
        self, spirit: AnimalSpirit | None = None, style: NamingStyle | None = None
    ) -> str:
        """Generate a new robot name."""
        config = NamingConfig(spirit=spirit, style=style, count=1)
        names = self.namer.generate_batch(config)
        return names[0].name if names else "Unknown-Unit-1"

    def assign_name(self, agent_id: str, name: str) -> bool:
        """Assign a name to an agent."""
        import time

        self.agents[agent_id] = {
            "name": name,
            "assigned_at": time.time(),
        }
        self._save_agents()
        logger.info("Assigned name '%s' to agent '%s'", name, agent_id)
        return True

    def get_name(self, agent_id: str) -> str | None:
        """Get the name of an agent."""
        agent_data = self.agents.get(agent_id, {})
        return agent_data.get("name") if isinstance(agent_data, dict) else None

    def list_agents(self) -> dict[str, str]:
        """List all agents and their names."""
        return {agent_id: data["name"] for agent_id, data in self.agents.items()}

    def create_agent_with_ecs(
        self,
        agent_id: str,
        spirit: AnimalSpirit | None = None,
        style: NamingStyle | None = None,
        name: str | None = None,
        parent1_id: str | None = None,
        parent2_id: str | None = None,
    ) -> dict[str, Any]:
        """Create agent with ECS integration and trait inheritance."""
        if not self.ecs_available:
            # Fallback to basic creation
            name = name or self.generate_name(spirit, style)
            self.assign_name(agent_id, name)
            return {"agent_id": agent_id, "name": name, "ecs_available": False}

        try:
            # Convert enums to strings for ECS world
            spirit_str = (
                spirit.value
                if hasattr(spirit, "value")
                else str(spirit) if spirit else "fox"
            )
            style_str = (
                style.value
                if hasattr(style, "value")
                else str(style) if style else "foundation"
            )

            # Create agent in ECS world
            entity = self.world_simulation.create_agent_with_inheritance(
                agent_id, spirit_str, style_str, name, parent1_id, parent2_id
            )

            # Get agent component for name
            from reynard_ecs_world import AgentComponent  # type: ignore

            agent_component = entity.get_component(AgentComponent)
            if agent_component and agent_component.name:
                name = agent_component.name
                self.assign_name(agent_id, name)

            # Nudge time forward for this action
            self.world_simulation.nudge_time(0.1)

            return {
                "agent_id": agent_id,
                "name": name,
                "entity_id": entity.id,
                "ecs_available": True,
                "persona": self.world_simulation.get_agent_persona(agent_id),
                "lora_config": self.world_simulation.get_lora_config(agent_id),
            }
        except Exception as e:
            logger.error("Failed to create ECS agent: %s", e)
            # Fallback to basic creation
            name = name or self.generate_name(spirit, style)
            self.assign_name(agent_id, name)
            return {
                "agent_id": agent_id,
                "name": name,
                "ecs_available": False,
                "error": str(e),
            }

    def get_agent_persona(self, agent_id: str) -> dict[str, Any | None]:
        """Get comprehensive agent persona from ECS system."""
        if self.ecs_available:
            return self.world_simulation.get_agent_persona(agent_id)
        return None

    def get_lora_config(self, agent_id: str) -> dict[str, Any | None]:
        """Get LoRA configuration for agent."""
        if self.ecs_available:
            return self.world_simulation.get_lora_config(agent_id)
        return None

    def update_simulation(self, delta_time: float | None = None) -> None:
        """Update ECS world simulation."""
        if self.ecs_available:
            self.world_simulation.update_simulation(delta_time)

    def nudge_time(self, amount: float = 0.1) -> None:
        """Nudge simulation time forward (for MCP actions)."""
        if self.ecs_available:
            self.world_simulation.nudge_time(amount)

    def get_simulation_status(self) -> dict[str, Any]:
        """Get comprehensive simulation status."""
        if self.ecs_available:
            return self.world_simulation.get_simulation_status()
        return {"ecs_available": False}

    def accelerate_time(self, factor: float) -> None:
        """Adjust time acceleration factor."""
        if self.ecs_available:
            self.world_simulation.accelerate_time(factor)

    def roll_agent_spirit(self, weighted: bool = True) -> AnimalSpirit:
        """Randomly select an animal spirit for agent initialization."""
        if weighted:
            # Weighted distribution: fox 40%, otter 35%, wolf 25%
            spirits = [
                AnimalSpirit.FOX,
                AnimalSpirit.FOX,
                AnimalSpirit.FOX,
                AnimalSpirit.FOX,
                AnimalSpirit.OTTER,
                AnimalSpirit.OTTER,
                AnimalSpirit.OTTER,
                AnimalSpirit.OTTER,
                AnimalSpirit.OTTER,
                AnimalSpirit.WOLF,
                AnimalSpirit.WOLF,
                AnimalSpirit.WOLF,
            ]
        else:
            # Equal distribution
            spirits = [AnimalSpirit.FOX, AnimalSpirit.OTTER, AnimalSpirit.WOLF]

        import random  # nosec B311

        return random.choice(spirits)

    def get_available_spirits(self) -> list[AnimalSpirit]:
        """Get list of available animal spirits."""
        return list(AnimalSpirit)

    def get_available_styles(self) -> list[NamingStyle]:
        """Get list of available naming styles."""
        return list(NamingStyle)

    def analyze_name(self, name: str) -> dict[str, str]:
        """Analyze a name to extract spirit and style information."""
        return self.namer.get_spirit_info(name)
