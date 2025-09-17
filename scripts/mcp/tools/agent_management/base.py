#!/usr/bin/env python3
"""
Base Agent Tools
================

Core agent management functionality.
Follows the 140-line axiom and modular architecture principles.
"""

from typing import Any

import sys
from pathlib import Path

# Add the agent naming package to the path
agent_naming_path = Path(__file__).parent.parent.parent.parent.parent / "services" / "agent-naming" / "reynard_agent_naming"
sys.path.insert(0, str(agent_naming_path))

from agent_naming import (
    AgentNameManager,
    AnimalSpirit,
    NamingStyle,
)
from services.version_service import VersionService


class BaseAgentTools:
    """Handles core agent-related tool operations."""

    def __init__(self, agent_manager: AgentNameManager):
        self.agent_manager = agent_manager
        self.version_service = VersionService()

    def generate_agent_name(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Generate a new robot name."""
        spirit_str = arguments.get("spirit")
        style_str = arguments.get("style")

        # Convert string to enum if provided
        spirit = AnimalSpirit(spirit_str) if spirit_str else None
        style = NamingStyle(style_str) if style_str else None

        name = self.agent_manager.generate_name(spirit, style)

        return {"content": [{"type": "text", "text": f"Generated name: {name}"}]}

    def assign_agent_name(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Assign a name to an agent."""
        agent_id = arguments.get("agent_id", "")
        name = arguments.get("name", "")
        success = self.agent_manager.assign_name(agent_id, name)

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Assigned name '{name}' to agent '{agent_id}': {success}",
                }
            ]
        }

    def get_agent_name(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get the current name of an agent."""
        agent_id = arguments.get("agent_id", "")
        name = self.agent_manager.get_name(agent_id)

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Agent '{agent_id}' name: {name or 'No name assigned'}",
                }
            ]
        }

    def list_agent_names(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """List all agents and their names."""
        _ = arguments  # Unused but required for interface consistency
        agents = self.agent_manager.list_agents()
        agent_list = "\n".join(
            [f"{agent_id}: {name}" for agent_id, name in agents.items()]
        )

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Assigned agent names:\n{agent_list or 'No agents assigned'}",
                }
            ]
        }

    def roll_agent_spirit(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Randomly select an animal spirit for agent initialization."""
        weighted = arguments.get("weighted", True)
        selected_spirit = self.agent_manager.roll_agent_spirit(weighted)

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Rolled spirit: {selected_spirit.value}",
                }
            ]
        }

    def _generate_unique_agent_id(self) -> str:
        """Generate a unique agent ID based on timestamp and random number."""
        import random
        import time

        return f"agent-{int(time.time())}-{random.randint(1000, 9999)}"

    def _get_version_info(self) -> dict[str, Any]:
        """Get simplified version information for startup."""
        return {
            "python": {"available": True, "version": "3.13.7"},
            "node": {"available": True, "version": "v24.8.0"},
            "npm": {"available": True, "version": "11.6.0"},
            "pnpm": {"available": True, "version": "8.15.0"},
            "typescript": {"available": True, "version": "5.9.2"},
        }
