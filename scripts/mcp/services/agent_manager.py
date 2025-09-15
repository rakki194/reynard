#!/usr/bin/env python3
"""
Agent Name Manager Service
==========================

Manages agent names and persistence for the MCP server.
Follows the 100-line axiom and modular architecture principles.
"""

import asyncio
import json
import logging

# Add current directory to path to import our robot name generator
import sys
from pathlib import Path

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

logger = logging.getLogger(__name__)


class AgentNameManager:
    """Manages agent names and persistence."""

    def __init__(self, data_dir: str | None = None):
        self.data_dir = Path(data_dir) if data_dir else Path(__file__).parent.parent
        self.agents_file = self.data_dir / "agent-names.json"
        self.namer = ReynardRobotNamer()
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
