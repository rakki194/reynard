"""
ECS Interaction Management Tools

MCP tools for managing agent interactions, relationships, and social dynamics
in the ECS world system.
"""

import json
import logging
from typing import Any

from ..protocol.tool_registry import register_tool
from ..services.ecs_client import ECSClient

logger = logging.getLogger(__name__)

# Initialize ECS client
ecs_client = ECSClient()


@register_tool(
    name="initiate_interaction",
    category="ecs",
    description="Initiate an interaction between two agents",
    execution_type="async",
    enabled=True
)
async def initiate_interaction(**kwargs) -> dict[str, Any]:
    """Initiate an interaction between two agents."""
    arguments = kwargs.get("arguments", {})
    agent1_id = arguments.get("agent1_id")
    agent2_id = arguments.get("agent2_id")
    interaction_type = arguments.get("interaction_type", "communication")

    if not agent1_id or not agent2_id:
        return {
            "content": [{
                "type": "text",
                "text": "❌ Error: Both agent1_id and agent2_id are required"
            }]
        }

    try:
        result = await ecs_client.initiate_interaction(
            agent1_id=agent1_id,
            agent2_id=agent2_id,
            interaction_type=interaction_type
        )

        if result:
            return {
                "content": [{
                    "type": "text",
                    "text": f"✅ Interaction initiated successfully between {agent1_id} and {agent2_id}\n"
                           f"Type: {interaction_type}\n"
                           f"Both agents are now engaged in interaction"
                }]
            }
        else:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ Failed to initiate interaction between {agent1_id} and {agent2_id}\n"
                           f"Possible reasons: agents not in proximity, insufficient social energy, or cooldown active"
                }]
            }

    except Exception as e:
        logger.error(f"Error initiating interaction: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error initiating interaction: {e}"
            }]
        }


@register_tool(
    name="get_relationship_status",
    category="ecs",
    description="Get relationship status between two agents",
    execution_type="async",
    enabled=True
)
async def get_relationship_status(**kwargs) -> dict[str, Any]:
    """Get relationship status between two agents."""
    arguments = kwargs.get("arguments", {})
    agent1_id = arguments.get("agent1_id")
    agent2_id = arguments.get("agent2_id")

    if not agent1_id or not agent2_id:
        return {
            "content": [{
                "type": "text",
                "text": "❌ Error: Both agent1_id and agent2_id are required"
            }]
        }

    try:
        result = await ecs_client.get_relationship_status(
            agent1_id=agent1_id,
            agent2_id=agent2_id
        )

        if "error" in result:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ Error: {result['error']}"
                }]
            }

        # Format relationship information
        rel_text = f"🤝 Relationship between {agent1_id} and {agent2_id}:\n\n"
        rel_text += f"Type: {result.get('relationship_type', 'unknown').title()}\n"
        rel_text += f"Strength: {result.get('strength', 0.0):.2f}\n"
        rel_text += f"Trust Level: {result.get('trust_level', 0.0):.2f}\n"
        rel_text += f"Familiarity: {result.get('familiarity', 0.0):.2f}\n"
        rel_text += f"Total Interactions: {result.get('interaction_count', 0)}\n"
        rel_text += f"Positive Interactions: {result.get('positive_interactions', 0)}\n"
        rel_text += f"Negative Interactions: {result.get('negative_interactions', 0)}\n"
        rel_text += f"Time Together: {result.get('total_time_together', 0.0):.1f}s\n"
        rel_text += f"Relationship Quality: {result.get('relationship_quality', 0.0):.2f}\n"
        
        if result.get('last_interaction'):
            rel_text += f"Last Interaction: {result['last_interaction']}\n"

        return {
            "content": [{
                "type": "text",
                "text": rel_text
            }]
        }

    except Exception as e:
        logger.error(f"Error getting relationship status: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error getting relationship status: {e}"
            }]
        }


@register_tool(
    name="get_interaction_stats",
    category="ecs",
    description="Get interaction statistics for an agent",
    execution_type="async",
    enabled=True
)
async def get_interaction_stats(**kwargs) -> dict[str, Any]:
    """Get interaction statistics for an agent."""
    arguments = kwargs.get("arguments", {})
    agent_id = arguments.get("agent_id")

    if not agent_id:
        return {
            "content": [{
                "type": "text",
                "text": "❌ Error: agent_id is required"
            }]
        }

    try:
        result = await ecs_client.get_interaction_stats(agent_id)

        if not result:
            return {
                "content": [{
                    "type": "text",
                    "text": f"❌ No interaction statistics found for agent {agent_id}"
                }]
            }

        stats_text = f"📊 Interaction Statistics for Agent {agent_id}:\n\n"
        stats_text += f"Total Interactions: {result.get('total_interactions', 0)}\n"
        stats_text += f"Successful Interactions: {result.get('successful_interactions', 0)}\n"
        stats_text += f"Failed Interactions: {result.get('failed_interactions', 0)}\n"
        stats_text += f"Success Rate: {result.get('success_rate', 0.0):.1%}\n\n"
        stats_text += f"Social Energy: {result.get('social_energy', 0.0):.2f}/{result.get('max_social_energy', 1.0):.2f}\n"
        stats_text += f"Energy Percentage: {result.get('energy_percentage', 0.0):.1%}\n"
        stats_text += f"Active Interactions: {result.get('active_interactions', 0)}\n\n"
        stats_text += f"Total Relationships: {result.get('total_relationships', 0)}\n"
        stats_text += f"Positive Relationships: {result.get('positive_relationships', 0)}\n"
        stats_text += f"Negative Relationships: {result.get('negative_relationships', 0)}\n"
        stats_text += f"Communication Style: {result.get('communication_style', 'unknown').title()}\n"

        return {
            "content": [{
                "type": "text",
                "text": stats_text
            }]
        }

    except Exception as e:
        logger.error(f"Error getting interaction stats: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error getting interaction stats: {e}"
            }]
        }


