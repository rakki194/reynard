#!/usr/bin/env python3
"""
Agent Tool Handlers
===================

Handles agent-related MCP tool calls.
Follows the 100-line axiom and modular architecture principles.
"""

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
