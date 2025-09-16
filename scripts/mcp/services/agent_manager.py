#!/usr/bin/env python3
"""
Agent Name Manager Service
==========================

Manages agent names and persistence for the MCP server with ECS integration.
Follows the 100-line axiom and modular architecture principles.
"""

import asyncio
import json
import logging

# Add current directory to path to import our robot name generator
import sys
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from robot_name_generator import ReynardRobotNamer
except ImportError as exc:
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
        raise ImportError("Could not load robot name generator module") from exc

    robot_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(robot_module)
    ReynardRobotNamer = robot_module.ReynardRobotNamer

# Enhanced agent manager removed - using ECS system only

# Import ECS world simulation
try:
    from ecs.components import AgentComponent
    from ecs.world_simulation import WorldSimulation

    ECS_AVAILABLE = True
except ImportError:
    ECS_AVAILABLE = False

logger = logging.getLogger(__name__)


class AgentNameManager:
    """Manages agent names and persistence with ECS integration."""

    def __init__(self, data_dir: str | None = None):
        self.data_dir = Path(data_dir) if data_dir else Path(__file__).parent.parent
        self.agents_file = self.data_dir / "agent-names.json"
        self.namer = ReynardRobotNamer()

        # Enhanced manager removed - using ECS system only

        # Initialize ECS world simulation
        if ECS_AVAILABLE:
            try:
                self.world_simulation = WorldSimulation(self.data_dir)
                self.ecs_available = True
            except Exception as e:
                logger.warning("ECS world simulation not available: %s", e)
                self.ecs_available = False
        else:
            self.ecs_available = False

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

    def generate_name(self, spirit: str | None = None, style: str | None = None) -> str:
        """Generate a new robot name."""
        names = self.namer.generate_batch(1, spirit, style)
        return names[0] if names else "Unknown-Unit-1"

    def assign_name(self, agent_id: str, name: str) -> bool:
        """Assign a name to an agent."""
        self.agents[agent_id] = {
            "name": name,
            "assigned_at": asyncio.get_event_loop().time(),
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
        spirit: str | None = None,
        style: str | None = None,
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
            # Create agent in ECS world
            entity = self.world_simulation.create_agent_with_inheritance(
                agent_id, spirit, style, name, parent1_id, parent2_id
            )

            # Get agent component for name
            agent_component = entity.get_component(AgentComponent)
            if agent_component:
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
            logger.error(f"Failed to create ECS agent: {e}")
            # Fallback to basic creation
            name = name or self.generate_name(spirit, style)
            self.assign_name(agent_id, name)
            return {
                "agent_id": agent_id,
                "name": name,
                "ecs_available": False,
                "error": str(e),
            }

    def get_agent_persona(self, agent_id: str) -> dict[str, Any] | None:
        """Get comprehensive agent persona from ECS system."""
        if self.ecs_available:
            return self.world_simulation.get_agent_persona(agent_id)
        return None

    def get_lora_config(self, agent_id: str) -> dict[str, Any] | None:
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
