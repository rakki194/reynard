#!/usr/bin/env python3
"""
ECS Agent Tools
===============

MCP tool handlers for ECS-based agent management.
Provides tools for creating, managing, and automating agent systems.

Follows the 140-line axiom and modular architecture principles.
"""

import logging
from typing import Any

from ecs.world import AgentWorld

logger = logging.getLogger(__name__)


class ECSAgentTools:
    """Handles ECS-based agent tool operations."""

    def __init__(self, data_dir: str | None = None):
        """Initialize ECS agent tools."""
        self.world = AgentWorld(data_dir)
        self.automatic_reproduction = True
        # Enable automatic reproduction by default in the world
        self.world.enable_automatic_reproduction(True)

    def create_ecs_agent(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Create a new agent using ECS system."""
        agent_id = arguments.get("agent_id", "")
        spirit = arguments.get("spirit")
        style = arguments.get("style")
        name = arguments.get("name")

        # Generate a proper agent ID if a generic one is provided
        if not agent_id or agent_id in [
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
        ]:
            import random
            import time

            agent_id = f"agent-{int(time.time())}-{random.randint(1000, 9999)}"

        try:
            entity = self.world.create_agent(agent_id, spirit, style, name)

            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Created ECS agent {agent_id} with entity {entity.id}",
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to create ECS agent: {e}"}
                ]
            }

    def create_ecs_offspring(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Create offspring using ECS system."""
        parent1_id = arguments.get("parent1_id", "")
        parent2_id = arguments.get("parent2_id", "")
        offspring_id = arguments.get("offspring_id", "")

        # Generate a proper offspring ID if a generic one is provided
        if not offspring_id or offspring_id in [
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
            "offspring",
            "child",
        ]:
            import random
            import time

            offspring_id = f"offspring-{int(time.time())}-{random.randint(1000, 9999)}"

        try:
            self.world.create_offspring(parent1_id, parent2_id, offspring_id)

            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Created ECS offspring {offspring_id} from parents {parent1_id} and {parent2_id}",
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to create ECS offspring: {e}"}
                ]
            }

    def enable_automatic_reproduction(
        self, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Enable or disable automatic reproduction."""
        enabled = arguments.get("enabled", True)

        self.world.enable_automatic_reproduction(enabled)
        self.automatic_reproduction = enabled

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Automatic reproduction {'enabled' if enabled else 'disabled'}",
                }
            ]
        }

    def get_ecs_agent_status(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get status of all ECS agents."""
        try:
            agents = self.world.get_agent_entities()
            mature_agents = self.world.get_mature_agents()

            status_text = "ECS Agent Status:\n"
            status_text += f"Total agents: {len(agents)}\n"
            status_text += f"Mature agents: {len(mature_agents)}\n"
            status_text += f"Automatic reproduction: {'enabled' if self.automatic_reproduction else 'disabled'}\n"

            return {"content": [{"type": "text", "text": status_text}]}
        except Exception as e:
            return {
                "content": [{"type": "text", "text": f"Failed to get ECS status: {e}"}]
            }

    def find_ecs_compatible_mates(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Find compatible mates for an agent."""
        agent_id = arguments.get("agent_id", "")
        max_results = arguments.get("max_results", 5)

        try:
            mates = self.world.find_compatible_mates(agent_id, max_results)

            mates_text = f"Compatible mates for {agent_id}:\n"
            for mate_id in mates:
                mates_text += f"- {mate_id}\n"

            return {"content": [{"type": "text", "text": mates_text}]}
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to find compatible mates: {e}"}
                ]
            }

    def analyze_ecs_compatibility(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Analyze genetic compatibility between two agents."""
        agent1_id = arguments.get("agent1_id", "")
        agent2_id = arguments.get("agent2_id", "")

        try:
            compatibility = self.world.analyze_genetic_compatibility(
                agent1_id, agent2_id
            )

            compat_text = "Compatibility Analysis:\n"
            compat_text += f"Agent 1: {agent1_id}\n"
            compat_text += f"Agent 2: {agent2_id}\n"
            compat_text += (
                f"Compatibility: {compatibility.get('compatibility', 0):.2f}\n"
            )
            compat_text += f"Analysis: {compatibility.get('analysis', 'N/A')}\n"
            compat_text += f"Recommended: {compatibility.get('recommended', False)}"

            return {"content": [{"type": "text", "text": compat_text}]}
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to analyze compatibility: {e}"}
                ]
            }

    def get_ecs_lineage(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get agent lineage information."""
        agent_id = arguments.get("agent_id", "")
        depth = arguments.get("depth", 3)

        try:
            lineage = self.world.get_agent_lineage(agent_id, depth)

            lineage_text = f"Lineage for {agent_id}:\n"
            lineage_text += f"Parents: {lineage.get('parents', [])}\n"
            lineage_text += f"Children: {lineage.get('children', [])}\n"
            lineage_text += f"Ancestors: {lineage.get('ancestors', [])}\n"
            lineage_text += f"Descendants: {lineage.get('descendants', [])}"

            return {"content": [{"type": "text", "text": lineage_text}]}
        except Exception as e:
            return {
                "content": [{"type": "text", "text": f"Failed to get lineage: {e}"}]
            }

    def update_ecs_world(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Update the ECS world (simulate time passage)."""
        delta_time = arguments.get("delta_time", 1.0)

        try:
            self.world.update(delta_time)
            self.world.cleanup_destroyed_entities()

            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"ECS world updated with delta_time={delta_time}",
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"Failed to update ECS world: {e}"}
                ]
            }
