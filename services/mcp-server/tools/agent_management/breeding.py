#!/usr/bin/env python3
"""
Agent Breeding Tools
====================

Breeding, lineage, and genetic compatibility tools for agents.
Follows the 140-line axiom and modular architecture principles.
"""

import sys
from pathlib import Path
from typing import Any

# Legacy agent-naming system removed - now using FastAPI ECS backend
from services.backend_agent_manager import BackendAgentManager


class BreedingAgentTools:
    """Handles agent breeding, lineage, and genetic compatibility."""

    def __init__(self, agent_manager: BackendAgentManager):
        self.agent_manager = agent_manager

    def create_offspring(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Create offspring agent from two parent agents using ECS system."""
        parent1_id = arguments.get("parent1_id", "")
        parent2_id = arguments.get("parent2_id", "")
        offspring_id = arguments.get("offspring_id", "")

        if not all([parent1_id, parent2_id, offspring_id]):
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "Error: All parameters (parent1_id, parent2_id, offspring_id) are required",
                    }
                ]
            }

        if not self.agent_manager.ecs_available:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "ECS system not available. Cannot create offspring.",
                    }
                ]
            }

        try:
            # Create offspring using ECS system
            result = self.agent_manager.create_agent_with_ecs(
                offspring_id, parent1_id=parent1_id, parent2_id=parent2_id
            )

            if result.get("ecs_available", False):
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                f"Created offspring {offspring_id} with name '{result['name']}'\n"
                                f"Parents: {parent1_id}, {parent2_id}\n"
                                f"ECS Entity: {result.get('entity_id', 'N/A')}"
                            ),
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"Failed to create offspring: {result.get('error', 'Unknown error')}",
                        }
                    ]
                }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error creating offspring: {str(e)}",
                    }
                ]
            }

    def get_agent_lineage(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Get family tree and lineage information for an agent using ECS system."""
        agent_id = arguments.get("agent_id", "")
        depth = arguments.get("depth", 3)

        if not agent_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "Error: agent_id is required",
                    }
                ]
            }

        if not self.agent_manager.ecs_available:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "ECS system not available. Cannot retrieve lineage.",
                    }
                ]
            }

        try:
            # Get lineage from ECS system
            lineage_data = self.agent_manager.world_simulation.get_agent_lineage(
                agent_id, depth
            )

            if lineage_data:
                lineage_text = self._format_lineage_response(agent_id, lineage_data)
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": lineage_text,
                        }
                    ]
                }
            else:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"Agent {agent_id} not found or has no lineage data",
                        }
                    ]
                }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error getting lineage: {str(e)}",
                    }
                ]
            }

    def analyze_genetic_compatibility(
        self, arguments: dict[str, Any]
    ) -> dict[str, Any]:
        """Analyze genetic compatibility between two agents using ECS system."""
        agent1_id = arguments.get("agent1_id", "")
        agent2_id = arguments.get("agent2_id", "")

        if not all([agent1_id, agent2_id]):
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "Error: Both agent1_id and agent2_id are required",
                    }
                ]
            }

        if not self.agent_manager.ecs_available:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "ECS system not available. Cannot analyze compatibility.",
                    }
                ]
            }

        try:
            # Analyze compatibility using ECS system
            compatibility_data = (
                self.agent_manager.world_simulation.analyze_genetic_compatibility(
                    agent1_id, agent2_id
                )
            )

            compatibility = compatibility_data.get("compatibility", 0.0)
            analysis = compatibility_data.get("analysis", "No analysis available")
            recommended = compatibility_data.get("recommended", False)

            result_text = self._format_compatibility_response(
                compatibility, analysis, recommended
            )

            return {
                "content": [
                    {
                        "type": "text",
                        "text": result_text,
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error analyzing compatibility: {str(e)}",
                    }
                ]
            }

    def find_compatible_mates(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Find agents with compatible traits for breeding using ECS system."""
        agent_id = arguments.get("agent_id", "")
        max_results = arguments.get("max_results", 5)

        if not agent_id:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "Error: agent_id is required",
                    }
                ]
            }

        if not self.agent_manager.ecs_available:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": "ECS system not available. Cannot find compatible mates.",
                    }
                ]
            }

        try:
            # Find compatible mates using ECS system
            compatible_mates = (
                self.agent_manager.world_simulation.find_compatible_mates(
                    agent_id, max_results
                )
            )

            if not compatible_mates:
                return {
                    "content": [
                        {
                            "type": "text",
                            "text": f"No compatible mates found for agent {agent_id}",
                        }
                    ]
                }

            mates_text = self._format_mates_response(agent_id, compatible_mates)

            return {
                "content": [
                    {
                        "type": "text",
                        "text": mates_text,
                    }
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"Error finding compatible mates: {str(e)}",
                    }
                ]
            }

    def _format_lineage_response(self, agent_id: str, lineage_data: dict) -> str:
        """Format lineage response text."""
        lineage_text = f"Lineage for {agent_id}:\n"
        lineage_text += f"Generation: {lineage_data.get('generation', 'Unknown')}\n"

        ancestors = lineage_data.get("ancestors", [])
        descendants = lineage_data.get("descendants", [])

        if ancestors:
            lineage_text += f"Ancestors: {len(ancestors)} found\n"
        if descendants:
            lineage_text += f"Descendants: {len(descendants)} found\n"

        return lineage_text

    def _format_compatibility_response(
        self, compatibility: float, analysis: str, recommended: bool
    ) -> str:
        """Format genetic compatibility response text."""
        result_text = "Genetic Compatibility Analysis:\n"
        result_text += (
            f"Compatibility Score: {compatibility:.2f} ({compatibility * 100:.0f}%)\n"
        )
        result_text += f"Analysis: {analysis}\n"
        result_text += f"Recommended for breeding: {'Yes' if recommended else 'No'}\n"

        return result_text

    def _format_mates_response(self, agent_id: str, compatible_mates: list) -> str:
        """Format compatible mates response text."""
        mates_text = f"Compatible mates for {agent_id}:\n"
        for i, mate_data in enumerate(compatible_mates, 1):
            mate_id = mate_data.get("agent_id", "Unknown")
            mate_name = mate_data.get("name", mate_id)
            compatibility = mate_data.get("compatibility", 0.0)
            mates_text += (
                f"{i}. {mate_name} ({mate_id}) - {compatibility:.2f} compatibility\n"
            )

        return mates_text