@register_tool(
    name="get_interaction_system_stats",
    category="ecs",
    description="Get comprehensive interaction system statistics",
    execution_type="async",
    enabled=True
)
async def get_interaction_system_stats(**kwargs) -> dict[str, Any]:
    """Get comprehensive interaction system statistics."""
    try:
        result = await ecs_client.get_interaction_system_stats()

        if not result:
            return {
                "content": [{
                    "type": "text",
                    "text": "❌ No interaction system statistics found"
                }]
            }

        stats_text = "📊 Interaction System Statistics:\n\n"
        stats_text += f"Agents with Interactions: {result.get('total_agents_with_interactions', 0)}\n"
        stats_text += f"Total Relationships: {result.get('total_relationships', 0)}\n"
        stats_text += f"Total Interactions: {result.get('total_interactions', 0)}\n"
        stats_text += f"Interactions Processed: {result.get('interactions_processed', 0)}\n\n"
        stats_text += f"Interaction Range: {result.get('interaction_range', 0.0):.1f} units\n"
        stats_text += f"Processing Interval: {result.get('processing_interval', 0.0):.1f}s\n"
        stats_text += f"Base Interaction Probability: {result.get('base_interaction_probability', 0.0):.3f}\n"

        return {
            "content": [{
                "type": "text",
                "text": stats_text
            }]
        }

    except Exception as e:
        logger.error(f"Error getting interaction system stats: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error getting interaction system stats: {e}"
            }]
        }


@register_tool(
    name="simulate_agent_meeting",
    category="ecs",
    description="Simulate a meeting between two agents to test interaction system",
    execution_type="async",
    enabled=True
)
async def simulate_agent_meeting(**kwargs) -> dict[str, Any]:
    """Simulate a meeting between two agents to test interaction system."""
    arguments = kwargs.get("arguments", {})
    agent1_id = arguments.get("agent1_id")
    agent2_id = arguments.get("agent2_id")
    interaction_count = arguments.get("interaction_count", 3)

    if not agent1_id or not agent2_id:
        return {
            "content": [{
                "type": "text",
                "text": "❌ Error: Both agent1_id and agent2_id are required"
            }]
        }

    try:
        # Get initial relationship status
        initial_rel = await ecs_client.get_relationship_status(agent1_id, agent2_id)
        
        # Simulate multiple interactions
        interaction_types = ["communication", "social", "collaboration"]
        successful_interactions = 0
        
        for i in range(interaction_count):
            interaction_type = interaction_types[i % len(interaction_types)]
            result = await ecs_client.initiate_interaction(
                agent1_id=agent1_id,
                agent2_id=agent2_id,
                interaction_type=interaction_type
            )
            if result:
                successful_interactions += 1

        # Get final relationship status
        final_rel = await ecs_client.get_relationship_status(agent1_id, agent2_id)
        
        # Calculate relationship change
        initial_strength = initial_rel.get('strength', 0.0)
        final_strength = final_rel.get('strength', 0.0)
        strength_change = final_strength - initial_strength

        result_text = f"🎭 Agent Meeting Simulation Complete!\n\n"
        result_text += f"Agents: {agent1_id} ↔ {agent2_id}\n"
        result_text += f"Interactions Attempted: {interaction_count}\n"
        result_text += f"Successful Interactions: {successful_interactions}\n\n"
        result_text += f"Relationship Changes:\n"
        result_text += f"  Initial Strength: {initial_strength:.2f}\n"
        result_text += f"  Final Strength: {final_strength:.2f}\n"
        result_text += f"  Change: {strength_change:+.2f}\n"
        result_text += f"  Final Type: {final_rel.get('relationship_type', 'unknown').title()}\n"
        result_text += f"  Total Interactions: {final_rel.get('interaction_count', 0)}\n"

        return {
            "content": [{
                "type": "text",
                "text": result_text
            }]
        }

    except Exception as e:
        logger.error(f"Error simulating agent meeting: {e}")
        return {
            "content": [{
                "type": "text",
                "text": f"❌ Error simulating agent meeting: {e}"
            }]
        }
