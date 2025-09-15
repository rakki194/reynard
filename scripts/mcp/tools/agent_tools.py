#!/usr/bin/env python3
"""
Agent Tool Handlers
===================

Handles agent-related MCP tool calls.
Follows the 100-line axiom and modular architecture principles.
"""

import random
from typing import Any

from services.agent_manager import AgentNameManager


class AgentTools:
    """Handles agent-related tool operations."""

    def __init__(self, agent_manager: AgentNameManager):
        self.agent_manager = agent_manager

    def generate_agent_name(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Generate a new robot name."""
        spirit = arguments.get("spirit")
        style = arguments.get("style")
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

    def list_agent_names(self, arguments: dict[str, Any]) -> dict[str, Any]:  # pylint: disable=unused-argument
        """List all agents and their names."""
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

        if weighted:
            # Weighted distribution: fox 40%, otter 35%, wolf 25%
            spirits = [
                "fox",
                "fox",
                "fox",
                "fox",
                "otter",
                "otter",
                "otter",
                "otter",
                "otter",
                "wolf",
                "wolf",
                "wolf",
            ]
        else:
            # Equal distribution
            spirits = ["fox", "otter", "wolf"]

        selected_spirit = random.choice(spirits)

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Rolled spirit: {selected_spirit}",
                }
            ]
        }

    def agent_startup_sequence(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Complete agent initialization sequence with random spirit selection."""
        agent_id = arguments.get("agent_id", "current-session")
        preferred_style = arguments.get("preferred_style")
        force_spirit = arguments.get("force_spirit")

        # Roll spirit if not forced
        if force_spirit:
            spirit = force_spirit
        else:
            # Use weighted distribution for natural balance
            spirits = [
                "fox",
                "fox",
                "fox",
                "fox",
                "otter",
                "otter",
                "otter",
                "otter",
                "otter",
                "wolf",
                "wolf",
                "wolf",
            ]
            spirit = random.choice(spirits)

        # Select style if not specified
        if not preferred_style:
            styles = [
                "foundation",
                "exo",
                "hybrid",
                "cyberpunk",
                "mythological",
                "scientific",
            ]
            preferred_style = random.choice(styles)

        # Generate and assign name
        name = self.agent_manager.generate_name(spirit, preferred_style)
        success = self.agent_manager.assign_name(agent_id, name)

        startup_text = (
            f"🎯 Agent Startup Complete!\n"
            f"🦊 Spirit: {spirit}\n"
            f"🎨 Style: {preferred_style}\n"
            f"📛 Name: {name}\n"
            f"✅ Assigned: {success}\n"
            f"🆔 Agent ID: {agent_id}"
        )

        return {
            "content": [
                {
                    "type": "text",
                    "text": startup_text,
                }
            ]
        }
